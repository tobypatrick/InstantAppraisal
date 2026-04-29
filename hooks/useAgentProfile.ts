'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface PublicProfile {
  id: string
  full_name: string | null
  agency_name: string | null
  profile_picture_url: string | null
  agency_logo_url: string | null
  vsl_youtube_url: string | null
  selected_template: string
  slug: string | null
  header_bg_color?: string | null
  page_bg_color?: string | null
  accent_color?: string | null
  facebook_pixel_id?: string | null
  google_tag_manager_id?: string | null
}

export function useAgentProfile(slug: string | undefined) {
  return useQuery({
    queryKey: ['agent-profile', slug],
    queryFn: async (): Promise<PublicProfile | null> => {
      if (!slug) return null
      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_public_profile', { profile_slug: slug })
      if (error) throw error
      if (!data || data.length === 0) return null
      return { ...data[0], selected_template: data[0].selected_template || 'minimalist' } as PublicProfile
    },
    enabled: !!slug,
  })
}
