import { cn } from '@/lib/utils'

interface LeadAgentLogoProps {
  height?: number
  dark?: boolean
  className?: string
}

export function LeadAgentLogo({ height = 28, dark = false, className }: LeadAgentLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dark ? '/logo-white.svg' : '/logo-black.svg'}
      alt="InstantAppraisal"
      height={height}
      style={{ height, width: 'auto', display: 'block' }}
      className={cn(className)}
    />
  )
}
