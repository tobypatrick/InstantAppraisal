'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLeadCapture, type LeadFormData } from '@/hooks/useLeadCapture'
import { MinimalistTemplate } from '@/components/landing/templates/MinimalistTemplate'
import { LimitReachedModal } from '@/components/landing/LimitReachedModal'
import { DEFAULT_HEADER_COLOR, DEFAULT_PAGE_COLOR } from '@/lib/color-utils'
import { extractUTMParams } from '@/lib/utm-utils'
import { createClient } from '@/lib/supabase/client'
import type { PublicProfile } from '@/hooks/useAgentProfile'

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

  // Abandon detection
  const leadCompletedRef = useRef(false)
  const partialNotifiedRef = useRef(false)
  const abandonTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sendPartialNotification = useCallback(() => {
    if (leadCompletedRef.current || partialNotifiedRef.current || !leadCapture.currentLeadId) return
    partialNotifiedRef.current = true
    const supabase = createClient()
    supabase.functions.invoke('send-lead-notification', {
      body: { type: 'partial', lead_id: leadCapture.currentLeadId, agent_id: profile.id },
    }).catch(console.warn)
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

  const handleAddressSubmit = async (address: string, propertyId?: string) => {
    if (!leadCapture.checkCanSubmit()) return
    setSubmittedAddress(address)
    try {
      await leadCapture.createPartialLead.mutateAsync({ address, propertyId })
      setStep('contact')
    } catch {
      // error handled by mutation
    }
  }

  const handleContactSubmit = async (data: LeadFormData) => {
    try {
      leadCompletedRef.current = true
      if (abandonTimeoutRef.current) clearTimeout(abandonTimeoutRef.current)
      await leadCapture.completeLead.mutateAsync(data)
      // Send vendor confirmation email (fire and forget)
      createClient().functions.invoke('send-vendor-confirmation', {
        body: { lead_id: leadCapture.currentLeadId, agent_id: profile.id },
      }).catch(console.warn)
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead')
      }
      setStep('loading')

      const result = await leadCapture.generateReport.mutateAsync()

      if (result.reportUrl) {
        window.location.href = result.reportUrl
        return
      }

      setIsGracefulFailure(true)
      setGracefulFailureMessage(result.message || 'Your local agent will be in touch shortly.')
      setReportUrl(null)
      setStep('success')
    } catch (err) {
      if (err instanceof Error && (err.message === 'limit_reached' || err.message === 'subscription_inactive')) return
      throw err
    }
  }

  const headerBgColor = profile.header_bg_color || DEFAULT_HEADER_COLOR
  const pageBgColor = profile.page_bg_color || DEFAULT_PAGE_COLOR

  return (
    <>
      <MinimalistTemplate
        profile={profile}
        headerBgColor={headerBgColor}
        pageBgColor={pageBgColor}
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
