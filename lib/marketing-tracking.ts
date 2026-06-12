// Fires a marketing-funnel conversion: a GTM dataLayer event plus (optionally)
// a Facebook Pixel standard event. Used on the marketing domain, where the
// site-wide GTM + Pixel are loaded (see MarketingTracking). Safe to call
// anywhere — it no-ops on the server and when fbq isn't present.
export function trackMarketingEvent(
  gtmEvent: string,
  fbEvent?: string,
  params?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return
  const w = window as unknown as {
    dataLayer?: unknown[]
    fbq?: (...args: unknown[]) => void
  }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event: gtmEvent, ...(params || {}) })
  if (fbEvent && typeof w.fbq === 'function') {
    w.fbq('track', fbEvent, params || {})
  }
}
