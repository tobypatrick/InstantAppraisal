import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPropTrackToken } from '@/lib/proptrack-token'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit-server'

const TIER_LIMITS: Record<string, number> = {
  pro: 20,
  elite: 100,
}

// Report generation is the costly PropTrack call. The per-agent monthly cap
// bounds spend per agent, but agent_id comes from the (forgeable) request
// body, so cap by IP too — stops a script from burning reports / exhausting
// agents' quotas at scale.
const REPORT_RATE_MAX = 15
const REPORT_RATE_WINDOW_MS = 60 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const { propertyId, agent_id } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 })
    }

    const numericPropertyId = Number(propertyId)
    if (isNaN(numericPropertyId)) {
      return NextResponse.json({ error: 'propertyId must be numeric' }, { status: 400 })
    }

    // Service-role client used for the rate-limit check and the agent's
    // subscription/limit check below.
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const ip = getClientIP(request)
    const rate = await checkRateLimit(adminSupabase, ip, 'proptrack-report', REPORT_RATE_MAX, REPORT_RATE_WINDOW_MS)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfter: rate.retryAfterSeconds },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
      )
    }

    if (agent_id && adminSupabase) {
      const supabase = adminSupabase

      const { data: billing } = await supabase
        .from('billing')
        .select('subscription_status, subscription_tier')
        .eq('user_id', agent_id)
        .single()

      const isActive = ['active', 'trialing'].includes(billing?.subscription_status ?? '')
      if (!isActive) {
        return NextResponse.json(
          { error: 'subscription_inactive', message: 'Agent subscription is not active' },
          { status: 403 }
        )
      }

      const tier = billing?.subscription_tier ?? ''
      const reportLimit = TIER_LIMITS[tier] ?? 0

      const { data: usageCount } = await supabase.rpc('get_monthly_report_count', {
        p_agent_id: agent_id,
      })

      const currentUsage = usageCount ?? 0
      if (currentUsage >= reportLimit) {
        return NextResponse.json(
          {
            error: 'limit_reached',
            message: 'Monthly report limit reached',
            current_usage: currentUsage,
            limit: reportLimit,
          },
          { status: 403 }
        )
      }
    }

    const token = await getPropTrackToken()
    const baseUrl = process.env.PROPTRACK_BASE_URL

    if (!baseUrl) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const requestBody = {
      propertyId: numericPropertyId,
      meta: {
        clientInfo: {
          abn: '18 658 709 721',
          legalName: 'Strud Marketing Pty Ltd',
        },
      },
    }

    const res = await fetch(`${baseUrl}/api/v1/reports/property`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('PropTrack report error:', res.status, body)
      return NextResponse.json({ error: 'PropTrack API error', status: res.status }, { status: 502 })
    }

    const data = await res.json()

    // NOTE: report usage is recorded once, in the complete-lead step
    // (record_report_usage RPC). The previous port ALSO inserted here, which
    // double-counted every report against the agent's monthly quota. Do not
    // record usage in this route.

    return NextResponse.json(data)
  } catch (err) {
    console.error('proptrack/report error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
