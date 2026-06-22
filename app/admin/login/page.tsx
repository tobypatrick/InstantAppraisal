'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LeadAgentLogo } from '@/components/ui/LeadAgentLogo'

// Standalone admin login — deliberately separate from the agent dashboard login.
// Lives at admin.instantappraisal.co/login.
export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError || !data.user) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }

    // Only admin-role accounts may enter. Non-admin accounts are signed straight back out.
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!role) {
      await supabase.auth.signOut()
      setError('This account does not have admin access.')
      setLoading(false)
      return
    }

    window.location.href = '/overview'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <LeadAgentLogo height={30} />
          <span className="text-xs uppercase tracking-wide text-emerald-700 bg-emerald-50 rounded px-1.5 py-0.5">Admin</span>
        </div>
        <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="h-10 w-full rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
