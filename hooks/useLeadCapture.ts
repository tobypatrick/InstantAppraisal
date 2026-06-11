'use client'

import { useState, useCallback, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { generatePropertyReport } from '@/lib/proptrack-api'
import { checkRateLimit, recordAttempt, getRemainingAttempts } from '@/lib/rate-limit'
import type { UTMParams } from '@/lib/utm-utils'

export interface LeadFormData {
  contact_name: string
  contact_email: string
  contact_phone: string
  interest_level: string
}

export interface RateLimitError {
  type: 'rate_limit'
  message: string
  retryAfterSeconds?: number
}

export interface SubscriptionError {
  type: 'subscription_inactive' | 'limit_reached'
  message: string
  currentUsage?: number
  limit?: number
}

export function useLeadCapture(agentId: string, utmParams?: UTMParams) {
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null)
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(null)
  const [rateLimitError, setRateLimitError] = useState<RateLimitError | null>(null)
  const [subscriptionError, setSubscriptionError] = useState<SubscriptionError | null>(null)
  const limitEmailSentRef = useRef(false)

  const checkCanSubmit = useCallback((): boolean => {
    const result = checkRateLimit()
    if (!result.allowed) {
      setRateLimitError({ type: 'rate_limit', message: result.reason || 'Too many requests', retryAfterSeconds: result.retryAfterSeconds })
      return false
    }
    setRateLimitError(null)
    return true
  }, [])

  const clearRateLimitError = useCallback(() => setRateLimitError(null), [])
  const clearSubscriptionError = useCallback(() => setSubscriptionError(null), [])
  const setPropertyId = useCallback((id: string | null) => setCurrentPropertyId(id), [])

  const createPartialLead = useMutation({
    mutationFn: async ({ address, propertyId }: { address: string; propertyId?: string }) => {
      const rateLimitCheck = checkRateLimit()
      if (!rateLimitCheck.allowed) throw new Error(rateLimitCheck.reason || 'Rate limit exceeded')

      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId,
          address,
          property_id: propertyId || null,
          utm_source: utmParams?.utm_source,
          utm_medium: utmParams?.utm_medium,
          utm_campaign: utmParams?.utm_campaign,
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.status === 429) throw new Error(data?.error || 'Too many requests. Please try again later.')
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to create lead')
      recordAttempt()
      return { id: data.lead_id, address, propertyId: propertyId || null }
    },
    onSuccess: (data) => {
      setCurrentLeadId(data.id)
      setCurrentPropertyId(data.propertyId)
      setRateLimitError(null)
    },
    onError: (error: Error) => {
      if (error.message.includes('Rate limit') || error.message.includes('Too many')) {
        setRateLimitError({ type: 'rate_limit', message: error.message })
      }
    },
  })

  const completeLead = useMutation({
    mutationFn: async (formData: LeadFormData) => {
      if (!currentLeadId) throw new Error('No lead to complete')
      const res = await fetch('/api/leads/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: currentLeadId,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          interest_level: formData.interest_level,
        }),
      })
      const data = await res.json().catch(() => null)
      if (data?.error === 'subscription_inactive') {
        setSubscriptionError({ type: 'subscription_inactive', message: data.message })
        throw new Error('subscription_inactive')
      }
      if (data?.error === 'limit_reached') {
        setSubscriptionError({ type: 'limit_reached', message: data.message, currentUsage: data.current_usage, limit: data.limit })
        throw new Error('limit_reached')
      }
      if (!data?.success) throw new Error(data?.error || 'Failed to complete lead')

      // Fire LeadConnector webhook fire-and-forget
      fetch('/api/leadconnector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, lead_id: currentLeadId }),
      }).catch(console.warn)

      return { id: currentLeadId, formData }
    },
  })

  const generateReport = useMutation({
    mutationFn: async () => {
      if (!currentLeadId) throw new Error('No lead to generate report for')
      if (!currentPropertyId) throw new Error('No property ID available')

      // Notify the agent that a lead completed. Fired here (not in the
      // complete route) so it runs exactly once per lead and — for a
      // successful report — after the URL is saved, so the email links it.
      const notifyComplete = () =>
        fetch('/api/email/lead-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'complete', lead_id: currentLeadId, agent_id: agentId }),
        }).catch((err) => console.warn('[lead-notification]', err))

      try {
        const report = await generatePropertyReport(currentPropertyId, agentId, currentLeadId)
        // Suppressed = PropTrack returned no viewable report for this property.
        const isSuppressed = report.suppressed === true || !report.reportUrl

        if (isSuppressed) {
          // Lead is still captured — notify the agent even with no report.
          notifyComplete()
          return {
            reportUrl: null,
            gracefulFailure: true,
            message: 'An appraisal estimate is not available for this property. Your local agent will be in touch with a personalised appraisal.',
          }
        }

        // Persist the report URL first so the notification email can include
        // the link, then notify the agent once.
        await fetch('/api/leads/save-estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: currentLeadId, report_url: report.reportUrl }),
        }).catch((err) => console.warn('[save-estimate]', err))
        notifyComplete()

        return { reportUrl: report.reportUrl, reportId: report.reportId }
      } catch (error: any) {
        if (error?.message === 'limit_reached') {
          if (!limitEmailSentRef.current) {
            limitEmailSentRef.current = true
            fetch('/api/email/limit-reached', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ agent_id: agentId }),
            }).catch((err) => console.warn('[limit-reached]', err))
          }
          return { reportUrl: null, gracefulFailure: true, message: 'A Report Could Not Be Generated.' }
        }
        return { reportUrl: null, gracefulFailure: true, message: 'Your request is being processed. An agent will be in touch shortly.' }
      }
    },
  })

  return {
    currentLeadId,
    currentPropertyId,
    setPropertyId,
    createPartialLead,
    completeLead,
    generateReport,
    rateLimitError,
    checkCanSubmit,
    clearRateLimitError,
    remainingAttempts: getRemainingAttempts(),
    subscriptionError,
    clearSubscriptionError,
  }
}
