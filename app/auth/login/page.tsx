'use client'

import { useState } from 'react'
import { InstantAppraisalLogo } from '@/components/ui/instant-appraisal-logo'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

type View = 'login' | 'signup' | 'forgot'

export default function LoginPage() {
  const [view, setView] = useState<View>('login')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <InstantAppraisalLogo height={32} />
        </div>
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          {view === 'login' && (
            <LoginForm
              onSwitchToSignup={() => setView('signup')}
              onForgotPassword={() => setView('forgot')}
            />
          )}
          {view === 'signup' && (
            <SignupForm onSwitchToLogin={() => setView('login')} />
          )}
          {view === 'forgot' && (
            <ForgotPasswordForm onBackToLogin={() => setView('login')} />
          )}
        </div>
      </div>
    </div>
  )
}
