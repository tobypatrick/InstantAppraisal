'use client'

import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubscription, TIER_CONFIG } from '@/hooks/useSubscription'
import { CreditCard, Clock, AlertTriangle, CheckCircle2, ArrowUpRight, Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import { toast } from 'sonner'
import { PricingTable } from '@/components/billing/PricingTable'
import { LightCard, LightCardHeader } from '@/components/dashboard/LightCard'
import { TimeoutError } from '@/components/dashboard/TimeoutError'

export default function BillingPage() {
  const {
    subscribed, subscriptionTier, billingInterval,
    trialDaysRemaining, currentPeriodEnd, reportLimit, reportsUsed,
    isLoading, isTrialing, isAnnual, isTimeout, error,
    openCustomerPortal, checkSubscription,
  } = useSubscription()

  const [isManaging, setIsManaging] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const usagePercentage = reportLimit > 0 ? (reportsUsed / reportLimit) * 100 : 0
  const tierConfig = subscriptionTier ? TIER_CONFIG[subscriptionTier] : null
  const currentPrice = tierConfig ? (isAnnual ? tierConfig.annual.price : tierConfig.monthly.price) : 0
  const priceLabel = isAnnual ? '/year' : '/month'
  const nextBillingDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const handleManageSubscription = async () => {
    setIsManaging(true)
    try {
      await openCustomerPortal()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal')
    } finally {
      setIsManaging(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await checkSubscription()
      toast.success('Status refreshed')
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isTimeout || (error && !isLoading)) {
    return (
      <div className="max-w-4xl mx-auto">
        <TimeoutError
          title={isTimeout ? 'Connection Timeout' : 'Failed to Load Billing'}
          message={error || 'Unable to load your subscription details. Please try again.'}
          onRetry={checkSubscription}
          isRetrying={isRefreshing}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Billing</h1>
          <p className="text-sm text-slate-500">Manage your subscription and usage</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="border-slate-200 text-slate-600 hover:bg-slate-50">
          {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </div>

      {subscribed && tierConfig && (
        <div className="grid gap-6 md:grid-cols-2">
          <LightCard>
            <div className="flex items-center justify-between mb-4">
              <LightCardHeader icon={<CreditCard className="h-4 w-4" strokeWidth={1.25} />} title="Current Plan" />
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={isAnnual ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>
                  {isAnnual ? <><CalendarRange className="h-3 w-3 mr-1" strokeWidth={1.5} />Annual</> : <><CalendarDays className="h-3 w-3 mr-1" strokeWidth={1.5} />Monthly</>}
                </Badge>
                <Badge className={isTrialing ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}>
                  {isTrialing ? 'Trial' : 'Active'}
                </Badge>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-slate-900">{tierConfig.name}</span>
              <span className="text-slate-500">${currentPrice}{priceLabel}</span>
              {isAnnual && <span className="text-xs text-emerald-600 font-medium">(${tierConfig.annual.monthlyEquivalent.toFixed(2)}/mo)</span>}
            </div>
            {isTrialing && (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
                <Clock className="h-4 w-4" strokeWidth={1.25} />
                <span>Trial ends in <strong>{trialDaysRemaining}</strong> day{trialDaysRemaining !== 1 ? 's' : ''}</span>
              </div>
            )}
            {nextBillingDate && !isTrialing && (
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-200 mb-4">
                <Calendar className="h-4 w-4" strokeWidth={1.25} />
                <span>Next billing: <strong>{nextBillingDate}</strong></span>
              </div>
            )}
            <Button onClick={handleManageSubscription} disabled={isManaging} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {isManaging ? 'Opening...' : 'Manage Subscription'}
              <ArrowUpRight className="ml-2 h-4 w-4" strokeWidth={1.25} />
            </Button>
          </LightCard>

          <LightCard>
            <LightCardHeader title="Report Usage" description="Monthly property report generation" />
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Reports used this month</span>
                  <span className="font-medium text-slate-900">{reportsUsed} / {reportLimit}</span>
                </div>
                <Progress value={usagePercentage} className="h-2 bg-slate-100" />
              </div>
              {usagePercentage >= 80 && usagePercentage < 100 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertTriangle className="h-4 w-4" strokeWidth={1.25} />
                  <span>Approaching limit</span>
                </div>
              )}
              {usagePercentage >= 100 && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4" strokeWidth={1.25} />
                  <span>Limit reached</span>
                </div>
              )}
              {usagePercentage < 80 && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.25} />
                  <span>{reportLimit - reportsUsed} reports remaining</span>
                </div>
              )}
              {isAnnual && <p className="text-xs text-slate-500 mt-2">Report usage resets monthly, even on annual plans.</p>}
            </div>
          </LightCard>
        </div>
      )}

      {!subscribed && (
        <div className="space-y-6">
          <LightCard className="border-amber-200 bg-amber-50">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" strokeWidth={1.25} />
              <div>
                <p className="font-medium text-slate-900">No active subscription</p>
                <p className="text-sm text-slate-600">Subscribe to start generating property reports and capturing leads.</p>
              </div>
            </div>
          </LightCard>
          <PricingTable />
        </div>
      )}

      {subscribed && subscriptionTier === 'pro' && (
        <LightCard>
          <LightCardHeader title="Need More Reports?" description="Upgrade to Elite for 100 reports/month and priority support" />
          <PricingTable currentTier="pro" currentInterval={billingInterval} />
        </LightCard>
      )}

      {subscribed && subscriptionTier === 'elite' && (
        <LightCard>
          <LightCardHeader
            title="Change Billing Cycle"
            description={isAnnual ? "You're on annual billing. Switch to monthly for more flexibility." : 'Switch to annual billing and save 25% (3 months free)!'}
          />
          <div className="mt-4">
            <Button onClick={handleManageSubscription} variant="outline" className="border-slate-200">
              Manage in Billing Portal
              <ArrowUpRight className="ml-2 h-4 w-4" strokeWidth={1.25} />
            </Button>
          </div>
        </LightCard>
      )}
    </div>
  )
}
