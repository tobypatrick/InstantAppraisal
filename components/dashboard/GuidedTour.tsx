'use client'

import { useState, useEffect } from 'react'
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride'
import { useRouter, usePathname } from 'next/navigation'

interface GuidedTourProps {
  run: boolean
  onComplete: () => void
}

const tourSteps: Step[] = [
  {
    target: 'body',
    content: "Welcome! Let's get your landing page set up in a few quick steps.",
    placement: 'center',
    disableBeacon: true,
    title: 'Welcome to Instant Appraisal 👋',
  },
  {
    target: '[data-tour="settings-link"]',
    content: 'Head to Settings to add your branding, logo, and contact details.',
    placement: 'right',
    disableBeacon: true,
    title: 'Set Up Your Profile',
    spotlightClicks: true,
  },
  {
    target: '[data-tour="profile-images"]',
    content: 'Upload your profile photo and agency logo. These appear on your landing page.',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Add Your Logo & Photo',
  },
  {
    target: '[data-tour="branding-colours"]',
    content: 'Pick brand colours that match your agency for a polished, professional look.',
    placement: 'top',
    disableBeacon: true,
    title: 'Brand Colours',
  },
  {
    target: 'body',
    content: "You're all set! Share your landing page link to start capturing property leads. 🏠",
    placement: 'center',
    disableBeacon: true,
    title: "You're Ready!",
  },
]

export function GuidedTour({ run, onComplete }: GuidedTourProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  // Steps 2–3 live on the Settings page — make sure we're there.
  useEffect(() => {
    if (!run) return
    if (stepIndex >= 2 && stepIndex <= 3 && pathname !== '/settings') {
      router.push('/settings')
    }
  }, [stepIndex, run, router, pathname])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Leaving the "Settings" sidebar step → navigate, then advance.
      if (index === 1 && action !== ACTIONS.PREV) {
        router.push('/settings')
        setStepIndex(2)
        return
      }
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1))
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onComplete()
      setStepIndex(0)
    }
  }

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      spotlightPadding={8}
      callback={handleJoyrideCallback}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: '#10b981',
          textColor: '#1e293b',
          zIndex: 10000,
        },
        tooltip: { borderRadius: 8, padding: 20 },
        tooltipTitle: { fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#0f172a' },
        tooltipContent: { fontSize: 14, lineHeight: 1.5, color: '#475569' },
        buttonNext: {
          backgroundColor: '#10b981',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          padding: '8px 16px',
        },
        buttonBack: { color: '#64748b', fontSize: 13, marginRight: 8 },
        buttonSkip: { color: '#94a3b8', fontSize: 12 },
        spotlight: { borderRadius: 8 },
      }}
      floaterProps={{
        styles: { floater: { filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))' } },
      }}
    />
  )
}
