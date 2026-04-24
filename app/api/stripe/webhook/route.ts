import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : ''
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`)
}

const buildPriceToTier = (): Record<string, { tier: 'pro' | 'elite'; interval: 'month' | 'year' }> => {
  const map: Record<string, { tier: 'pro' | 'elite'; interval: 'month' | 'year' }> = {}
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID
  const proAnnualPriceId = process.env.STRIPE_PRO_ANNUAL_PRICE_ID
  const elitePriceId = process.env.STRIPE_ELITE_PRICE_ID
  const eliteAnnualPriceId = process.env.STRIPE_ELITE_ANNUAL_PRICE_ID
  if (proPriceId) map[proPriceId] = { tier: 'pro', interval: 'month' }
  if (proAnnualPriceId) map[proAnnualPriceId] = { tier: 'pro', interval: 'year' }
  if (elitePriceId) map[elitePriceId] = { tier: 'elite', interval: 'month' }
  if (eliteAnnualPriceId) map[eliteAnnualPriceId] = { tier: 'elite', interval: 'year' }
  return map
}

async function handleSubscriptionChange(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  stripe: Stripe,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscription: any,
  status: string
) {
  logStep('Processing subscription change', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status,
  })

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

  const customer = await stripe.customers.retrieve(customerId)
  if (customer.deleted) {
    logStep('Customer was deleted, skipping')
    return
  }

  const email = customer.email
  if (!email) {
    logStep('Customer has no email, skipping')
    return
  }

  const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
  if (userError) {
    logStep('ERROR: Failed to list users', { error: userError.message })
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = userData.users.find((u: any) => u.email === email)
  if (!user) {
    logStep('No user found for email', { email })
    return
  }

  logStep('Found user for subscription', { userId: user.id, email })

  let tier: 'pro' | 'elite' = 'pro'
  let interval: 'month' | 'year' = 'month'
  let priceId: string | null = null

  if (subscription.items.data.length > 0) {
    priceId = subscription.items.data[0].price.id
    const PRICE_TO_TIER = buildPriceToTier()
    if (priceId && PRICE_TO_TIER[priceId]) {
      const tierInfo = PRICE_TO_TIER[priceId]
      tier = tierInfo.tier
      interval = tierInfo.interval
    }
    logStep('Determined tier from price', { priceId, tier, interval })
  }

  const trialUsed = subscription.trial_start !== null || subscription.trial_end !== null
  const trialEndDate = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null
  const currentPeriodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000).toISOString()
    : null
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null

  const { error: updateError } = await supabase.rpc('update_user_billing', {
    p_user_id: user.id,
    p_stripe_customer_id: customerId,
    p_subscription_status: status,
    p_subscription_tier: tier,
    p_trial_end_date: trialEndDate,
    p_trial_used: trialUsed,
    p_cancelled_at: status === 'canceled' ? new Date().toISOString() : null,
    p_billing_interval: interval,
    p_price_id: priceId,
    p_current_period_start: currentPeriodStart,
    p_current_period_end: currentPeriodEnd,
  })

  if (updateError) {
    logStep('ERROR: Failed to update billing', { error: updateError.message })
    return
  }

  logStep('Successfully updated billing record', { userId: user.id, status, tier, interval, priceId })
}

async function deleteAgentAccount(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  stripe: Stripe,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscription: any
) {
  try {
    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted || !customer.email) {
      logStep('Cannot delete account: customer deleted or no email')
      return
    }

    const { data: userData } = await supabase.auth.admin.listUsers()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = userData?.users?.find((u: any) => u.email === customer.email)
    if (!user) {
      logStep('No user found for email, skipping account deletion', { email: customer.email })
      return
    }

    logStep('Deleting agent account', { userId: user.id, email: customer.email })

    await supabase.from('leads').update({ orphaned: true }).eq('agent_id', user.id)
    await supabase.from('analytics').delete().eq('agent_id', user.id)
    await supabase.from('report_usage').delete().eq('agent_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.from('billing').delete().eq('user_id', user.id)

    const { error: authErr } = await supabase.auth.admin.deleteUser(user.id)
    if (authErr) {
      logStep('ERROR: Failed to delete auth user', { error: authErr.message })
    } else {
      logStep('Successfully deleted agent account', { userId: user.id })
    }
  } catch (error) {
    logStep('ERROR in deleteAgentAccount', { message: error instanceof Error ? error.message : String(error) })
  }
}

export async function POST(request: NextRequest) {
  try {
    logStep('Webhook received')

    const stripeKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set')
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set')

    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    const body = await request.text()
    const stripe = new Stripe(stripeKey)

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
      logStep('Signature verified', { eventType: event.type, eventId: event.id })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      logStep('ERROR: Signature verification failed', { message })
      return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = event.data.object as any

    switch (event.type) {
      case 'customer.subscription.created': {
        const sub = obj as Stripe.Subscription
        await handleSubscriptionChange(supabase, stripe, sub, 'active')
        break
      }
      case 'customer.subscription.updated': {
        await handleSubscriptionChange(supabase, stripe, obj, obj.status)
        break
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionChange(supabase, stripe, obj, 'canceled')
        await deleteAgentAccount(supabase, stripe, obj)
        break
      }
      case 'customer.subscription.paused': {
        await handleSubscriptionChange(supabase, stripe, obj, 'paused')
        break
      }
      case 'customer.subscription.resumed': {
        await handleSubscriptionChange(supabase, stripe, obj, 'active')
        break
      }
      case 'invoice.payment_failed': {
        if (obj.subscription && typeof obj.subscription === 'string') {
          const sub = await stripe.subscriptions.retrieve(obj.subscription)
          await handleSubscriptionChange(supabase, stripe, sub, 'past_due')
        }
        break
      }
      case 'invoice.payment_succeeded': {
        if (obj.subscription && typeof obj.subscription === 'string') {
          const sub = await stripe.subscriptions.retrieve(obj.subscription)
          await handleSubscriptionChange(supabase, stripe, sub, sub.status)
        }
        break
      }
      default:
        logStep('Unhandled event type', { type: event.type })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logStep('ERROR in stripe-webhook', { message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
