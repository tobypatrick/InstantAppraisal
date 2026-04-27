'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Sparkles } from 'lucide-react'
import { useSubscription, TIER_CONFIG, type BillingInterval } from '@/hooks/useSubscription'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PricingTableProps {
  currentTier?: 'pro' | 'elite' | null
  currentInterval?: BillingInterval | null
  onCheckout?: () => void
}

export function PricingTable({ currentTier, currentInterval, onCheckout }: PricingTableProps) {
  const { createCheckout, billingInterval: userBillingInterval } = useSubscription()
  const [loadingTier, setLoadingTier] = useState<'pro' | 'elite' | null>(null)
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>(
    currentInterval || userBillingInterval || 'month'
  )

  const handleSubscribe = async (tier: 'pro' | 'elite') => {
    setLoadingTier(tier)
    try {
      await createCheckout(tier, selectedInterval)
      onCheckout?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout')
    } finally {
      setLoadingTier(null)
    }
  }

  const tiers = [
    { key: 'pro' as const, ...TIER_CONFIG.pro, popular: false },
    { key: 'elite' as const, ...TIER_CONFIG.elite, popular: true },
  ]

  const isAnnual = selectedInterval === 'year'

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setSelectedInterval('month')}
            className={cn('px-4 py-2 text-sm font-medium rounded-md transition-all', !isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedInterval('year')}
            className={cn('px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2', isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
          >
            Annual
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">Save 25%</Badge>
          </button>
        </div>
        {isAnnual && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">3 months free with annual billing!</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto pt-4">
        {tiers.map((tier) => {
          const isCurrentTier = currentTier === tier.key
          const isCurrentInterval = currentInterval === selectedInterval
          const isExactMatch = isCurrentTier && isCurrentInterval
          const tierRank = { pro: 1, elite: 2 } as const
          const isUpgrade = currentTier ? tierRank[tier.key] > tierRank[currentTier] : false
          const isDowngrade = currentTier ? tierRank[tier.key] < tierRank[currentTier] : false
          const displayPrice = isAnnual ? tier.annual.price : tier.monthly.price
          const monthlyEquivalent = isAnnual ? tier.annual.monthlyEquivalent : tier.monthly.price

          return (
            <div key={tier.key} className="relative pt-3">
              {tier.popular && !isExactMatch && (
                <Badge className="absolute top-0 left-1/2 -translate-x-1/2 z-10" variant="default">
                  <Zap className="h-3 w-3 mr-1" />Popular
                </Badge>
              )}
              {isExactMatch && (
                <Badge className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-green-600">
                  <Check className="h-3 w-3 mr-1" />Your Plan
                </Badge>
              )}
            <Card className={cn('border transition-all h-full', tier.popular && 'border-primary shadow-sm', isExactMatch && 'border-green-500 bg-green-50/30')}>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>{tier.reportLimit} reports/month</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-4">
                {isAnnual ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">${monthlyEquivalent.toFixed(2)}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-muted-foreground line-through">${tier.monthly.price * 12}/yr</span>
                      <span className="text-sm font-medium text-emerald-600">${displayPrice}/yr</span>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Save ${(tier.monthly.price * 12) - displayPrice}/year
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">${displayPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2">30-day free trial, cancel anytime</p>
              </CardContent>
              <CardContent className="pt-0 pb-4">
                <ul className="space-y-2.5">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? 'default' : 'outline'}
                  disabled={isExactMatch || loadingTier !== null}
                  onClick={() => handleSubscribe(tier.key)}
                >
                  {loadingTier === tier.key ? 'Starting...'
                    : isExactMatch ? 'Current Plan'
                    : isCurrentTier && !isCurrentInterval ? `Switch to ${isAnnual ? 'Annual' : 'Monthly'}`
                    : isUpgrade ? 'Upgrade'
                    : isDowngrade ? 'Downgrade'
                    : 'Start Free Trial'}
                </Button>
              </CardFooter>
            </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
