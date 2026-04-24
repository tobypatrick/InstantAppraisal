'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface LeadCounts {
  total: number
  complete: number
  partial: number
}

export function useLeadCounts() {
  return useQuery({
    queryKey: ['lead-counts'],
    queryFn: async (): Promise<LeadCounts> => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) return { total: 0, complete: 0, partial: 0 }

      const [totalRes, completeRes, partialRes] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('agent_id', user.id),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('agent_id', user.id).eq('status', 'complete'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('agent_id', user.id).eq('status', 'partial'),
      ])

      return {
        total: totalRes.count ?? 0,
        complete: completeRes.count ?? 0,
        partial: partialRes.count ?? 0,
      }
    },
    staleTime: 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })
}
