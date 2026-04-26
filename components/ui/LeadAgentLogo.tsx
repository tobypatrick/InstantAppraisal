import { cn } from '@/lib/utils'

interface LeadAgentLogoProps {
  height?: number
  dark?: boolean
  className?: string
}

export function LeadAgentLogo({ height = 28, dark = false, className }: LeadAgentLogoProps) {
  const aspectRatio = 375 / 194.88
  const width = Math.round(height * aspectRatio)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dark ? '/logo-white.svg' : '/logo-black.svg'}
      alt="InstantAppraisal"
      width={width}
      height={height}
      className={cn('object-contain', className)}
      style={{ width, height }}
    />
  )
}
