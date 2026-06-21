'use client'

import { useState } from 'react'

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

export function AgentsTable({ agents }: { agents: AdminAgent[] }) {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const filtered = query
    ? agents.filter((a) => [a.name, a.agency, a.email, a.slug].some((f) => f.toLowerCase().includes(query)))
    : agents

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Agents ({filtered.length})</h2>
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
              <th className="text-left font-medium px-3 py-2">Agent</th>
              <th className="text-left font-medium px-3 py-2">Email</th>
              <th className="text-left font-medium px-3 py-2">Plan</th>
              <th className="text-left font-medium px-3 py-2">Status</th>
              <th className="text-right font-medium px-3 py-2">Leads (C / I)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
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
            {filtered.length === 0 && (
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
