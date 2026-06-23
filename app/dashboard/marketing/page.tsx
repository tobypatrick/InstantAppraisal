import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarketingKit } from '@/components/dashboard/MarketingKit'
import { MarketingAnalytics } from '@/components/dashboard/MarketingAnalytics'

export default async function MarketingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('slug, accent_color')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-1 tracking-tight text-slate-900">Marketing</h1>
        <p className="text-sm text-slate-500">Track your lead performance and build trackable campaign links.</p>
      </div>

      {profile?.slug ? (
        <>
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Lead Analytics</h2>
            <MarketingAnalytics />
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Campaign Links</h2>
            <MarketingKit agentSlug={profile.slug} accentColor={profile.accent_color || '#10b981'} />
          </section>
        </>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <p>Complete your profile to access marketing tools.</p>
        </div>
      )}
    </div>
  )
}
