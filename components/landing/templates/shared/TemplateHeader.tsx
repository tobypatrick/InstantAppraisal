import { getContrastTextColor } from '@/lib/color-utils'

interface TemplateHeaderProps {
  agencyLogoUrl?: string | null
  agencyName?: string | null
  headerBgColor: string
}

export function TemplateHeader({ agencyLogoUrl, agencyName, headerBgColor }: TemplateHeaderProps) {
  const textColorClass = getContrastTextColor(headerBgColor)
  const isDarkBg = textColorClass.includes('white')

  return (
    <header
      className="landing-fade-in-down fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{ backgroundColor: headerBgColor }}
    >
      <div className="container mx-auto px-4 h-14 flex items-center justify-center">
        <div className="flex items-center gap-3">
          {agencyLogoUrl ? (
            <img
              src={agencyLogoUrl}
              alt={agencyName || 'Agency'}
              className="h-8 max-w-[160px] object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <span className={`text-sm font-semibold tracking-wide ${isDarkBg ? 'text-white' : 'text-slate-900'}`}>
              {agencyName || 'InstantAppraisal'}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
