import { TrendingUp, Home, Clock, BarChart3, DollarSign, LayoutGrid, Users, GraduationCap } from 'lucide-react'
import { hexToRgba } from '@/lib/color-utils'
import { variantCopy, type LandingVariant, type ReportCardIcon } from '@/lib/landing-variants'

const ICONS: Record<ReportCardIcon, typeof TrendingUp> = {
  trending: TrendingUp,
  home: Home,
  clock: Clock,
  chart: BarChart3,
  dollar: DollarSign,
  grid: LayoutGrid,
  users: Users,
  school: GraduationCap,
}

interface Props {
  textColorClass: string
  mutedTextClass: string
  accentColor?: string
  variant?: LandingVariant
}

export function ReportPreview({ textColorClass, mutedTextClass, accentColor = '#10b981', variant = 'sales' }: Props) {
  const copy = variantCopy(variant)

  return (
    <div
      className="mt-16 w-full max-w-3xl landing-fade-in-down"
      style={{ animationDelay: '0.2s' }}
    >
      {/* Divider line */}
      <div
        className="w-12 h-px mx-auto mb-8"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
      />

      <div className="text-center mb-8">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-2"
          style={{ color: accentColor }}
        >
          {copy.reportEyebrow}
        </p>
        <p className={`text-sm ${mutedTextClass}`}>
          Powered by PropTrack — Australia's leading property data provider
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {copy.reportCards.map(({ icon, label, desc }) => {
          const Icon = ICONS[icon]
          return (
            <div
              key={label}
              className="rounded-xl p-4 border transition-colors hover:bg-white/[0.06]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{
                  backgroundColor: hexToRgba(accentColor, 0.1),
                  border: `1px solid ${hexToRgba(accentColor, 0.18)}`,
                }}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} style={{ color: accentColor }} />
              </div>
              <p className={`text-[13px] font-semibold ${textColorClass} mb-1 leading-tight`}>{label}</p>
              <p className={`text-[11px] leading-snug ${mutedTextClass}`}>{desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
