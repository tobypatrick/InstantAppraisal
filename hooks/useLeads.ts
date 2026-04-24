'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface Lead {
  id: string
  address: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  status: 'complete' | 'partial'
  created_at: string
  report_url: string | null
  utm_source: string | null
  interest_level: string | null
}

const PAGE_SIZE = 20
const FETCH_TIMEOUT_MS = 15000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    ),
  ])
}

interface LeadsPage {
  leads: Lead[]
  nextCursor: string | null
}

export function useLeads() {
  return useInfiniteQuery({
    queryKey: ['leads'],
    queryFn: async ({ pageParam }): Promise<LeadsPage> => {
      const fetchPage = async (): Promise<LeadsPage> => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { leads: [], nextCursor: null }

        let query = supabase
          .from('leads')
          .select('id, address, contact_name, contact_email, contact_phone, status, created_at, report_url, utm_source, interest_level')
          .eq('agent_id', user.id)
          .order('created_at', { ascending: false })
          .limit(PAGE_SIZE)

        if (pageParam) {
          query = query.lt('created_at', pageParam)
        }

        const { data, error } = await query
        if (error) throw error

        const leads = (data as Lead[]) || []
        const nextCursor = leads.length === PAGE_SIZE ? leads[leads.length - 1].created_at : null

        return { leads, nextCursor }
      }

      return withTimeout(fetchPage(), FETCH_TIMEOUT_MS)
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    staleTime: 60_000,
  })
}

export function useFlatLeads() {
  const query = useLeads()
  const leads = query.data?.pages.flatMap((p) => p.leads) ?? []
  return { ...query, leads }
}
