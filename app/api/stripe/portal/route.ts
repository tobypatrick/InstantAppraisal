import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getDashboardUrl } from '@/lib/subdomain'

export async function POST(request: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Verify the user via their access token
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

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: billing } = await adminSupabase
      .from('billing')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const customerId = billing?.stripe_customer_id
    if (!customerId) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
    }

    const stripe = new Stripe(stripeKey)

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: getDashboardUrl(),
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[stripe/portal]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
