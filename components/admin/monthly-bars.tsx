'use client'

import { useState } from 'react'

// Per-month buckets from the server (contiguous, zero-filled). The client
// regroups them into month / quarter / year on the fly for the toggle.
export type AgentMonth = { year: number; month: number; count: number }
export type LeadMonth = { year: number; month: number; complete: number; incomplete: number }

const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
type Grain = 'month' | 'quarter' | 'year'
const GRAINS: { key: Grain; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year', label: 'Year' },
]

type Bucket = { key: string; label: string; year: number; sort: number; count: number; complete: number; incomplete: number }

function bucketOf(year: number, month: number, grain: Grain) {
  if (grain === 'year') return { key: `${year}`, label: `${year}`, sort: year * 100 }
  if (grain === 'quarter') {
    const q = Math.floor((month - 1) / 3) + 1
    return { key: `${year}-Q${q}`, label: `Q${q}`, sort: year * 100 + q }
  }
  return { key: `${year}-${month}`, label: SHORT[month - 1], sort: year * 100 + month }
}

function group(rows: (AgentMonth | LeadMonth)[], grain: Grain): Bucket[] {
  const map = new Map<string, Bucket>()
  for (const r of rows) {
    const b = bucketOf(r.year, r.month, grain)
    let e = map.get(b.key)
    if (!e) {
      e = { key: b.key, label: b.label, year: r.year, sort: b.sort, count: 0, complete: 0, incomplete: 0 }
      map.set(b.key, e)
    }
    e.count += (r as AgentMonth).count || 0
    e.complete += (r as LeadMonth).complete || 0
    e.incomplete += (r as LeadMonth).incomplete || 0
  }
  return [...map.values()].sort((a, b) => a.sort - b.sort)
}

type Bar = { key: string; label: string; year: number; total: number; title: string; segments: { value: number; className: string }[] }

// The chart scale tops out at the largest bar in the period, so the tallest
// bar always reaches the top of the chart.
function Chart({ bars, grain }: { bars: Bar[]; grain: Grain }) {
  const max = Math.max(1, ...bars.map((b) => b.total))
  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1 h-40 min-w-full">
        {bars.map((b) => (
          <div key={b.key} title={b.title} className="flex-1 h-full flex flex-col justify-end items-center min-w-[26px]">
            {b.total > 0 && (
              <div className="w-full rounded-t overflow-hidden flex flex-col justify-end" style={{ height: `${(b.total / max) * 100}%` }}>
                {b.segments.map((s, i) => (
                  <div key={i} className={s.className} style={{ height: `${(s.value / b.total) * 100}%` }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1 min-w-full">
        {bars.map((b, i) => (
          <div key={b.key} className="flex-1 flex flex-col items-center min-w-[26px]">
            <span className="text-[10px] leading-none text-slate-500">{b.label}</span>
            {grain !== 'year' && (
              <span className="text-[10px] leading-none text-slate-400 h-3 mt-0.5">
                {i === 0 || b.year !== bars[i - 1].year ? b.year : ''}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MonthlyBars({ agents, leads }: { agents: AgentMonth[]; leads: LeadMonth[] }) {
  const [grain, setGrain] = useState<Grain>('month')

  const agentBars: Bar[] = group(agents, grain).map((b) => ({
    key: b.key,
    label: b.label,
    year: b.year,
    total: b.count,
    title: `${b.label} ${b.year}: ${b.count} new`,
    segments: [{ value: b.count, className: 'bg-slate-800' }],
  }))

  const leadBars: Bar[] = group(leads, grain).map((b) => ({
    key: b.key,
    label: b.label,
    year: b.year,
    total: b.complete + b.incomplete,
    title: `${b.label} ${b.year}: ${b.complete} complete, ${b.incomplete} incomplete`,
    segments: [
      { value: b.incomplete, className: 'bg-slate-300' },
      { value: b.complete, className: 'bg-emerald-500' },
    ],
  }))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Trends</h2>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm h-9 items-center">
          {GRAINS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGrain(g.key)}
              className={`px-3 py-1 rounded-md transition-colors ${
                g.key === grain ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">New agents</h3>
          <Chart bars={agentBars} grain={grain} />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Leads</h3>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" />Complete</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-slate-300" />Incomplete</span>
            </div>
          </div>
          <Chart bars={leadBars} grain={grain} />
        </div>
      </div>
    </div>
  )
}
