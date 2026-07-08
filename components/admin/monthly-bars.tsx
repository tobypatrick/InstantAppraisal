// Server-rendered by-month bar charts for the admin overview.
// No chart library — plain divs so the admin bundle stays small.
// Both charts span every month with data (first signup / first lead → now).

export type AgentMonth = { key: string; short: string; year: number; count: number }
export type LeadMonth = { key: string; short: string; year: number; complete: number; incomplete: number }

function YearLabel({ index, year, prevYear }: { index: number; year: number; prevYear: number | null }) {
  // Show the year once, under the first bar of each year.
  const show = index === 0 || year !== prevYear
  return <span className="block text-[10px] leading-none text-slate-400 h-3">{show ? year : ''}</span>
}

function AgentsChart({ data }: { data: AgentMonth[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1 h-40 min-w-full">
        {data.map((d) => (
          <div key={d.key} className="flex-1 flex flex-col justify-end items-center min-w-[22px]" title={`${d.short} ${d.year}: ${d.count} new`}>
            <span className="text-[10px] leading-none text-slate-500 mb-1 h-3">{d.count || ''}</span>
            <div className="w-full rounded-t bg-slate-800" style={{ height: `${(d.count / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1 min-w-full">
        {data.map((d, i) => (
          <div key={d.key} className="flex-1 flex flex-col items-center min-w-[22px]">
            <span className="text-[10px] leading-none text-slate-500">{d.short}</span>
            <YearLabel index={i} year={d.year} prevYear={i > 0 ? data[i - 1].year : null} />
          </div>
        ))}
      </div>
    </div>
  )
}

function LeadsChart({ data }: { data: LeadMonth[] }) {
  const max = Math.max(1, ...data.map((d) => d.complete + d.incomplete))
  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1 h-40 min-w-full">
        {data.map((d) => {
          const total = d.complete + d.incomplete
          return (
            <div
              key={d.key}
              className="flex-1 flex flex-col justify-end items-center min-w-[22px]"
              title={`${d.short} ${d.year}: ${d.complete} complete, ${d.incomplete} incomplete`}
            >
              <span className="text-[10px] leading-none text-slate-500 mb-1 h-3">{total || ''}</span>
              <div className="w-full rounded-t overflow-hidden flex flex-col justify-end" style={{ height: '100%' }}>
                <div className="w-full bg-slate-300" style={{ height: `${(d.incomplete / max) * 100}%` }} />
                <div className="w-full bg-emerald-500" style={{ height: `${(d.complete / max) * 100}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1 mt-1 min-w-full">
        {data.map((d, i) => (
          <div key={d.key} className="flex-1 flex flex-col items-center min-w-[22px]">
            <span className="text-[10px] leading-none text-slate-500">{d.short}</span>
            <YearLabel index={i} year={d.year} prevYear={i > 0 ? data[i - 1].year : null} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MonthlyBars({ agents, leads }: { agents: AgentMonth[]; leads: LeadMonth[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-900">New agents by month</h3>
        <p className="text-xs text-slate-500 mb-3">Sign-ups per month, all time.</p>
        <AgentsChart data={agents} />
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Leads by month</h3>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" />Complete</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-slate-300" />Incomplete</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-3">Leads captured per month, all time.</p>
        <LeadsChart data={leads} />
      </div>
    </div>
  )
}
