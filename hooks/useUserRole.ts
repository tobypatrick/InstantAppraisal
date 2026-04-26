'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type AppRole = 'admin' | 'user'

export function useUserRole() {
  const [roles, setRoles] = useState<AppRole[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRoles = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

      const userRoles = (data || []).map((r) => r.role as AppRole)
      setRoles(userRoles)
      setIsAdmin(userRoles.includes('admin'))
      setIsLoading(false)
    }
    fetchRoles()
  }, [])

  return { roles, isAdmin, isLoading }
}
