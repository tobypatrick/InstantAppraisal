'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X } from 'lucide-react'

interface GuidedTourProps {
  run: boolean
  onComplete: () => void
}

type Placement = 'center' | 'right' | 'bottom' | 'top'

interface TourStep {
  target: string // CSS selector, or 'center' for a centred modal
  title: string
  content: string
  placement: Placement
  /** Navigate here before showing the step (used for steps on another page). */
  navigateTo?: string
}

const STEPS: TourStep[] = [
  {
    target: 'center',
    title: 'Welcome to Instant Appraisal 👋',
    content: "Let's get your landing page set up in a few quick steps.",
    placement: 'center',
  },
  {
    target: '[data-tour="settings-link"]',
    title: 'Set Up Your Profile',
    content: 'Head to Settings to add your branding, logo, and contact details.',
    placement: 'right',
  },
  {
    target: '[data-tour="profile-images"]',
    title: 'Add Your Logo & Photo',
    content: 'Upload your profile photo and agency logo. These appear on your landing page.',
    placement: 'bottom',
    navigateTo: '/settings',
  },
  {
    target: '[data-tour="branding-colours"]',
    title: 'Brand Colours',
    content: 'Pick brand colours that match your agency for a polished, professional look.',
    placement: 'top',
    navigateTo: '/settings',
  },
  {
    target: 'center',
    title: "You're Ready!",
    content: "You're all set! Share your landing page link to start capturing property leads. 🏠",
    placement: 'center',
  },
]

const ACCENT = '#10b981'
const PAD = 8 // spotlight padding around the target
const CARD_W = 320

interface Box {
  top: number
  left: number
  width: number
  height: number
}

export function GuidedTour({ run, onComplete }: GuidedTourProps) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<Box | null>(null) // target rect, null = centred
  const router = useRouter()
  const pathname = usePathname()
  const findTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const step = STEPS[index]
  const isFirst = index === 0
  const isLast = index === STEPS.length - 1

  const finish = useCallback(() => {
    setIndex(0)
    setRect(null)
    onComplete()
  }, [onComplete])

  // Make sure we're on the right page for steps that live elsewhere.
  useEffect(() => {
    if (!run) return
    if (step.navigateTo && pathname !== step.navigateTo) {
      router.push(step.navigateTo)
    }
  }, [run, step.navigateTo, pathname, router])

  // Locate the target element (retrying briefly, since it may mount after a
  // navigation), then track its position on scroll/resize.
  useEffect(() => {
    if (!run) return

    // On mobile the sidebar is off-canvas, so its anchored step (placement
    // 'right') can't be spotlighted — render it as a centred card instead.
    const isMobile = window.innerWidth < 768
    if (step.target === 'center' || (isMobile && step.placement === 'right')) {
      setRect(null)
      return
    }

    let attempts = 0
    const locate = () => {
      const el = document.querySelector(step.target) as HTMLElement | null
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const measure = () => {
          const r = el.getBoundingClientRect()
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
        }
        measure()
        // Re-measure after the smooth scroll settles.
        findTimer.current = setTimeout(measure, 350)
        window.addEventListener('scroll', measure, true)
        window.addEventListener('resize', measure)
        return () => {
          window.removeEventListener('scroll', measure, true)
          window.removeEventListener('resize', measure)
        }
      }
      // Not found yet — retry up to ~2s, then fall back to a centred card.
      if (attempts++ < 20) {
        findTimer.current = setTimeout(locate, 100)
      } else {
        setRect(null)
      }
      return undefined
    }

    const cleanup = locate()
    return () => {
      if (findTimer.current) clearTimeout(findTimer.current)
      if (cleanup) cleanup()
    }
  }, [run, index, step.target])

  const next = () => (isLast ? finish() : setIndex((i) => Math.min(i + 1, STEPS.length - 1)))
  const back = () => setIndex((i) => Math.max(i - 1, 0))

  if (!run) return null

  // Compute the tooltip card position.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768
  const cardW = Math.min(CARD_W, vw - 24) // fit narrow mobile screens
  const clampLeft = (l: number) => Math.max(12, Math.min(l, vw - cardW - 12))

  let cardStyle: React.CSSProperties
  if (!rect || step.placement === 'center') {
    cardStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  } else if (step.placement === 'right') {
    cardStyle = { top: clampTop(rect.top + rect.height / 2 - 70, vh), left: clampLeft(rect.left + rect.width + 16) }
  } else if (step.placement === 'top') {
    cardStyle = { top: Math.max(12, rect.top - 180), left: clampLeft(rect.left + rect.width / 2 - cardW / 2) }
  } else {
    // bottom
    cardStyle = { top: Math.min(rect.top + rect.height + 16, vh - 200), left: clampLeft(rect.left + rect.width / 2 - cardW / 2) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
      {/* Dim overlay — with a spotlight cut-out when a target is present. */}
      {rect ? (
        <div
          style={{
            position: 'fixed',
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            borderRadius: 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            transition: 'all 0.2s ease',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      )}

      {/* Tooltip card */}
      <div
        role="dialog"
        aria-label={step.title}
        style={{
          position: 'fixed',
          width: cardW,
          background: '#ffffff',
          borderRadius: 10,
          padding: 20,
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          ...cardStyle,
        }}
      >
        <button
          type="button"
          onClick={finish}
          aria-label="Close tour"
          style={{ position: 'absolute', top: 12, right: 12, color: '#94a3b8', lineHeight: 0 }}
        >
          <X className="h-4 w-4" />
        </button>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 8px', paddingRight: 16 }}>
          {step.title}
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: '#475569', margin: 0 }}>{step.content}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {index + 1} of {STEPS.length}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isFirst && (
              <button
                type="button"
                onClick={back}
                style={{ fontSize: 13, color: '#64748b', padding: '6px 10px' }}
              >
                Back
              </button>
            )}
            {!isLast && (
              <button
                type="button"
                onClick={finish}
                style={{ fontSize: 12, color: '#94a3b8', padding: '6px 8px' }}
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={next}
              style={{
                background: ACCENT,
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 6,
                padding: '8px 16px',
              }}
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function clampTop(t: number, vh: number) {
  return Math.max(12, Math.min(t, vh - 200))
}
