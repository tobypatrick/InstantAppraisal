'use client'

import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface AdminLead {
  id: string
  address: string
  dateLabel: string
  ts: number
  status: string
  agentName: string
  agentEmail: string
}

type SortKey = 'address' | 'date' | 'agent'

const COLUMNS: { key: SortKey; label: string; width: string }[] = [
  { key: 'address', label: 'Address', width: '44%' },
  { key: 'date', label: 'Date', width: '18%' },
  { key: 'agent', label: 'Agent', width: '38%' },
]

export function LeadsTable({ leads }: { leads: AdminLead[] }) {
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = useMemo(() => {
    const query = q.trim().toLowerCase()
    const filtered = query
      ? leads.filter((l) =>
          [l.address, l.agentName, l.agentEmail].some((f) => f.toLowerCase().includes(query))
        )
      : leads
    return [...filtered].sort((a, b) => {
      let cmp: number
      if (sortKey === 'date') cmp = a.ts - b.ts
      else if (sortKey === 'address') cmp = a.address.localeCompare(b.address, undefined, { sensitivity: 'base' })
      else cmp = (a.agentName || a.agentEmail).localeCompare(b.agentName || b.agentEmail, undefined, { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [leads, q, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'date' ? 'desc' : 'asc')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Leads ({sorted.length})</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search address, agent..."
          className="h-9 w-64 max-w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} style={{ width: c.width }} className="font-medium px-3 py-2 text-left">
                  <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-slate-900">
                    {c.label}
                    {sortKey === c.key &&
                      (sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-900 truncate" title={l.address}>{l.address || '(no address)'}</span>
                    {l.status === 'complete' && (
                      <span className="shrink-0 inline-block rounded-full px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700">complete</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{l.dateLabel}</td>
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-900 truncate" title={l.agentName}>{l.agentName || '(unknown)'}</div>
                  <div className="text-xs text-slate-500 truncate" title={l.agentEmail}>{l.agentEmail}</div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-slate-400">No leads in this period.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
