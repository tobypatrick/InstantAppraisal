'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { startOfDay, subDays, format } from 'date-fns'

interface DailyMetrics {
  date: string
  views: number
  clicks: number
  clickRate: number
}

export interface AnalyticsMetrics {
  totalViews: number
  totalClicks: number
  overallClickRate: number
  dailyMetrics: DailyMetrics[]
  topSources: { name: string; views: number; clicks: number }[]
}

export function useAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', days],
    queryFn: async (): Promise<AnalyticsMetrics> => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) return { totalViews: 0, totalClicks: 0, overallClickRate: 0, dailyMetrics: [], topSources: [] }

      const [dailyRes, sourceRes] = await Promise.all([
        supabase.rpc('get_daily_analytics', { p_agent_id: user.id, p_days: days }),
        supabase.rpc('get_source_analytics', { p_agent_id: user.id, p_days: days }),
      ])

      if (dailyRes.error) throw dailyRes.error
      if (sourceRes.error) throw sourceRes.error

      const dayMap = new Map<string, { views: number; clicks: number }>()
      for (const row of dailyRes.data ?? []) {
        dayMap.set(row.day, { views: Number(row.views), clicks: Number(row.clicks) })
      }

      const dailyMetrics: DailyMetrics[] = []
      for (let i = days - 1; i >= 0; i--) {
        const key = format(startOfDay(subDays(new Date(), i)), 'yyyy-MM-dd')
        const m = dayMap.get(key) || { views: 0, clicks: 0 }
        dailyMetrics.push({
          date: format(new Date(key), 'MMM d'),
          views: m.views,
          clicks: m.clicks,
          clickRate: m.views > 0 ? Math.round((m.clicks / m.views) * 100) : 0,
        })
      }

      let totalViews = 0
      let totalClicks = 0
      for (const m of dailyMetrics) {
        totalViews += m.views
        totalClicks += m.clicks
      }

      const overallClickRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0
      const topSources = (sourceRes.data ?? []).map((r: { source: string; views: number; clicks: number }) => ({
        name: r.source.charAt(0).toUpperCase() + r.source.slice(1),
        views: Number(r.views),
        clicks: Number(r.clicks),
      }))

      return { totalViews, totalClicks, overallClickRate, dailyMetrics, topSources }
    },
    staleTime: 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })
}
