import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'complete' | 'partial' | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isComplete = status === 'complete'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium',
        isComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', isComplete ? 'bg-emerald-500' : 'bg-amber-500')} />
      {isComplete ? 'Complete' : 'Partial'}
    </span>
  )
}
