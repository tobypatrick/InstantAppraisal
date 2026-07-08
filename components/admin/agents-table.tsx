'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface AdminAgent {
  id: string
  name: string
  agency: string
  email: string
  slug: string
  status: string
  tier: string
  isAgentGrowth: boolean
  leadsComplete: number
  leadsIncomplete: number
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  trialing: 'bg-blue-50 text-blue-700',
  past_due: 'bg-amber-50 text-amber-700',
  canceled: 'bg-slate-100 text-slate-500',
  none: 'bg-slate-100 text-slate-400',
}

type SortKey = 'name' | 'email' | 'tier' | 'status' | 'leads'

const COLUMNS: { key: SortKey; label: string; align?: 'right'; width: string; value: (a: AdminAgent) => string | number }[] = [
  { key: 'name', label: 'Agent', width: '24%', value: (a) => a.name || a.agency || a.slug },
  { key: 'email', label: 'Email', width: '26%', value: (a) => a.email },
  { key: 'tier', label: 'Plan', width: '11%', value: (a) => a.tier },
  { key: 'status', label: 'Status', width: '15%', value: (a) => a.status },
  { key: 'leads', label: 'Leads (C / I)', align: 'right', width: '12%', value: (a) => a.leadsComplete + a.leadsIncomplete },
]

export function AgentsTable({ agents }: { agents: AdminAgent[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(agents)
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('leads')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [saving, setSaving] = useState<string | null>(null)

  const query = q.trim().toLowerCase()
  const filtered = query
    ? rows.filter((a) => [a.name, a.agency, a.email, a.slug].some((f) => f.toLowerCase().includes(query)))
    : rows

  const col = COLUMNS.find((c) => c.key === sortKey)!
  const sorted = [...filtered].sort((a, b) => {
    const va = col.value(a)
    const vb = col.value(b)
    const cmp =
      typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' })
    return sortDir === 'asc' ? cmp : -cmp
  })

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'leads' ? 'desc' : 'asc')
    }
  }

  const toggleGrowth = async (id: string, value: boolean) => {
    const prev = rows
    setRows((rs) => rs.map((a) => (a.id === id ? { ...a, isAgentGrowth: value } : a)))
    setSaving(id)
    try {
      const res = await fetch('/api/admin/agent-growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, value }),
      })
      if (!res.ok) throw new Error('save failed')
      router.refresh() // re-run the server metrics so Trials/Trial Value/MRR update
    } catch {
      setRows(prev) // revert on failure
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Agents ({sorted.length})</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, agency, email..."
          className="h-9 w-64 max-w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={`font-medium px-3 py-2 ${c.align === 'right' ? 'text-right' : 'text-left'} ${
                    c.key === 'email' ? 'hidden sm:table-cell' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleSort(c.key)}
                    className={`inline-flex items-center gap-1 hover:text-slate-900 ${c.align === 'right' ? 'flex-row-reverse' : ''}`}
                  >
                    {c.label}
                    {sortKey === c.key &&
                      (sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                  </button>
                </th>
              ))}
              <th style={{ width: '12%' }} className="text-center font-medium px-3 py-2">Agent Growth</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-900 truncate">{a.name || '(no name)'}</div>
                  <div className="text-xs text-slate-500 truncate">{a.agency || a.slug}</div>
                  <div className="text-xs text-slate-500 truncate sm:hidden" title={a.email}>{a.email}</div>
                </td>
                <td className="px-3 py-2 text-slate-600 truncate hidden sm:table-cell" title={a.email}>{a.email}</td>
                <td className="px-3 py-2 text-slate-600 capitalize truncate">{a.tier || '—'}</td>
                <td className="px-3 py-2">
                  {a.isAgentGrowth ? (
                    <span className="inline-block rounded-full px-2 py-0.5 text-xs bg-purple-50 text-purple-700">agent growth</span>
                  ) : (
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[a.status] || STATUS_STYLES.none}`}>
                      {a.status}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-slate-600">
                  {a.leadsComplete} / {a.leadsIncomplete}
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={a.isAgentGrowth}
                    disabled={saving === a.id}
                    onChange={(e) => toggleGrowth(a.id, e.target.checked)}
                    className="h-4 w-4 accent-emerald-600 cursor-pointer disabled:opacity-50"
                  />
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-400">No agents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
