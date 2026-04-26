'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { InstantAppraisalLogo } from '@/components/ui/instant-appraisal-logo'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password too short', { description: 'Must be at least 6 characters.' })
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setIsDone(true)
    } catch (error: any) {
      toast.error('Failed to update password', { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <InstantAppraisalLogo height={40} />
        </div>
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          {isDone ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Password updated</h3>
              <p className="text-sm text-muted-foreground">Your password has been changed successfully.</p>
              <Button className="w-full" onClick={() => window.location.href = '/auth/login'}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-foreground">Set new password</h3>
                <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 pl-9 pr-10 text-sm" disabled={isLoading} required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-10 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                {isLoading
                  ? <span className="flex items-center gap-2"><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Updating...</span>
                  : <span className="flex items-center gap-2">Update Password<ArrowRight className="h-4 w-4" strokeWidth={1.5} /></span>}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
