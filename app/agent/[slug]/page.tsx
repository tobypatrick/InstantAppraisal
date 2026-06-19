import { notFound } from 'next/navigation'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/server'
import { getAgentPageUrl } from '@/lib/subdomain'
import { AgentLandingClient } from './agent-landing-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AgentLandingPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_public_profile', { profile_slug: slug })

  if (error || !data || data.length === 0) {
    notFound()
  }

  const raw = data[0]
  // Resolve storage path → full public URL if not already a full URL
  let agencyLogoUrl = raw.agency_logo_url || null
  if (agencyLogoUrl && !agencyLogoUrl.startsWith('http')) {
    const { data: { publicUrl } } = supabase.storage.from('agent-assets').getPublicUrl(agencyLogoUrl)
    agencyLogoUrl = publicUrl
  }
  const profile = { ...raw, selected_template: raw.selected_template || 'minimalist', agency_logo_url: agencyLogoUrl }
  const gtmId: string | null = profile.google_tag_manager_id || null
  const pixelId: string | null = profile.facebook_pixel_id || null

  return (
    <>
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {pixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      )}

      <AgentLandingClient profile={profile} />
    </>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_public_profile', { profile_slug: slug })
  const profile = data?.[0]

  // Brand the link preview with the agent's identity (agent · agency) so when
  // an agent SMSes their URL it shows as theirs — not the generic site.
  const agentName = profile?.full_name || null
  const agencyName = profile?.agency_name || null
  const brand = [agentName, agencyName].filter(Boolean).join(' · ')
  const title = brand
    ? `Instant, Free Property Report | ${brand}`
    : 'Instant, Free Property Report'
  const fromName = agentName || agencyName
  const description = `Get a free, instant property value update${fromName ? ` from ${fromName}` : ''} — no obligation, powered by PropTrack data.`

  // Resolve a branded preview image: agency logo → agent headshot → site default.
  const resolveAsset = (path: string | null | undefined): string | null => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const { data: { publicUrl } } = supabase.storage.from('agent-assets').getPublicUrl(path)
    return publicUrl
  }
  const ogImage =
    resolveAsset(profile?.agency_logo_url) || resolveAsset(profile?.profile_picture_url) || '/og-image.png'

  const url = getAgentPageUrl(slug)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: agencyName || agentName || 'InstantAppraisal',
      title,
      description,
      images: [{ url: ogImage, alt: brand || 'Instant, Free Property Report' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}
