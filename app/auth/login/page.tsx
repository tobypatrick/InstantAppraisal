'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Users, BarChart3 } from 'lucide-react'
import { LeadAgentLogo } from '@/components/ui/LeadAgentLogo'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

type View = 'login' | 'signup' | 'forgot'

const FEATURES = [
  { icon: Sparkles, text: 'Custom branding & colors' },
  { icon: Users, text: 'Instant lead capture' },
  { icon: BarChart3, text: 'Source attribution & analytics' },
]

export default function LoginPage() {
  const [view, setView] = useState<View>('login')

  return (
    <div className="min-h-dvh flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <LeadAgentLogo height={24} dark />
          </Link>
          <h1 className="text-3xl xl:text-4xl font-semibold text-white mb-4 leading-tight tracking-tight">
            Capture property leads with your personalised landing page
          </h1>
          <p className="text-white/70 text-base mb-10 max-w-md">
            Create a branded experience, track lead sources, and convert visitors into clients.
          </p>
          <div className="space-y-4">
            {FEATURES.map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                  <item.icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 py-12 bg-background overflow-y-auto">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden flex items-center justify-center mb-8">
            <LeadAgentLogo height={20} />
          </Link>

          <h2 className="text-xl font-semibold text-foreground mb-1 text-center lg:text-left">
            {view === 'login' ? 'Welcome back' : view === 'signup' ? 'Create your account' : 'Reset password'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 text-center lg:text-left">
            {view === 'login'
              ? 'Sign in to access your dashboard'
              : view === 'signup'
              ? 'Get started with your lead capture page'
              : "We'll send you a reset link"}
          </p>

          {view === 'login' && <LoginForm onSwitchToSignup={() => setView('signup')} onForgotPassword={() => setView('forgot')} />}
          {view === 'signup' && <SignupForm onSwitchToLogin={() => setView('login')} />}
          {view === 'forgot' && <ForgotPasswordForm onBackToLogin={() => setView('login')} />}
        </div>
      </div>
    </div>
  )
}
