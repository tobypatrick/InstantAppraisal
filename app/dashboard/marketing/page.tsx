import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarketingKit } from '@/components/dashboard/MarketingKit'

export default async function MarketingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('slug')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1 tracking-tight text-slate-900">Marketing Kit</h1>
        <p className="text-sm text-slate-500">Generate QR codes and trackable campaign links.</p>
      </div>
      {profile?.slug ? (
        <MarketingKit agentSlug={profile.slug} />
      ) : (
        <div className="text-center py-12 text-slate-500">
          <p>Complete your profile to access marketing tools.</p>
        </div>
      )}
    </div>
  )
}
