'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'

// react-joyride touches window/document, so never render it on the server.
const GuidedTour = dynamic(
  () => import('./GuidedTour').then((m) => m.GuidedTour),
  { ssr: false }
)

interface TourContextValue {
  startTour: () => void
}

const TourContext = createContext<TourContextValue>({ startTour: () => {} })

export function useTour() {
  return useContext(TourContext)
}

interface TourProviderProps {
  firstLogin: boolean
  userId: string | null
  children: React.ReactNode
}

export function TourProvider({ firstLogin, userId, children }: TourProviderProps) {
  const [run, setRun] = useState(false)

  // Auto-start the tour once for brand-new agents.
  useEffect(() => {
    if (firstLogin) setRun(true)
  }, [firstLogin])

  const startTour = useCallback(() => setRun(true), [])

  const handleComplete = useCallback(async () => {
    setRun(false)
    // Clear the first-login flag so the tour doesn't auto-run again. Replay is
    // still available via the sidebar "Tour" button. Best-effort — a failure
    // just means they might see it again next visit.
    if (userId) {
      try {
        const supabase = createClient()
        await supabase.from('profiles').update({ first_login: false }).eq('id', userId)
      } catch {
        // ignore — non-critical
      }
    }
  }, [userId])

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
      <GuidedTour run={run} onComplete={handleComplete} />
    </TourContext.Provider>
  )
}
