import { cn } from '@/lib/utils'

interface LogoProps {
  height?: number
  className?: string
}

export function InstantAppraisalLogo({ height = 28, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} style={{ height }}>
      <div
        className="rounded-md bg-accent flex items-center justify-center text-accent-foreground font-bold"
        style={{ width: height, height, fontSize: height * 0.55 }}
      >
        IA
      </div>
      <span className="font-semibold text-foreground" style={{ fontSize: height * 0.6 }}>
        InstantAppraisal
      </span>
    </div>
  )
}
