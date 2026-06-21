import { createClient as createServiceClient } from '@supabase/supabase-js'
import { AgentsTable, type AdminAgent } from '@/components/admin/agents-table'

export const metadata = { title: 'Overview | Admin' }

// Monthly recurring revenue per active tier. Mirrors the values used elsewhere.
const TIER_MRR: Record<string, number> = { pro: 99, elite: 199 }

export default async function AdminOverviewPage() {
  // Service-role client: admin needs to read every agent's data, bypassing RLS.
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const [profilesRes, billingRes, leadsRes, usersRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, agency_name, slug, created_at').order('created_at', { ascending: false }),
    supabase.from('billing').select('user_id, subscription_status, subscription_tier'),
    supabase.from('leads').select('agent_id, status'),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const profiles = profilesRes.data || []
  const billing = billingRes.data || []
  const leads = leadsRes.data || []
  const users = usersRes.data?.users || []

  const billingMap = Object.fromEntries(billing.map((b) => [b.user_id, b]))
  const emailMap = Object.fromEntries(users.map((u) => [u.id, u.email ?? '']))

  // Per-agent + platform-wide lead split (complete = finished the contact form,
  // incomplete = searched an address but did not finish).
  const leadsPerAgent: Record<string, { complete: number; incomplete: number }> = {}
  let leadsComplete = 0
  let leadsIncomplete = 0
  for (const l of leads) {
    const complete = l.status === 'complete'
    if (complete) leadsComplete++
    else leadsIncomplete++
    if (!l.agent_id) continue
    const bucket = (leadsPerAgent[l.agent_id] ||= { complete: 0, incomplete: 0 })
    if (complete) bucket.complete++
    else bucket.incomplete++
  }

  const activeSubscriptions = billing.filter((b) => b.subscription_status === 'active').length
  const trials = billing.filter((b) => b.subscription_status === 'trialing').length
  const mrr = billing
    .filter((b) => b.subscription_status === 'active')
    .reduce((sum, b) => sum + (TIER_MRR[b.subscription_tier || ''] || 0), 0)

  const metrics = [
    { label: 'Agents', value: profiles.length.toLocaleString() },
    { label: 'Active Subscriptions', value: activeSubscriptions.toLocaleString() },
    { label: 'Trials', value: trials.toLocaleString() },
    { label: 'MRR', value: `$${mrr.toLocaleString()}` },
    { label: 'Leads (Complete)', value: leadsComplete.toLocaleString() },
    { label: 'Leads (Incomplete)', value: leadsIncomplete.toLocaleString() },
  ]

  const agents: AdminAgent[] = profiles.map((p) => {
    const b = billingMap[p.id]
    const l = leadsPerAgent[p.id] || { complete: 0, incomplete: 0 }
    return {
      id: p.id,
      name: p.full_name || '',
      agency: p.agency_name || '',
      email: emailMap[p.id] || '',
      slug: p.slug || '',
      status: b?.subscription_status || 'none',
      tier: b?.subscription_tier || '',
      leadsComplete: l.complete,
      leadsIncomplete: l.incomplete,
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Platform metrics and agents.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">{m.label}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <AgentsTable agents={agents} />
    </div>
  )
}
