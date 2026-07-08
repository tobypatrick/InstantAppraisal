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

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function LeadsTable({ leads }: { leads: AdminLead[] }) {
  const [q, setQ] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // 'all' | '7' | '30' | '90' | 'm:YYYY-MM'
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Months present in the data, newest first, for the date dropdown.
  const monthOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const l of leads) {
      if (!l.ts) continue
      const d = new Date(l.ts)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!seen.has(key)) seen.set(key, `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`)
    }
    return [...seen.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([key, label]) => ({ key, label }))
  }, [leads])

  const dated = useMemo(() => {
    if (dateFilter === 'all') return leads
    if (dateFilter.startsWith('m:')) {
      const [y, m] = dateFilter.slice(2).split('-').map(Number)
      const start = new Date(y, m - 1, 1).getTime()
      const end = new Date(y, m, 1).getTime()
      return leads.filter((l) => l.ts >= start && l.ts < end)
    }
    const cutoff = Date.now() - Number(dateFilter) * 24 * 60 * 60 * 1000
    return leads.filter((l) => l.ts >= cutoff)
  }, [leads, dateFilter])

  const sorted = useMemo(() => {
    const query = q.trim().toLowerCase()
    const filtered = query
      ? dated.filter((l) => [l.address, l.agentName, l.agentEmail].some((f) => f.toLowerCase().includes(query)))
      : dated
    return [...filtered].sort((a, b) => {
      let cmp: number
      if (sortKey === 'date') cmp = a.ts - b.ts
      else if (sortKey === 'address') cmp = a.address.localeCompare(b.address, undefined, { sensitivity: 'base' })
      else cmp = (a.agentName || a.agentEmail).localeCompare(b.agentName || b.agentEmail, undefined, { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [dated, q, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'date' ? 'desc' : 'asc')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Leads ({sorted.length})</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="all">All dates</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            {monthOptions.map((m) => (
              <option key={m.key} value={`m:${m.key}`}>{m.label}</option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search address, agent..."
            className="h-9 w-64 max-w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
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
                <td colSpan={3} className="px-3 py-8 text-center text-slate-400">No leads found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
