import { AnalyticsView } from '@/components/dashboard/AnalyticsView'

export default function AnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1 tracking-tight text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500">Understand where your leads come from.</p>
      </div>
      <AnalyticsView />
    </div>
  )
}
