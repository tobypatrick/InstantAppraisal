import { cn } from '@/lib/utils'

interface LogoProps {
  height?: number
  dark?: boolean
  className?: string
}

export function InstantAppraisalLogo({ height = 28, dark = false, className }: LogoProps) {
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
