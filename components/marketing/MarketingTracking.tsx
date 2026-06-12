'use client'

import Script from 'next/script'
import { useState, useEffect } from 'react'

// InstantAppraisal's own site-wide tracking for the marketing funnel.
const GTM_ID = 'GTM-W76GQPMG'
const PIXEL_ID = '1700241921115604'

// Fires ONLY on the marketing domain (instantappraisal.co / staging.*).
// Never on agent landing pages (my.* / staging-my.*) — those run each
// agent's own pixel, and we must not double-track their homeowner leads.
function isMarketingHost(hostname: string): boolean {
  if (!hostname.includes('instantappraisal')) return false
  return (
    !hostname.startsWith('dashboard.') &&
    !hostname.startsWith('my.') &&
    !hostname.startsWith('staging-dashboard.') &&
    !hostname.startsWith('staging-my.')
  )
}

export function MarketingTracking() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(isMarketingHost(window.location.hostname))
  }, [])

  if (!enabled) return null

  return (
    <>
      <Script id="mkt-gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <Script id="mkt-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}
