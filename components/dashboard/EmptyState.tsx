import { Rocket } from 'lucide-react'
import React from 'react'

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
}

export function EmptyState({
  title = 'Ready for Launch',
  message = 'Share your landing page to start capturing leads.',
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
        {icon || <Rocket className="h-8 w-8 text-emerald-600" strokeWidth={1.25} />}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{message}</p>
    </div>
  )
}
