'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface AdminAgent {
  id: string
  name: string
  agency: string
  email: string
  slug: string
  status: string
  tier: string
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

const COLUMNS: { key: SortKey; label: string; align?: 'right'; value: (a: AdminAgent) => string | number }[] = [
  { key: 'name', label: 'Agent', value: (a) => a.name || a.agency || a.slug },
  { key: 'email', label: 'Email', value: (a) => a.email },
  { key: 'tier', label: 'Plan', value: (a) => a.tier },
  { key: 'status', label: 'Status', value: (a) => a.status },
  { key: 'leads', label: 'Leads (C / I)', align: 'right', value: (a) => a.leadsComplete + a.leadsIncomplete },
]

export function AgentsTable({ agents }: { agents: AdminAgent[] }) {
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('leads')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const query = q.trim().toLowerCase()
  const filtered = query
    ? agents.filter((a) => [a.name, a.agency, a.email, a.slug].some((f) => f.toLowerCase().includes(query)))
    : agents

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
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'leads' ? 'desc' : 'asc')
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
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} className={`font-medium px-3 py-2 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
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
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-900">{a.name || '(no name)'}</div>
                  <div className="text-xs text-slate-500">{a.agency || a.slug}</div>
                </td>
                <td className="px-3 py-2 text-slate-600">{a.email}</td>
                <td className="px-3 py-2 text-slate-600 capitalize">{a.tier || '—'}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[a.status] || STATUS_STYLES.none}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-slate-600">
                  {a.leadsComplete} / {a.leadsIncomplete}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-400">No agents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
