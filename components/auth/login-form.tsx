'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getDashboardUrl } from '@/lib/subdomain'

interface LoginFormProps {
  onSwitchToSignup: () => void
  onForgotPassword?: () => void
}

export function LoginForm({ onSwitchToSignup, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleUserDetected, setGoogleUserDetected] = useState(false)
  const [passwordSetupSent, setPasswordSetupSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setGoogleUserDetected(false)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      window.location.href = getDashboardUrl()
    } catch (error: any) {
      try {
        const { data } = await supabase.functions.invoke('check-auth-method', { body: { email } })
        if (data?.needs_password) {
          setGoogleUserDetected(true)
          setIsLoading(false)
          return
        }
      } catch {
        // fall through to normal error
      }
      toast.error('Sign in failed', { description: error.message || 'Please check your credentials and try again.' })
      setIsLoading(false)
    }
  }

  const handleSendPasswordSetup = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setPasswordSetupSent(true)
    } catch (error: any) {
      toast.error('Failed to send link', { description: error.message || 'Please try again.' })
    }
    setIsLoading(false)
  }

  if (passwordSetupSent) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 py-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-accent" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Check your email</h3>
          <p className="text-sm text-muted-foreground mt-1.5">
            We've sent a password setup link to <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>
        <Button variant="outline" className="w-full h-10 text-sm" onClick={() => { setPasswordSetupSent(false); setGoogleUserDetected(false) }}>
          Back to sign in
        </Button>
      </motion.div>
    )
  }

  if (googleUserDetected) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 py-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
          <KeyRound className="h-6 w-6 text-accent" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground">Set up email login</h3>
          <p className="text-sm text-muted-foreground mt-1.5">
            Your account was created with Google sign-in. We'll send you a link to set your password.
          </p>
        </div>
        <Button className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleSendPasswordSetup} disabled={isLoading}>
          {isLoading ? <Spinner label="Sending…" /> : <><Mail className="h-4 w-4" strokeWidth={1.5} /> Send password setup link</>}
        </Button>
        <Button variant="outline" className="w-full h-10 text-sm" onClick={() => setGoogleUserDetected(false)}>
          Back to sign in
        </Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 pl-9 pr-10 text-sm" disabled={isLoading} required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>
        {onForgotPassword && (
          <div className="text-right mt-1">
            <button type="button" onClick={onForgotPassword} className="text-xs text-muted-foreground hover:text-accent transition-colors">
              Forgot password?
            </button>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
        {isLoading ? <Spinner label="Signing in..." /> : <><span>Sign In</span><ArrowRight className="h-4 w-4" strokeWidth={1.5} /></>}
      </Button>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToSignup} className="text-accent hover:underline font-medium">Create one</button>
      </p>
    </form>
  )
}

function Spinner({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2">
      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
      {label}
    </span>
  )
}
