import { Suspense } from 'react'
import { LeadFeed } from '@/components/dashboard/LeadFeed'
import { Skeleton } from '@/components/ui/skeleton'

export default function LeadsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1 tracking-tight text-slate-900">Leads</h1>
        <p className="text-sm text-slate-500">View and manage all your captured leads.</p>
      </div>
      <Suspense fallback={<div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[72px] w-full rounded" />)}</div>}>
        <LeadFeed />
      </Suspense>
    </div>
  )
}
