'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setIsSuccess(true)
    } catch (error: any) {
      toast.error('Failed to send reset email', { description: error.message || 'Please check your email and try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Didn't receive it?{' '}
          <button type="button" onClick={() => setIsSuccess(false)} className="text-accent hover:underline">try again</button>
        </p>
        <Button variant="outline" className="w-full mt-4" onClick={onBackToLogin}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to sign in
        </Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Forgot your password?</h3>
        <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reset-email" className="text-sm">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input id="reset-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 pl-9 text-sm" disabled={isLoading} required />
        </div>
      </div>
      <Button type="submit" className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
        {isLoading
          ? <span className="flex items-center gap-2"><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Sending...</span>
          : <span className="flex items-center gap-2">Send Reset Link<ArrowRight className="h-4 w-4" strokeWidth={1.5} /></span>}
      </Button>
      <div className="mt-5 text-center">
        <button type="button" onClick={onBackToLogin} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </button>
      </div>
    </form>
  )
}
