'use client'

import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type BillingInterval = 'month' | 'year'

export const TIER_CONFIG = {
  pro: {
    name: 'Pro',
    monthly: { price: 99 },
    annual: { price: 891, monthlyEquivalent: 74.25 },
    reportLimit: 20,
    features: [
      '20 property reports/month',
      'Custom landing page',
      'Lead capture forms',
      'Email notifications',
      'Analytics dashboard',
      'Custom branding',
    ],
  },
  elite: {
    name: 'Elite',
    monthly: { price: 199 },
    annual: { price: 1791, monthlyEquivalent: 149.25 },
    reportLimit: 100,
    features: [
      '100 property reports/month',
      'Custom landing page',
      'Lead capture forms',
      'Email notifications',
      'Analytics dashboard',
      'Custom branding',
    ],
  },
}

interface SubscriptionData {
  subscribed: boolean
  subscription_status: string
  subscription_tier: 'pro' | 'elite' | null
  billing_interval: BillingInterval | null
  trial_end_date: string | null
  current_period_start: string | null
  current_period_end: string | null
  report_limit: number
  reports_used: number
}

const EMPTY_DATA: SubscriptionData = {
  subscribed: false,
  subscription_status: 'none',
  subscription_tier: null,
  billing_interval: null,
  trial_end_date: null,
  current_period_start: null,
  current_period_end: null,
  report_limit: 0,
  reports_used: 0,
}

export function useSubscription() {
  const supabase = createClient()

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['subscription'],
    queryFn: async (): Promise<SubscriptionData> => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return EMPTY_DATA

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (error) throw error
      return data as SubscriptionData
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
    retry: 1,
  })

  const sub = data ?? EMPTY_DATA
  const errorMessage = queryError
    ? queryError instanceof Error ? queryError.message : 'Failed to check subscription'
    : null
  const isTimeout = errorMessage?.includes('timed out') ?? false

  const createCheckout = useCallback(async (tier: 'pro' | 'elite', interval: BillingInterval = 'month') => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Not authenticated')

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: { tier, interval },
    })

    if (error) throw error
    if (data?.message) toast(data.message)
    if (data?.url) window.location.href = data.url
  }, [supabase])

  const openCustomerPortal = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Not authenticated')

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    if (error) throw error
    if (data?.url) window.open(data.url, '_blank')
  }, [supabase])

  const trialDaysRemaining = sub.trial_end_date
    ? Math.max(0, Math.ceil((new Date(sub.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const isTrialing = sub.subscription_status === 'trialing'
  const canGenerateReport = sub.subscribed && sub.reports_used < sub.report_limit
  const isAnnual = sub.billing_interval === 'year'

  return {
    subscribed: sub.subscribed,
    subscriptionStatus: sub.subscription_status,
    subscriptionTier: sub.subscription_tier,
    billingInterval: sub.billing_interval,
    trialEndDate: sub.trial_end_date,
    currentPeriodStart: sub.current_period_start,
    currentPeriodEnd: sub.current_period_end,
    reportLimit: sub.report_limit,
    reportsUsed: sub.reports_used,
    isLoading,
    error: errorMessage,
    isTimeout,
    trialDaysRemaining,
    isTrialing,
    canGenerateReport,
    isAnnual,
    checkSubscription: refetch,
    createCheckout,
    openCustomerPortal,
  }
}
