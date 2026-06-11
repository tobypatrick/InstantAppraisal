import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit-server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const RATE_MAX = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

function sanitizeUtm(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim()
  if (!v) return null
  if (/<[^>]*>/g.test(v)) return null
  return v.length > 100 ? v.slice(0, 100) : v
}

function validateAddress(address: unknown): string | null {
  if (typeof address !== 'string' || address.trim().length < 5) return 'Address must be at least 5 characters'
  if (address.length > 500) return 'Address must be less than 500 characters'
  if (/<[^>]*>/g.test(address)) return 'Address cannot contain HTML tags'
  return null
}

// Ports the original create-lead edge function into the Next.js codebase.
// Inserts a partial lead with server-side IP rate limiting. Does NOT send a
// partial-lead notification — the landing page fires that on genuine abandon
// (2-minute timer / page unload), so notifying here would email the agent on
// every address search.
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const ip = getClientIP(request)
    const rate = await checkRateLimit(supabase, ip, 'create-lead', RATE_MAX, RATE_WINDOW_MS)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfter: rate.retryAfterSeconds },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
      )
    }

    const { agent_id, address, utm_source, utm_medium, utm_campaign } = await request.json()

    if (!agent_id || !UUID_RE.test(agent_id)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 })
    }

    const addressError = validateAddress(address)
    if (addressError) {
      return NextResponse.json({ error: addressError }, { status: 400 })
    }

    const { data: agent } = await supabase.from('profiles').select('id').eq('id', agent_id).maybeSingle()
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        agent_id,
        address: address.trim(),
        status: 'partial',
        utm_source: sanitizeUtm(utm_source),
        utm_medium: sanitizeUtm(utm_medium),
        utm_campaign: sanitizeUtm(utm_campaign),
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, lead_id: lead.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[leads/create]', message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
