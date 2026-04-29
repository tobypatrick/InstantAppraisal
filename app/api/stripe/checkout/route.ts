import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getMarketingUrl } from '@/lib/subdomain'

function getPriceId(tier: string, interval: string): string | null {
  if (tier === 'pro' && interval === 'month') return process.env.STRIPE_PRO_PRICE_ID ?? null
  if (tier === 'pro' && interval === 'year') return process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? null
  if (tier === 'elite' && interval === 'month') return process.env.STRIPE_ELITE_PRICE_ID ?? null
  if (tier === 'elite' && interval === 'year') return process.env.STRIPE_ELITE_ANNUAL_PRICE_ID ?? null
  return null
}

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

    const body = await request.json()
    const tier = body.tier ?? 'pro'
    const interval = body.interval ?? 'month'

    const priceId = getPriceId(tier, interval)
    if (!priceId) {
      return NextResponse.json({ error: `No price configured for ${tier}/${interval}` }, { status: 400 })
    }

    const stripe = new Stripe(stripeKey)

    // Look up existing Stripe customer from billing table (using service role to bypass RLS)
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: billing } = await adminSupabase
      .from('billing')
      .select('stripe_customer_id, trial_used')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = billing?.stripe_customer_id ?? null
    const trialAlreadyUsed = billing?.trial_used === true

    // If no customer yet, create one in Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
    }

    const marketingUrl = getMarketingUrl()

    // /checkout/success polls Supabase until the webhook confirms the billing record,
    // then redirects to the dashboard — avoids the race condition where the user
    // lands on the dashboard before the webhook has fired.
    const successUrl = `${marketingUrl}/checkout/success`

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        // Only offer the free trial if this user has never had one before
        ...(trialAlreadyUsed ? {} : { trial_period_days: 30 }),
        metadata: { supabase_user_id: user.id, tier, interval },
      },
      success_url: successUrl,
      cancel_url: `${marketingUrl}/#pricing`,
      allow_promotion_codes: true,
      customer_update: { address: 'auto' },
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[stripe/checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
