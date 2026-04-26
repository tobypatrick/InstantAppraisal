'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface AuditLogEntry {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

interface UseAuditLogsOptions {
  limit?: number
  offset?: number
  action?: string
  userId?: string
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const { limit = 20, offset = 0, action, userId } = options

  return useQuery({
    queryKey: ['audit-logs', limit, offset, action, userId],
    queryFn: async (): Promise<{ logs: AuditLogEntry[]; total: number }> => {
      const supabase = createClient()
      let query = supabase
        .from('audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (action) query = query.eq('action', action)
      if (userId) query = query.eq('user_id', userId)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      return { logs: (data || []) as AuditLogEntry[], total: count || 0 }
    },
    staleTime: 30_000,
  })
}
