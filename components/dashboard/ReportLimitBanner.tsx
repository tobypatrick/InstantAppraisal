'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'

// Shown across the dashboard when the agent is running low on (or out of)
// monthly reports, so they can upgrade before homeowners stop getting reports.
export function ReportLimitBanner() {
  const { subscribed, reportLimit, reportsUsed, isLoading } = useSubscription()

  if (isLoading || !subscribed || reportLimit <= 0) return null

  const remaining = Math.max(0, reportLimit - reportsUsed)
  if (remaining > 5) return null

  const maxedOut = remaining <= 0
  const styles = maxedOut
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-amber-50 border-amber-200 text-amber-800'

  return (
    <div className={`mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg border px-4 py-3 text-sm ${styles}`}>
      <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2} />
      <span className="flex-1">
        {maxedOut ? (
          <>
            You&apos;ve used all {reportLimit} reports this month. New leads are still captured,
            but homeowners won&apos;t receive their report until you upgrade or your limit resets next month.
          </>
        ) : (
          <>
            You have <span className="font-semibold">{remaining} report{remaining === 1 ? '' : 's'}</span> left this month.
          </>
        )}
      </span>
      <Link
        href="/billing"
        className={`shrink-0 self-start sm:self-auto rounded-md px-3 py-1.5 text-xs font-medium text-white ${maxedOut ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
      >
        Upgrade
      </Link>
    </div>
  )
}
