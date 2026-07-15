'use client'

import { useMemo, useState } from 'react'

export interface AdminLead {
  id: string
  address: string
  dateLabel: string
  ts: number
  status: string
  leadName: string
  leadPhone: string
  leadEmail: string
  source: string
  agentName: string
  agentEmail: string
}

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const SORTS: { key: string; label: string }[] = [
  { key: 'date-desc', label: 'Newest first' },
  { key: 'date-asc', label: 'Oldest first' },
  { key: 'address-asc', label: 'Address A–Z' },
  { key: 'agent-asc', label: 'Agent A–Z' },
]

export function LeadsTable({ leads }: { leads: AdminLead[] }) {
  const [q, setQ] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // 'all' | '7' | '30' | '90' | 'm:YYYY-MM'
  const [sort, setSort] = useState('date-desc')

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

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    const filtered = query
      ? dated.filter((l) =>
          [l.address, l.leadName, l.leadPhone, l.leadEmail, l.source, l.agentName, l.agentEmail].some((f) =>
            f.toLowerCase().includes(query)
          )
        )
      : dated
    const [key, dir] = sort.split('-')
    return [...filtered].sort((a, b) => {
      let cmp: number
      if (key === 'date') cmp = a.ts - b.ts
      else if (key === 'address') cmp = a.address.localeCompare(b.address, undefined, { sensitivity: 'base' })
      else cmp = (a.agentName || a.agentEmail).localeCompare(b.agentName || b.agentEmail, undefined, { sensitivity: 'base' })
      return dir === 'asc' ? cmp : -cmp
    })
  }, [dated, q, sort])

  const selectClass =
    'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/10'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Leads ({rows.length})</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={selectClass}>
            <option value="all">All dates</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            {monthOptions.map((m) => (
              <option key={m.key} value={`m:${m.key}`}>{m.label}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search address, name, phone, source..."
            className="h-9 w-64 max-w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>

      <ul className="border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">
        {rows.map((l) => (
          <li key={l.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-900 font-medium">{l.address || '(no address)'}</span>
                  {l.status === 'complete' && (
                    <span className="inline-block rounded-full px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700">complete</span>
                  )}
                </div>
                {(l.leadName || l.leadPhone || l.leadEmail) && (
                  <div className="text-xs text-slate-600 flex flex-wrap gap-x-2 gap-y-0.5">
                    {l.leadName && <span className="font-medium">{l.leadName}</span>}
                    {l.leadPhone && <a href={`tel:${l.leadPhone}`} className="text-slate-500 hover:text-slate-900">{l.leadPhone}</a>}
                    {l.leadEmail && <a href={`mailto:${l.leadEmail}`} className="text-slate-500 hover:text-slate-900 truncate">{l.leadEmail}</a>}
                  </div>
                )}
                <div className="text-xs text-slate-500 flex flex-wrap gap-x-2">
                  <span>Agent: {l.agentName || '(unknown)'}</span>
                  <span className="text-slate-400">Source: {l.source || 'direct'}</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 whitespace-nowrap shrink-0 pt-0.5">{l.dateLabel}</div>
            </div>
          </li>
        ))}
        {rows.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate-400">No leads found.</li>}
      </ul>
    </div>
  )
}
