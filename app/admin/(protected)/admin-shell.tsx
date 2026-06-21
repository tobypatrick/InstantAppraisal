'use client'

import { createClient } from '@/lib/supabase/client'

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">InstantAppraisal</span>
            <span className="text-xs uppercase tracking-wide text-emerald-700 bg-emerald-50 rounded px-1.5 py-0.5">Admin</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="hidden sm:inline">{email}</span>
            <button onClick={signOut} className="text-slate-600 hover:text-slate-900">Sign out</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
