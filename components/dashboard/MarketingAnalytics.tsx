'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LightCard, LightCardHeader } from '@/components/dashboard/LightCard'
import { Users, TrendingUp, Search, BarChart3 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface LeadRow {
  status: 'partial' | 'complete'
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  created_at: string
}

const RANGES = [
  { key: '7', label: '7 days', days: 7 },
  { key: '30', label: '30 days', days: 30 },
  { key: '90', label: '90 days', days: 90 },
  { key: 'all', label: 'All time', days: null },
] as const

export function MarketingAnalytics() {
  const [rangeKey, setRangeKey] = useState<string>('30')
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[1]

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    const supabase = createClient()
    // RLS scopes this to the agent's own (non-orphaned) leads.
    let query = supabase
      .from('leads')
      .select('status, utm_source, utm_medium, utm_campaign, created_at')
    if (range.days) {
      const start = new Date(Date.now() - range.days * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('created_at', start)
    }
    query.then(({ data, error: err }) => {
      if (cancelled) return
      if (err) {
        setError(true)
        setLeads([])
      } else {
        setLeads((data as LeadRow[]) ?? [])
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [rangeKey, range.days])

  const stats = useMemo(() => {
    const searches = leads.length // every lead row = an address search (partial or complete)
    const completes = leads.filter((l) => l.status === 'complete').length
    const conversion = searches ? Math.round((completes / searches) * 100) : 0

    // Attribution by campaign (+ source/medium)
    const map = new Map<string, { campaign: string; source: string; medium: string; searches: number; completes: number }>()
    for (const l of leads) {
      const campaign = l.utm_campaign || '(direct / none)'
      const source = l.utm_source || '—'
      const medium = l.utm_medium || '—'
      const key = `${campaign}|${source}|${medium}`
      const e = map.get(key) ?? { campaign, source, medium, searches: 0, completes: 0 }
      e.searches++
      if (l.status === 'complete') e.completes++
      map.set(key, e)
    }
    const campaigns = [...map.values()].sort((a, b) => b.completes - a.completes || b.searches - a.searches)

    // Time series of completed leads — daily for short ranges, weekly for long ones
    const weekly = (range.days ?? 9999) > 31
    const buckets = new Map<string, number>()
    for (const l of leads) {
      if (l.status !== 'complete') continue
      const d = new Date(l.created_at)
      let label: string
      if (weekly) {
        const offset = (d.getDay() + 6) % 7 // days since Monday
        const monday = new Date(d)
        monday.setDate(d.getDate() - offset)
        label = monday.toISOString().slice(0, 10)
      } else {
        label = d.toISOString().slice(0, 10)
      }
      buckets.set(label, (buckets.get(label) ?? 0) + 1)
    }
    const series = [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, leads: count }))

    return { searches, completes, conversion, campaigns, series, weekly }
  }, [leads, range.days])

  return (
    <div className="space-y-5">
      {/* Range selector */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRangeKey(r.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              rangeKey === r.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {error ? (
        <LightCard>
          <p className="text-sm text-slate-500 text-center py-8">Couldn&apos;t load analytics. Please try again.</p>
        </LightCard>
      ) : loading ? (
        <LightCard>
          <p className="text-sm text-slate-400 text-center py-8">Loading…</p>
        </LightCard>
      ) : stats.searches === 0 ? (
        <LightCard>
          <div className="text-center py-10 text-slate-500">
            <BarChart3 className="h-8 w-8 mx-auto mb-3 text-slate-300" strokeWidth={1.25} />
            <p className="text-sm">No leads in this period yet.</p>
            <p className="text-xs text-slate-400 mt-1">Share your campaign links and leads will show up here.</p>
          </div>
        </LightCard>
      ) : (
        <>
          {/* Top-line stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <LightCard>
              <LightCardHeader icon={<Users className="h-4 w-4" strokeWidth={1.25} />} title="Leads captured" />
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.completes}</p>
              <p className="text-xs text-slate-500 mt-1">Completed (contact details given)</p>
            </LightCard>
            <LightCard>
              <LightCardHeader icon={<TrendingUp className="h-4 w-4" strokeWidth={1.25} />} title="Conversion" />
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.conversion}%</p>
              <p className="text-xs text-slate-500 mt-1">Searches that became leads</p>
            </LightCard>
            <LightCard>
              <LightCardHeader icon={<Search className="h-4 w-4" strokeWidth={1.25} />} title="Address searches" />
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.searches}</p>
              <p className="text-xs text-slate-500 mt-1">Total property searches</p>
            </LightCard>
          </div>

          {/* Over-time chart */}
          {stats.series.length > 0 && (
            <LightCard>
              <LightCardHeader title="Leads over time" description={stats.weekly ? 'Completed leads per week' : 'Completed leads per day'} />
              <div className="h-56 mt-3 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.series} margin={{ top: 5, right: 8, bottom: 0, left: -8 }}>
                    <defs>
                      <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} minTickGap={24} tickFormatter={(d) => new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip
                      labelFormatter={(d) => new Date(d as string).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      formatter={(v) => [v, 'Leads']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} fill="url(#leadsFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </LightCard>
          )}

          {/* By-campaign attribution table */}
          <LightCard>
            <LightCardHeader title="By campaign" description="Which campaigns are driving your leads" />
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="py-2 pr-4 font-medium">Campaign</th>
                    <th className="py-2 px-4 font-medium">Source</th>
                    <th className="py-2 px-4 font-medium">Medium</th>
                    <th className="py-2 px-4 font-medium text-right">Searches</th>
                    <th className="py-2 px-4 font-medium text-right">Leads</th>
                    <th className="py-2 pl-4 font-medium text-right">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.campaigns.map((c, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-slate-900">{c.campaign}</td>
                      <td className="py-2.5 px-4 text-slate-500 capitalize">{c.source}</td>
                      <td className="py-2.5 px-4 text-slate-500 capitalize">{c.medium}</td>
                      <td className="py-2.5 px-4 text-right text-slate-600">{c.searches}</td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-900">{c.completes}</td>
                      <td className="py-2.5 pl-4 text-right text-slate-600">{c.searches ? Math.round((c.completes / c.searches) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LightCard>
        </>
      )}
    </div>
  )
}
