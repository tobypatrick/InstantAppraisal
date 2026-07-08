import { createClient as createServiceClient } from '@supabase/supabase-js'
import { AgentsTable, type AdminAgent } from '@/components/admin/agents-table'
import { LeadsTable, type AdminLead } from '@/components/admin/leads-table'
import { MonthlyBars, type AgentMonth, type LeadMonth } from '@/components/admin/monthly-bars'
import { MonthPicker } from '@/components/admin/month-picker'

export const metadata = { title: 'Overview | Admin' }

// Always fetch live data on each request — never a build-time static snapshot.
export const dynamic = 'force-dynamic'

// Monthly recurring revenue per active tier.
const TIER_MRR: Record<string, number> = { pro: 99, elite: 199 }

const RANGES = [
  { key: '7', label: '7 days', days: 7 },
  { key: '30', label: '30 days', days: 30 },
  { key: '90', label: '90 days', days: 90 },
  { key: 'all', label: 'All time', days: null as number | null },
]

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const monthKeyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

// Contiguous list of "YYYY-MM" keys from the earliest data month to now.
function monthSpan(earliest: Date, now: Date): string[] {
  const out: string[] = []
  let y = earliest.getFullYear()
  let m = earliest.getMonth()
  const ey = now.getFullYear()
  const em = now.getMonth()
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m + 1).padStart(2, '0')}`)
    if (++m > 11) {
      m = 0
      y++
    }
  }
  return out
}

const formatDate = (d: Date) => `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; month?: string }>
}) {
  const { range: rangeParam, month: monthParam } = await searchParams

  // A specific month (?month=YYYY-MM) beats the 7/30/90/all toggle.
  const monthMatch = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : null
  const range = monthMatch ? null : RANGES.find((r) => r.key === rangeParam) ?? RANGES[1] // default 30 days

  let windowStart: number | null = null // inclusive
  let windowEnd: number | null = null // exclusive
  if (monthMatch) {
    const [y, m] = monthMatch.split('-').map(Number)
    windowStart = new Date(y, m - 1, 1).getTime()
    windowEnd = new Date(y, m, 1).getTime()
  } else if (range && range.days !== null) {
    windowStart = Date.now() - range.days * 24 * 60 * 60 * 1000
  }

  // Service-role client: admin needs to read every account's data, bypassing RLS.
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const [usersRes, profilesRes, billingRes, leadsRes, rolesRes] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from('profiles').select('id, full_name, agency_name, slug'),
    supabase.from('billing').select('user_id, subscription_status, subscription_tier, is_agent_growth'),
    supabase.from('leads').select('id, agent_id, status, created_at, address'),
    supabase.from('user_roles').select('user_id').eq('role', 'admin'),
  ])

  const users = usersRes.data?.users || []
  const profiles = profilesRes.data || []
  const billing = billingRes.data || []
  const allLeads = leadsRes.data || []
  const adminIds = new Set((rolesRes.data || []).map((r) => r.user_id))

  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]))
  const billingMap = Object.fromEntries(billing.map((b) => [b.user_id, b]))
  const emailMap = Object.fromEntries(users.map((u) => [u.id, u.email || '']))

  const inWindow = (iso: string | null) => {
    if (!iso) return windowStart === null && windowEnd === null
    const t = new Date(iso).getTime()
    if (windowStart !== null && t < windowStart) return false
    if (windowEnd !== null && t >= windowEnd) return false
    return true
  }

  // Lead figures respect the selected window (range toggle or specific month).
  const leads = allLeads.filter((l) => inWindow(l.created_at))

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

  // Agents = every signed-up account that is NOT an admin, newest first.
  const agentUsers = users
    .filter((u) => !adminIds.has(u.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Agent Growth accounts are free and pulled out of the paid figures entirely.
  const isAG = (id: string) => billingMap[id]?.is_agent_growth === true

  const activeSubscriptions = agentUsers.filter((u) => !isAG(u.id) && billingMap[u.id]?.subscription_status === 'active').length
  const trials = agentUsers.filter((u) => !isAG(u.id) && billingMap[u.id]?.subscription_status === 'trialing').length
  const agentGrowth = agentUsers.filter((u) => isAG(u.id)).length

  const mrr = agentUsers.reduce((sum, u) => {
    if (isAG(u.id)) return sum
    const b = billingMap[u.id]
    return b?.subscription_status === 'active' ? sum + (TIER_MRR[b.subscription_tier || ''] || 0) : sum
  }, 0)
  const trialValue = agentUsers.reduce((sum, u) => {
    if (isAG(u.id)) return sum
    const b = billingMap[u.id]
    return b?.subscription_status === 'trialing' ? sum + (TIER_MRR[b.subscription_tier || ''] || 0) : sum
  }, 0)

  const metrics = [
    { label: 'Agents', value: agentUsers.length.toLocaleString() },
    { label: 'Active Subscriptions', value: activeSubscriptions.toLocaleString() },
    { label: 'Trials', value: trials.toLocaleString() },
    { label: 'Agent Growth', value: agentGrowth.toLocaleString() },
    { label: 'MRR', value: `$${mrr.toLocaleString()}` },
    { label: 'Trial Value', value: `$${trialValue.toLocaleString()}` },
    { label: 'Leads Complete', value: leadsComplete.toLocaleString() },
    { label: 'Leads Incomplete', value: leadsIncomplete.toLocaleString() },
  ]

  const agents: AdminAgent[] = agentUsers.map((u) => {
    const p = profileMap[u.id]
    const b = billingMap[u.id]
    const l = leadsPerAgent[u.id] || { complete: 0, incomplete: 0 }
    return {
      id: u.id,
      name: p?.full_name || '',
      agency: p?.agency_name || '',
      email: u.email || '',
      slug: p?.slug || '',
      status: b?.subscription_status || 'none',
      tier: b?.subscription_tier || '',
      isAgentGrowth: b?.is_agent_growth === true,
      leadsComplete: l.complete,
      leadsIncomplete: l.incomplete,
    }
  })

  // Full leads list — always every lead; it has its own date control.
  const leadRows: AdminLead[] = allLeads.map((l) => {
    const p = l.agent_id ? profileMap[l.agent_id] : null
    const ts = l.created_at ? new Date(l.created_at).getTime() : 0
    return {
      id: l.id,
      address: l.address || '',
      dateLabel: l.created_at ? formatDate(new Date(l.created_at)) : '—',
      ts,
      status: l.status || '',
      agentName: p?.full_name || p?.agency_name || '',
      agentEmail: (l.agent_id && emailMap[l.agent_id]) || '',
    }
  })

  // By-month charts: every month with data, from the first signup/lead to now.
  const allTimes: number[] = [
    ...agentUsers.map((u) => new Date(u.created_at).getTime()),
    ...allLeads.filter((l) => l.created_at).map((l) => new Date(l.created_at!).getTime()),
  ]
  const now = new Date()
  const earliest = allTimes.length ? new Date(Math.min(...allTimes)) : now
  const span = monthSpan(earliest, now)

  const agentCounts: Record<string, number> = {}
  for (const u of agentUsers) {
    const k = monthKeyOf(new Date(u.created_at))
    agentCounts[k] = (agentCounts[k] || 0) + 1
  }
  const leadCounts: Record<string, { complete: number; incomplete: number }> = {}
  for (const l of allLeads) {
    if (!l.created_at) continue
    const k = monthKeyOf(new Date(l.created_at))
    const bucket = (leadCounts[k] ||= { complete: 0, incomplete: 0 })
    if (l.status === 'complete') bucket.complete++
    else bucket.incomplete++
  }

  const agentsByMonth: AgentMonth[] = span.map((k) => {
    const [y, m] = k.split('-').map(Number)
    return { year: y, month: m, count: agentCounts[k] || 0 }
  })
  const leadsByMonth: LeadMonth[] = span.map((k) => {
    const [y, m] = k.split('-').map(Number)
    return { year: y, month: m, complete: leadCounts[k]?.complete || 0, incomplete: leadCounts[k]?.incomplete || 0 }
  })

  // Month dropdown options, newest first.
  const monthOptions = [...span].reverse().map((k) => {
    const [y, m] = k.split('-').map(Number)
    return { key: k, label: `${MONTH_LONG[m - 1]} ${y}` }
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Platform metrics and agents.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm h-9 items-center">
            {RANGES.map((r) => (
              <a
                key={r.key}
                href={`?range=${r.key}`}
                className={`px-3 py-1 rounded-md transition-colors ${
                  !monthMatch && r.key === range?.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r.label}
              </a>
            ))}
          </div>
          <MonthPicker months={monthOptions} active={monthMatch} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">{m.label}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <MonthlyBars agents={agentsByMonth} leads={leadsByMonth} />

      <AgentsTable agents={agents} />

      <LeadsTable leads={leadRows} />
    </div>
  )
}
