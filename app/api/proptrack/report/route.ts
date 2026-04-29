import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPropTrackToken } from '@/lib/proptrack-token'

const TIER_LIMITS: Record<string, number> = {
  pro: 20,
  elite: 100,
}

export async function POST(request: NextRequest) {
  try {
    const { propertyId, agent_id, lead_id } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 })
    }

    const numericPropertyId = Number(propertyId)
    if (isNaN(numericPropertyId)) {
      return NextResponse.json({ error: 'propertyId must be numeric' }, { status: 400 })
    }

    // Service-role client used both for the limit check and for logging the
    // report after generation. Created up front so it is also in scope below.
    const adminSupabase = agent_id
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        )
      : null

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

    // Log the successful report so it counts against the agent's monthly quota
    // and shows up in their billing usage card.
    if (agent_id && adminSupabase) {
      const fullInsert = {
        agent_id,
        property_id: String(numericPropertyId),
        report_id: data?.reportId ?? data?.id ?? null,
        lead_id: lead_id ?? null,
      }
      const { error: logError } = await adminSupabase.from('report_usage').insert(fullInsert)
      if (logError) {
        console.error('report_usage full insert failed, retrying minimal:', logError.message)
        // Schema might be slimmer than expected — fall back to bare minimum
        // so we never silently drop a quota tick over an unknown column.
        const { error: minimalError } = await adminSupabase
          .from('report_usage')
          .insert({ agent_id })
        if (minimalError) {
          console.error('report_usage minimal insert also failed:', minimalError.message)
        }
      }
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('proptrack/report error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
