import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Users, CreditCard, TrendingUp, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'

export const metadata = { title: 'Admin | InstantAppraisal' }

const TIER_MRR: Record<string, number> = { pro: 97, elite: 247, launch: 47 }

export default async function AdminPage() {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [profilesRes, billingRes, leadsRes, usersRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, slug, created_at').order('created_at', { ascending: false }),
    supabase.from('billing').select('user_id, subscription_status, subscription_tier'),
    supabase.from('leads').select('agent_id').gte('created_at', startOfMonth.toISOString()),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const profiles = profilesRes.data || []
  const billing = billingRes.data || []
  const leads = leadsRes.data || []
  const users = usersRes.data?.users || []

  const billingMap = Object.fromEntries(billing.map(b => [b.user_id, b]))
  const emailMap = Object.fromEntries(users.map(u => [u.id, u.email]))
  const leadsThisMonth = leads.reduce((acc, l) => {
    acc[l.agent_id] = (acc[l.agent_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const activeSubscriptions = billing.filter(b => ['active', 'trialing'].includes(b.subscription_status || ''))
  const estimatedMRR = activeSubscriptions.reduce((sum, b) => sum + (TIER_MRR[b.subscription_tier || ''] || 0), 0)
  const totalLeadsMonth = leads.length

  const stats = [
    { label: 'Total Agents', value: profiles.length, icon: Users, color: 'text-blue-600' },
    { label: 'Active Subscriptions', value: activeSubscriptions.length, icon: CreditCard, color: 'text-emerald-600' },
    { label: 'Leads This Month', value: totalLeadsMonth, icon: BarChart3, color: 'text-purple-600' },
    { label: 'Est. MRR', value: `$${estimatedMRR.toLocaleString()}`, icon: TrendingUp, color: 'text-orange-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Admin</h1>
        <p className="text-sm text-slate-500 mt-1">Platform overview and agent management.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`h-4 w-4 ${color}`} strokeWidth={1.5} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Agents table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">All Agents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Agent</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Email</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Plan</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Status</th>
                <th className="text-right px-4 py-2.5 text-slate-500 font-medium">Leads/mo</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const b = billingMap[p.id]
                const isActive = ['active', 'trialing'].includes(b?.subscription_status || '')
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{p.full_name || '—'}</p>
                      <p className="text-slate-400">/{p.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{emailMap[p.id] || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-slate-700">{b?.subscription_tier || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {b?.subscription_status || 'none'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{leadsThisMonth[p.id] || 0}</td>
                    <td className="px-4 py-3 text-slate-500">{p.created_at ? format(new Date(p.created_at), 'd MMM yyyy') : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
