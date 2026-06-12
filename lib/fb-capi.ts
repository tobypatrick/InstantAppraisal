import crypto from 'crypto'

// Facebook Conversions API (server-side events). Used for conversions the
// browser pixel can't see — notably the paid subscription, which happens in
// the Stripe webhook ~30 days after signup. No-ops until FB_CAPI_ACCESS_TOKEN
// is configured, so it's safe to ship before the token exists.

const PIXEL_ID = process.env.FB_PIXEL_ID || '1700241921115604'
const ACCESS_TOKEN = process.env.FB_CAPI_ACCESS_TOKEN
const TEST_EVENT_CODE = process.env.FB_CAPI_TEST_EVENT_CODE // optional, for Events Manager → Test Events

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

interface CapiEvent {
  eventName: string
  email?: string | null
  value?: number
  currency?: string
  eventId?: string
  eventSourceUrl?: string
}

export async function sendCapiEvent(evt: CapiEvent): Promise<void> {
  if (!ACCESS_TOKEN) return // not configured yet — no-op

  try {
    const userData: Record<string, unknown> = {}
    if (evt.email) userData.em = [sha256(evt.email)]

    const customData: Record<string, unknown> = {}
    if (typeof evt.value === 'number') customData.value = evt.value
    if (evt.currency) customData.currency = evt.currency

    const body: Record<string, unknown> = {
      data: [
        {
          event_name: evt.eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          ...(evt.eventId ? { event_id: evt.eventId } : {}),
          ...(evt.eventSourceUrl ? { event_source_url: evt.eventSourceUrl } : {}),
          user_data: userData,
          custom_data: customData,
        },
      ],
    }
    if (TEST_EVENT_CODE) body.test_event_code = TEST_EVENT_CODE

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    )
    if (!res.ok) {
      console.error('[fb-capi] send failed:', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('[fb-capi] error:', err instanceof Error ? err.message : String(err))
  }
}
