import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const REPORT_LIMITS: Record<string, number> = {
  pro: 20,
  elite: 100,
}

export async function GET(request: NextRequest) {
  try {
    // Verify user via access token
    const authHeader = request.headers.get('authorization') ?? ''
    const accessToken = authHeader.replace(/^Bearer\s+/i, '')
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role to read billing table (bypasses RLS)
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Fetch billing record
    const { data: billing, error: billingError } = await adminSupabase
      .from('billing')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (billingError) {
      console.error('[check-subscription] billing error:', billingError.message)
    }

    const status = billing?.subscription_status ?? 'none'
    const tier = billing?.subscription_tier ?? null
    const isSubscribed = ['active', 'trialing'].includes(status)

    // Count reports used in the current billing period
    let reportsUsed = 0
    if (isSubscribed && billing?.current_period_start) {
      const { count, error: usageError } = await adminSupabase
        .from('report_usage')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user.id)
        .gte('created_at', billing.current_period_start)

      if (usageError) {
        console.error('[check-subscription] usage count error:', usageError.message)
      } else {
        reportsUsed = count ?? 0
      }
    }

    const reportLimit = tier ? (REPORT_LIMITS[tier] ?? 0) : 0

    return NextResponse.json({
      subscribed: isSubscribed,
      subscription_status: status,
      subscription_tier: tier,
      billing_interval: billing?.billing_interval ?? null,
      trial_end_date: billing?.trial_end_date ?? null,
      current_period_start: billing?.current_period_start ?? null,
      current_period_end: billing?.current_period_end ?? null,
      report_limit: reportLimit,
      reports_used: reportsUsed,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[check-subscription]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
