import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { handleSubscriptionChange } from '@/lib/stripe-billing'

// Called by the checkout-success page right after payment. Retrieves the Stripe
// checkout session, reads the subscription, and provisions the billing record
// synchronously — so the dashboard activates immediately without waiting on the
// async webhook (which can be delayed, or blocked entirely on protected staging).
// The webhook remains the source of truth for ongoing changes.
export async function POST(request: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    // Authenticate the caller via their access token.
    const accessToken = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    )
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { session_id } = await request.json()
    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    const stripe = new Stripe(stripeKey)
    const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ['subscription'] })

    const subscription = session.subscription
    if (!subscription || typeof subscription === 'string') {
      // Payment not finalised yet — let the success page keep polling for the webhook.
      return NextResponse.json({ pending: true })
    }

    // Only let a user provision their OWN checkout session.
    const sessionUserId =
      (subscription.metadata?.supabase_user_id as string | undefined) ||
      (session.metadata?.supabase_user_id as string | undefined)
    if (sessionUserId && sessionUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    await handleSubscriptionChange(admin, stripe, subscription, subscription.status)

    return NextResponse.json({ success: true, status: subscription.status })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[verify-session]', message)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
