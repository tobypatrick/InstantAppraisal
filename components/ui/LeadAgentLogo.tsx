import { cn } from '@/lib/utils'

interface LeadAgentLogoProps {
  height?: number
  dark?: boolean
  className?: string
}

export function LeadAgentLogo({ height = 28, dark = false, className }: LeadAgentLogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} style={{ height }}>
      <div
        className={cn(
          'rounded-md flex items-center justify-center font-bold',
          dark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
        )}
        style={{ width: height, height, fontSize: height * 0.55 }}
      >
        IA
      </div>
      <span
        className={cn('font-semibold', dark ? 'text-white' : 'text-slate-900')}
        style={{ fontSize: height * 0.6 }}
      >
        InstantAppraisal
      </span>
    </div>
  )
}
