import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from './dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, agency_name, slug, header_bg_color, page_bg_color, profile_picture_url, agency_logo_url, first_login, selected_template, phone_number, vsl_youtube_url')
    .eq('id', user.id)
    .maybeSingle()

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
