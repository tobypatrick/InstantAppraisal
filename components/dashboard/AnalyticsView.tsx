'use client'

import { useMemo, memo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Area, AreaChart, Legend,
} from 'recharts'
import { BarChart3, TrendingUp, Users, Target, RefreshCw, Eye, MousePointerClick } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LightCard, LightCardHeader } from './LightCard'
import { EmptyState } from './EmptyState'
import { TimeoutError } from './TimeoutError'
import { useLeadCounts } from '@/hooks/useLeadCounts'
import { useAnalytics } from '@/hooks/useAnalytics'

const SOURCE_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  google: '#4285F4',
  letterbox: '#10b981',
  email: '#6366f1',
  linkedin: '#0A66C2',
  direct: '#64748b',
  other: '#94a3b8',
}

const FUNNEL_COLORS = ['#10b981', '#34d399', '#6ee7b7']

const AnalyticsContentComponent = () => {
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('30')
  const { data: counts, isLoading: countsLoading, error: countsError, refetch: refetchCounts } = useLeadCounts()
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAnalytics(parseInt(timeRange))

  const isLoading = countsLoading || analyticsLoading
  const error = countsError || analyticsError

  const totalLeads = counts?.total ?? 0
  const completeLeads = counts?.complete ?? 0

  const handleRefresh = () => {
    refetchCounts()
    refetchAnalytics()
  }

  const sourceData = useMemo(() => {
    if (!analytics?.topSources) return []
    return analytics.topSources.map((s) => ({
      name: s.name,
      value: s.views,
      fill: SOURCE_COLORS[s.name.toLowerCase()] || SOURCE_COLORS.other,
    }))
  }, [analytics])

  const funnelData = useMemo(() => {
    const totalViews = analytics?.totalViews || 0
    return [
      { name: 'Page Views', value: totalViews, fill: '#3b82f6' },
      { name: 'Leads Captured', value: totalLeads, fill: FUNNEL_COLORS[0] },
      { name: 'Completed', value: completeLeads, fill: FUNNEL_COLORS[1] },
    ]
  }, [totalLeads, completeLeads, analytics])

  const conversionRate = useMemo(() => {
    if (totalLeads === 0) return 0
    return Math.round((completeLeads / totalLeads) * 100)
  }, [totalLeads, completeLeads])

  const visitToLeadRate = useMemo(() => {
    if (!analytics?.totalViews || analytics.totalViews === 0) return 0
    return Math.round((totalLeads / analytics.totalViews) * 100)
  }, [analytics, totalLeads])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-80" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error) {
    const isTimeoutError = error.message?.includes('timeout') || error.message?.includes('timed out')
    return (
      <TimeoutError
        title={isTimeoutError ? 'Connection Timeout' : 'Failed to Load Analytics'}
        message={isTimeoutError ? 'Unable to load analytics data. Please check your connection.' : 'Something went wrong. Please try again.'}
        onRetry={handleRefresh}
      />
    )
  }

  const hasData = totalLeads > 0 || (analytics?.totalViews || 0) > 0

  if (!hasData) {
    return (
      <LightCard>
        <EmptyState icon={<BarChart3 className="h-8 w-8 text-emerald-600" strokeWidth={1.25} />} title="No Data Yet" message="Share your landing page to start collecting analytics data." />
      </LightCard>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '7' | '14' | '30')}>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="7" className="text-xs">7 days</TabsTrigger>
            <TabsTrigger value="14" className="text-xs">14 days</TabsTrigger>
            <TabsTrigger value="30" className="text-xs">30 days</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="border-slate-200 text-slate-600 hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <LightCard>
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-blue-500" strokeWidth={1.25} />
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Page Views</span>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">{analytics?.totalViews || 0}</p>
        </LightCard>
        <LightCard>
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="h-4 w-4 text-emerald-500" strokeWidth={1.25} />
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Click Rate</span>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-emerald-600 tracking-tight">{analytics?.overallClickRate || 0}%</p>
        </LightCard>
        <LightCard>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-500" strokeWidth={1.25} />
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Leads</span>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">{totalLeads}</p>
          <p className="text-xs text-slate-500 mt-1">{visitToLeadRate}% of visitors</p>
        </LightCard>
        <LightCard>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-amber-500" strokeWidth={1.25} />
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Conversion</span>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-amber-600 tracking-tight">{conversionRate}%</p>
          <p className="text-xs text-slate-500 mt-1">Leads → Complete</p>
        </LightCard>
      </div>

      {analytics?.dailyMetrics && analytics.dailyMetrics.length > 0 && (
        <LightCard>
          <LightCardHeader icon={<TrendingUp className="h-4 w-4" strokeWidth={1.25} />} title="Views & Clicks Over Time" />
          <div className="h-[280px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} interval="preserveStartEnd" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
                        <p className="text-xs font-medium text-slate-900 mb-1">{label}</p>
                        {payload.map((p, i) => <p key={i} className="text-xs" style={{ color: p.color }}>{p.name}: {p.value}</p>)}
                      </div>
                    )
                  }
                  return null
                }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="views" name="Views" stroke="#3b82f6" strokeWidth={2} fill="url(#viewsGradient)" />
                <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#10b981" strokeWidth={2} fill="url(#clicksGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </LightCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LightCard>
          <LightCardHeader icon={<BarChart3 className="h-4 w-4" strokeWidth={1.25} />} title="Leads by Source" />
          {sourceData.length > 0 ? (
            <>
              <div className="h-[220px] sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                      {sourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
                            <p className="text-sm font-medium text-slate-900">{data.name}</p>
                            <p className="text-xs text-slate-500">{data.value} leads</p>
                          </div>
                        )
                      }
                      return null
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2">
                {sourceData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                    <span className="text-[11px] sm:text-xs text-slate-500">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm text-slate-400">No lead data yet</p>
            </div>
          )}
        </LightCard>

        <LightCard>
          <LightCardHeader icon={<TrendingUp className="h-4 w-4" strokeWidth={1.25} />} title="Conversion Funnel" />
          <ChartContainer config={{ views: { label: 'Views', color: '#3b82f6' }, leads: { label: 'Leads', color: '#10b981' } }} className="h-[220px]">
            <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={90} tick={{ fontSize: 11, fill: '#64748b' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ChartContainer>
        </LightCard>
      </div>

      {analytics?.topSources && analytics.topSources.length > 0 && (
        <LightCard>
          <LightCardHeader title="Traffic Sources Performance" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider py-2">Source</th>
                  <th className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider py-2">Views</th>
                  <th className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider py-2">Clicks</th>
                  <th className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider py-2">CTR</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topSources.map((source) => {
                  const ctr = source.views > 0 ? Math.round((source.clicks / source.views) * 100) : 0
                  return (
                    <tr key={source.name} className="border-b border-slate-50 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_COLORS[source.name.toLowerCase()] || SOURCE_COLORS.other }} />
                          <span className="text-sm font-medium text-slate-900">{source.name}</span>
                        </div>
                      </td>
                      <td className="text-right text-sm text-slate-600 py-3">{source.views}</td>
                      <td className="text-right text-sm text-slate-600 py-3">{source.clicks}</td>
                      <td className="text-right py-3">
                        <span className={`text-sm font-medium ${ctr >= 10 ? 'text-emerald-600' : 'text-slate-600'}`}>{ctr}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </LightCard>
      )}
    </div>
  )
}

export const AnalyticsView = memo(AnalyticsContentComponent)
