import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminShell } from './admin-shell'

export const metadata = {
  title: 'Admin | InstantAppraisal',
  robots: { index: false, follow: false },
}

// Gate for every admin page except the login. Requires a signed-in user who
// holds the 'admin' role in user_roles; everyone else is bounced to the login.
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (!role) redirect('/login')

  return <AdminShell email={user.email ?? ''}>{children}</AdminShell>
}
