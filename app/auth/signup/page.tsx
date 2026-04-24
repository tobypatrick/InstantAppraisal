'use client'

import { InstantAppraisalLogo } from '@/components/ui/instant-appraisal-logo'
import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <InstantAppraisalLogo height={32} />
        </div>
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <SignupForm onSwitchToLogin={() => {}} />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
