'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getDashboardUrl } from '@/lib/subdomain'
import { trackMarketingEvent } from '@/lib/marketing-tracking'

interface SignupFormProps {
  onSwitchToLogin: () => void
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password too short', { description: 'Must be at least 6 characters.' })
      return
    }
    setIsLoading(true)

    try {
      // Email confirmation is disabled, so signUp returns a session immediately —
      // no "check your email" step. Send the new agent straight to checkout.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error

      // Marketing conversion: account created.
      trackMarketingEvent('sign_up', 'CompleteRegistration')

      if (data.session) {
        try {
          const res = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({ tier: 'pro', interval: 'month' }),
          })
          const checkoutData = await res.json()
          if (res.ok && checkoutData?.url) {
            window.location.href = checkoutData.url
            return
          }
        } catch {
          // checkout failed to start — fall through to the dashboard
        }
        window.location.href = getDashboardUrl()
        return
      }

      // No session and no error → Supabase obfuscates that the email is already
      // registered (to prevent enumeration). Nudge them to sign in.
      toast.error('Account already exists', { description: 'This email is already registered — please sign in instead.' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      toast.error('Sign up failed', { description: message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName" className="text-sm">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input id="fullName" type="text" placeholder="John Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-10 pl-9 text-sm" disabled={isLoading} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 pl-9 text-sm" disabled={isLoading} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 pl-9 pr-10 text-sm" disabled={isLoading} required minLength={6} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
      </div>

      <Button type="submit" className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
        {isLoading
          ? <span className="flex items-center gap-2"><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Creating account...</span>
          : <span className="flex items-center gap-2">Create Account<ArrowRight className="h-4 w-4" strokeWidth={1.5} /></span>}
      </Button>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-accent hover:underline font-medium">Sign in</button>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our Terms &amp; Conditions and Privacy Policy.
      </p>
    </form>
  )
}
