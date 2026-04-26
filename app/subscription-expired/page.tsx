'use client'

import { useState } from 'react'
import { AlertTriangle, ArrowRight, Check, LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LeadAgentLogo } from '@/components/ui/LeadAgentLogo'
import { useSubscription, TIER_CONFIG } from '@/hooks/useSubscription'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { BillingInterval } from '@/hooks/useSubscription'

export default function SubscriptionExpiredPage() {
  const { createCheckout } = useSubscription()
  const [loadingTier, setLoadingTier] = useState<'pro' | 'elite' | null>(null)
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('month')
  const isAnnual = selectedInterval === 'year'

  const handleSubscribe = async (tier: 'pro' | 'elite') => {
    setLoadingTier(tier)
    try {
      await createCheckout(tier, selectedInterval)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout')
    } finally {
      setLoadingTier(null)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = 'https://instantappraisal.co/'
  }

  const tiers = [
    { key: 'pro' as const, ...TIER_CONFIG.pro, popular: false },
    { key: 'elite' as const, ...TIER_CONFIG.elite, popular: true },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <LeadAgentLogo height={36} className="mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded text-sm font-medium mb-4 border border-amber-200">
            <AlertTriangle className="h-4 w-4" />
            Your subscription has expired
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome back — pick a plan to continue</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your existing leads, settings, and landing page are safe. Choose a plan below to restore full access.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setSelectedInterval('month')}
              className={cn('px-4 py-2 text-sm font-medium rounded-md transition-all', !isAnnual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedInterval('year')}
              className={cn('px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2', isAnnual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              Annual
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">Save 25%</Badge>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {tiers.map((tier) => {
            const displayPrice = isAnnual ? tier.annual.monthlyEquivalent : tier.monthly.price
            return (
              <div key={tier.key} className={cn('relative border rounded-lg p-6 transition-all', tier.popular ? 'border-emerald-500 shadow-sm' : 'border-border')}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white">Popular</Badge>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.reportLimit} reports/month</p>
                </div>
                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">${displayPrice.toFixed(2)}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn('w-full', tier.popular ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : '')}
                  variant={tier.popular ? 'default' : 'outline'}
                  disabled={loadingTier !== null}
                  onClick={() => handleSubscribe(tier.key)}
                >
                  {loadingTier === tier.key ? (
                    <><span className="inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />Redirecting...</>
                  ) : (
                    <>Resubscribe <ArrowRight className="h-4 w-4 ml-2" /></>
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
          <Shield className="h-3.5 w-3.5" />
          Secured by Stripe. Your account and data are preserved.
        </div>

        <div className="flex items-center justify-center gap-4">
          <button onClick={handleSignOut} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
          <span className="text-muted-foreground/40">·</span>
          <a href="mailto:support@instantappraisal.co" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Need help?
          </a>
        </div>
      </div>
    </div>
  )
}
