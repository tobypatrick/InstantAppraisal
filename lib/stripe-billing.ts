import Stripe from 'stripe'

// Shared billing-provisioning logic used by BOTH the Stripe webhook (source of
// truth for ongoing changes) and /api/stripe/verify-session (synchronous
// first-activation from the checkout-success page, so a paying customer isn't
// stranded if the webhook is delayed or — on staging — blocked).

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[stripe-billing] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`)
}

export const buildPriceToTier = (): Record<string, { tier: 'pro' | 'elite'; interval: 'month' | 'year' }> => {
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

export async function handleSubscriptionChange(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  stripe: Stripe,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscription: any,
  status: string
) {
  log('Processing subscription change', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status,
  })

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

  const customer = await stripe.customers.retrieve(customerId)
  if (customer.deleted) {
    log('Customer was deleted, skipping')
    return
  }

  const email = customer.email
  if (!email) {
    log('Customer has no email, skipping')
    return
  }

  const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
  if (userError) {
    log('ERROR: Failed to list users', { error: userError.message })
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = userData.users.find((u: any) => u.email === email)
  if (!user) {
    log('No user found for email', { email })
    return
  }

  log('Found user for subscription', { userId: user.id, email })

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
    log('Determined tier from price', { priceId, tier, interval })
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

  const { error: rpcError } = await supabase.rpc('update_user_billing', {
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

  if (rpcError) {
    log('RPC failed — falling back to direct upsert', { error: rpcError.message })
    // Fallback: direct upsert in case the RPC doesn't exist on this Supabase project
    const { error: upsertError } = await supabase.from('billing').upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        subscription_status: status,
        subscription_tier: tier,
        trial_end_date: trialEndDate,
        trial_used: trialUsed,
        cancelled_at: status === 'canceled' ? new Date().toISOString() : null,
        billing_interval: interval,
        price_id: priceId,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    if (upsertError) {
      log('ERROR: Direct upsert also failed', { error: upsertError.message })
      return
    }
    log('Fallback upsert succeeded', { userId: user.id, status, tier })
    return
  }

  log('Successfully updated billing record', { userId: user.id, status, tier, interval, priceId })
}
