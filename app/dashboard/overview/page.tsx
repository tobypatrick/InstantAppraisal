'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, Link as LinkIcon, Copy, Check, ExternalLink,
  AlertCircle, ArrowRight, TrendingUp, CreditCard, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useLeadCounts } from '@/hooks/useLeadCounts'
import { useSubscription } from '@/hooks/useSubscription'
import { LightCard, LightCardHeader } from '@/components/dashboard/LightCard'
import { ProfileReminderBanner } from '@/components/dashboard/ProfileReminderBanner'
import { TimeoutError } from '@/components/dashboard/TimeoutError'
import { getAgentPageUrl } from '@/lib/subdomain'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  full_name: string | null
  phone_number: string | null
  agency_name: string | null
  slug: string | null
}

function isProfileIncomplete(profile: Profile | null): boolean {
  if (!profile) return true
  return !(profile.full_name?.trim() && profile.phone_number?.trim() && profile.agency_name?.trim())
}

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const { data: counts, isLoading, error, refetch } = useLeadCounts()
  const { subscribed, isLoading: subLoading, createCheckout } = useSubscription()

  const totalLeads = counts?.total ?? 0
  const completeLeads = counts?.complete ?? 0
  const partialLeads = counts?.partial ?? 0
  const conversionRate = totalLeads > 0 ? Math.round((completeLeads / totalLeads) * 100) : 0

  useEffect(() => {
    const dismissed = localStorage.getItem('profile-reminder-dismissed')
    if (dismissed) setBannerDismissed(true)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setProfileLoaded(true); return }
      supabase
        .from('profiles')
        .select('full_name, phone_number, agency_name, slug')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => { setProfile(data); setProfileLoaded(true) })
    })
  }, [])

  const handleDismissBanner = () => {
    setBannerDismissed(true)
    localStorage.setItem('profile-reminder-dismissed', 'true')
  }

  const copyShareLink = () => {
    if (profile?.slug) {
      navigator.clipboard.writeText(getAgentPageUrl(profile.slug))
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRetryCheckout = async () => {
    setCheckoutLoading(true)
    try {
      await createCheckout('pro', 'month')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const showBanner = profileLoaded && isProfileIncomplete(profile) && !bannerDismissed
  const showIncompleteSignup = !subLoading && !subscribed

  if (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    const isTimeoutError = errMsg.includes('timeout') || errMsg.includes('timed out')
    return (
      <TimeoutError
        title={isTimeoutError ? 'Connection Timeout' : 'Failed to Load Data'}
        message={isTimeoutError ? 'Unable to load dashboard data. Please check your connection.' : 'Something went wrong while loading your data.'}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {showIncompleteSignup && (
        <LightCard className="border-amber-200 bg-amber-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Complete your signup</h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Your landing page won't be live until you complete your subscription setup.
                </p>
              </div>
            </div>
            <Button
              onClick={handleRetryCheckout}
              disabled={checkoutLoading}
              className="h-10 text-sm bg-amber-600 hover:bg-amber-700 text-white shrink-0 w-full sm:w-auto"
            >
              {checkoutLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</>
              ) : (
                <>Complete Checkout<ArrowRight className="h-4 w-4 ml-2" strokeWidth={1.5} /></>
              )}
            </Button>
          </div>
        </LightCard>
      )}

      {showBanner && <ProfileReminderBanner onDismiss={handleDismissBanner} />}

      <div>
        <h1 className="text-xl font-semibold mb-1 tracking-tight text-slate-900">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-sm text-slate-500">Your command centre for lead management.</p>
      </div>

      <LightCard>
        <LightCardHeader icon={<LinkIcon className="h-4 w-4" strokeWidth={1.25} />} title="Your Landing Page" />
        {profile?.slug ? (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-50 rounded px-3 py-2.5 border border-slate-200 font-mono text-xs text-slate-700 truncate">
              {getAgentPageUrl(profile.slug)}
            </div>
            <div className="flex gap-2">
              <Button onClick={copyShareLink} className="flex-1 h-11 text-sm bg-emerald-600 hover:bg-emerald-700 text-white">
                {copied ? <Check className="h-4 w-4 mr-2" strokeWidth={1.5} /> : <Copy className="h-4 w-4 mr-2" strokeWidth={1.5} />}
                {copied ? 'Copied' : 'Copy Link'}
              </Button>
              <Button variant="outline" className="h-11 text-sm" onClick={() => window.open(getAgentPageUrl(profile.slug!), '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" strokeWidth={1.5} />
                <span className="hidden sm:inline">Preview</span>
                <span className="sm:hidden">View</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.25} />
              <span>Complete your profile to get your custom URL.</span>
            </div>
            <Button className="h-10 text-sm bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto" onClick={() => window.location.href = '/dashboard/settings'}>
              Set Up Profile
            </Button>
          </div>
        )}
      </LightCard>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <LightCard className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <span className="text-[10px] md:text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 md:gap-2">
              <Users className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400" strokeWidth={1.25} />
              <span className="hidden sm:inline">Total</span> Leads
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">{totalLeads}</p>
        </LightCard>
        <LightCard className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <span className="text-[10px] md:text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 md:gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Complete
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-semibold text-emerald-600 tracking-tight">{completeLeads}</p>
        </LightCard>
        <LightCard className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <span className="text-[10px] md:text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 md:gap-2">
              <TrendingUp className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400" strokeWidth={1.25} />
              <span className="hidden sm:inline">Conversion</span>
              <span className="sm:hidden">Rate</span>
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">{conversionRate}%</p>
          {partialLeads > 0 && (
            <p className="text-[10px] md:text-xs text-slate-500 mt-1 hidden sm:block">{partialLeads} partial to follow up</p>
          )}
        </LightCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <Link href="/dashboard/leads">
          <LightCard className="group cursor-pointer active:scale-[0.98] transition-transform">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded bg-emerald-50 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-emerald-600" strokeWidth={1.25} />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-slate-900">View All Leads</h3>
                  <p className="text-xs text-slate-500">Manage and follow up</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" strokeWidth={1.25} />
            </div>
          </LightCard>
        </Link>
        <Link href="/dashboard/marketing">
          <LightCard className="group cursor-pointer active:scale-[0.98] transition-transform">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded bg-emerald-50 flex items-center justify-center shrink-0">
                  <LinkIcon className="h-5 w-5 text-emerald-600" strokeWidth={1.25} />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-slate-900">Marketing Kit</h3>
                  <p className="text-xs text-slate-500">QR codes & campaigns</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" strokeWidth={1.25} />
            </div>
          </LightCard>
        </Link>
      </div>
    </div>
  )
}
