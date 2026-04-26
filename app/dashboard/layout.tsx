import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from './dashboard-shell'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('id, full_name, agency_name, slug, header_bg_color, page_bg_color, profile_picture_url, agency_logo_url, first_login, selected_template, phone_number, vsl_youtube_url')
    .eq('id', user.id)
    .maybeSingle()

  // Resolve storage paths → full public URLs
  const resolveStorageUrl = (path: string | null) => {
    if (!path || path.startsWith('http')) return path
    return supabase.storage.from('agent-assets').getPublicUrl(path).data.publicUrl
  }
  const profile = rawProfile ? {
    ...rawProfile,
    agency_logo_url: resolveStorageUrl(rawProfile.agency_logo_url),
    profile_picture_url: resolveStorageUrl(rawProfile.profile_picture_url),
  } : null

  // Check if user is admin
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  const isAdmin = !!roleData

  return (
    <DashboardShell profile={profile} isAdmin={isAdmin}>
      {children}
    </DashboardShell>
  )
}
