'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, RotateCw } from 'lucide-react'
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
  const [verificationPending, setVerificationPending] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const supabase = createClient()

  const emailRedirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback?next=checkout`
    : '/auth/callback?next=checkout'

  useEffect(() => {
    if (resendCooldown <= 0) return
    const interval = setInterval(() => setResendCooldown((p) => Math.max(0, p - 1)), 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || !pendingEmail) return
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: pendingEmail, options: { emailRedirectTo: emailRedirectUrl } })
      if (error) throw error
      setResendCooldown(60)
      toast.success('Verification email sent', { description: `Resent to ${pendingEmail}.` })
    } catch (err: any) {
      toast.error('Could not resend', { description: err.message })
    }
  }, [pendingEmail, resendCooldown, supabase, emailRedirectUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password too short', { description: 'Must be at least 6 characters.' })
      return
    }
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: emailRedirectUrl, data: { full_name: fullName } },
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
          if (res.ok && checkoutData?.url) { window.location.href = checkoutData.url; return }
        } catch {
          window.location.href = getDashboardUrl()
          return
        }
      }

      setPendingEmail(email)
      setVerificationPending(true)
    } catch (error: any) {
      toast.error('Sign up failed', { description: error.message || 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (verificationPending) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-accent" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We've sent a verification link to <span className="font-medium text-foreground">{pendingEmail}</span>.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Didn't receive it? Check your spam folder or resend below.</p>
          <Button variant="outline" className="w-full h-10" disabled={resendCooldown > 0} onClick={handleResend}>
            <RotateCw className="h-4 w-4 mr-2" strokeWidth={1.5} />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Wrong email?{' '}
          <button type="button" onClick={() => { setVerificationPending(false); setPendingEmail('') }} className="text-accent hover:underline font-medium">
            Try again
          </button>
        </p>
      </div>
    )
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
