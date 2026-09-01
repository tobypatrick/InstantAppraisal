'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLeadCapture, type LeadFormData } from '@/hooks/useLeadCapture'
import { MinimalistTemplate } from '@/components/landing/templates/MinimalistTemplate'
import { LimitReachedModal } from '@/components/landing/LimitReachedModal'
import { DEFAULT_HEADER_COLOR, DEFAULT_PAGE_COLOR, DEFAULT_ACCENT_COLOR } from '@/lib/color-utils'
import { extractUTMParams } from '@/lib/utm-utils'
import type { PublicProfile } from '@/hooks/useAgentProfile'
import { normaliseVariant } from '@/lib/landing-variants'

type CaptureStep = 'address' | 'contact' | 'loading' | 'success'

interface Props {
  profile: PublicProfile
}

export function AgentLandingClient({ profile }: Props) {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<CaptureStep>('address')
  const [submittedAddress, setSubmittedAddress] = useState('')
  const [reportUrl, setReportUrl] = useState<string | null>(null)
  const [isGracefulFailure, setIsGracefulFailure] = useState(false)
  const [gracefulFailureMessage, setGracefulFailureMessage] = useState('')

  const utmParams = useMemo(() => extractUTMParams(searchParams), [searchParams])
  const leadCapture = useLeadCapture(profile.id, utmParams)

  // Guards against a double form submit (e.g. double-click) firing the
  // complete-lead + report flow twice, which double-charges the agent's
  // monthly report quota and sends duplicate notification emails.
  const contactSubmitInFlightRef = useRef(false)

  // Track page view exactly once per mount
  const viewTrackedRef = useRef(false)
  useEffect(() => {
    if (viewTrackedRef.current) return
    viewTrackedRef.current = true
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id: profile.id,
        event_type: 'view',
        source: utmParams.utm_source ?? null,
      }),
    }).catch((err) => console.warn('[analytics]', err))
  }, [profile.id, utmParams.utm_source])

  // Abandon detection
  const leadCompletedRef = useRef(false)
  const partialNotifiedRef = useRef(false)
  const abandonTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sendPartialNotification = useCallback(() => {
    if (leadCompletedRef.current || partialNotifiedRef.current || !leadCapture.currentLeadId) return
    partialNotifiedRef.current = true
    fetch('/api/email/lead-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'partial',
        lead_id: leadCapture.currentLeadId,
        agent_id: profile.id,
      }),
      keepalive: true, // beforeunload may have fired
    }).catch((err) => console.warn('[partial notification]', err))
  }, [leadCapture.currentLeadId, profile.id])

  useEffect(() => {
    if (leadCapture.currentLeadId && step === 'contact') {
      leadCompletedRef.current = false
      partialNotifiedRef.current = false
      abandonTimeoutRef.current = setTimeout(sendPartialNotification, 2 * 60 * 1000)
    }
    return () => { if (abandonTimeoutRef.current) clearTimeout(abandonTimeoutRef.current) }
  }, [leadCapture.currentLeadId, step, sendPartialNotification])

  useEffect(() => {
    const handleUnload = () => sendPartialNotification()
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [sendPartialNotification])

  // Fire a GTM dataLayer event and (optionally) a Facebook Pixel event.
  // Lets agents build GTM triggers / FB conversions on each funnel step.
  const fireTracking = (gtmEvent: string, fbEvent?: string) => {
    if (typeof window === 'undefined') return
    const w = window as any
    w.dataLayer = w.dataLayer || []
    w.dataLayer.push({ event: gtmEvent })
    if (fbEvent && typeof w.fbq === 'function') w.fbq('track', fbEvent)
  }

  const handleAddressSubmit = async (address: string, propertyId?: string) => {
    if (!leadCapture.checkCanSubmit()) return
    setSubmittedAddress(address)
    try {
      await leadCapture.createPartialLead.mutateAsync({ address, propertyId })
      // Track the address search on both GTM and the Pixel.
      fireTracking('address_submit', 'Search')
      setStep('contact')
    } catch {
      // error handled by mutation
    }
  }

  const handleContactSubmit = async (data: LeadFormData) => {
    if (contactSubmitInFlightRef.current) return
    contactSubmitInFlightRef.current = true
    try {
      leadCompletedRef.current = true
      if (abandonTimeoutRef.current) clearTimeout(abandonTimeoutRef.current)
      const completeResult = await leadCapture.completeLead.mutateAsync(data)
      // Track the completed lead on both GTM and the Pixel.
      fireTracking('lead_submit', 'Lead')

      // Agent is over their monthly report cap. The lead is captured, but no
      // report is generated — show the homeowner a sorry message and send the
      // agent a "lead captured, upgrade to send their report" email.
      if (completeResult.limitBlocked) {
        fetch('/api/email/lead-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'limit_blocked', lead_id: leadCapture.currentLeadId, agent_id: profile.id }),
        }).catch((err) => console.warn('[limit-blocked notification]', err))

        // Still confirm to the homeowner (the lead has no report_url, so the
        // route sends the "agent will be in touch" version, not a report one).
        fetch('/api/email/vendor-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: leadCapture.currentLeadId, agent_id: profile.id }),
        }).catch((err) => console.warn('[vendor confirmation]', err))

        setIsGracefulFailure(true)
        setGracefulFailureMessage('Sorry, A Report Could Not Be Generated On Your Property.')
        setReportUrl(null)
        setStep('success')
        return
      }

      setStep('loading')

      const result = await leadCapture.generateReport.mutateAsync()

      // Fire vendor confirmation. keepalive=true lets the request survive
      // the upcoming page redirect so the homeowner reliably gets the email
      // even when we navigate them straight to the PropTrack report.
      fetch('/api/email/vendor-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadCapture.currentLeadId,
          agent_id: profile.id,
        }),
        keepalive: true,
      }).catch((err) => console.warn('[vendor confirmation]', err))

      if (result.reportUrl) {
        window.location.href = result.reportUrl
        return
      }

      setIsGracefulFailure(true)
      setGracefulFailureMessage(result.message || 'Your local agent will be in touch shortly.')
      setReportUrl(null)
      setStep('success')
    } catch (err) {
      // Allow a retry after a genuine failure
      contactSubmitInFlightRef.current = false
      if (err instanceof Error && (err.message === 'limit_reached' || err.message === 'subscription_inactive')) return
      throw err
    }
  }

  const headerBgColor = profile.header_bg_color || DEFAULT_HEADER_COLOR
  const pageBgColor = profile.page_bg_color || DEFAULT_PAGE_COLOR
  const accentColor = profile.accent_color || DEFAULT_ACCENT_COLOR
  // Falls back to 'sales' if the column/RPC field is missing, so the page is
  // safe to deploy before the landing_variant migration is applied.
  const variant = normaliseVariant(profile.landing_variant)

  return (
    <>
      <MinimalistTemplate
        profile={profile}
        variant={variant}
        headerBgColor={headerBgColor}
        pageBgColor={pageBgColor}
        accentColor={accentColor}
        step={step}
        submittedAddress={submittedAddress}
        reportUrl={reportUrl}
        onAddressSubmit={handleAddressSubmit}
        onContactSubmit={handleContactSubmit}
        isAddressLoading={leadCapture.createPartialLead.isPending}
        isContactLoading={leadCapture.completeLead.isPending}
        rateLimitError={leadCapture.rateLimitError}
        onClearRateLimitError={leadCapture.clearRateLimitError}
        isGracefulFailure={isGracefulFailure}
        gracefulFailureMessage={gracefulFailureMessage}
        leadId={leadCapture.currentLeadId}
      />

      <LimitReachedModal
        open={leadCapture.subscriptionError?.type === 'limit_reached'}
        onClose={leadCapture.clearSubscriptionError}
        currentUsage={leadCapture.subscriptionError?.currentUsage ?? 0}
        limit={leadCapture.subscriptionError?.limit ?? 0}
        agentName={profile.full_name || undefined}
      />
    </>
  )
}
