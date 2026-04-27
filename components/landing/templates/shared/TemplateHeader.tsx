'use client'

import { useState } from 'react'
import { getContrastTextColor } from '@/lib/color-utils'
import { LeadAgentLogo } from '@/components/ui/LeadAgentLogo'

interface TemplateHeaderProps {
  agencyLogoUrl?: string | null
  agencyName?: string | null
  headerBgColor: string
}

export function TemplateHeader({ agencyLogoUrl, agencyName, headerBgColor }: TemplateHeaderProps) {
  const textColorClass = getContrastTextColor(headerBgColor)
  const isDarkBg = textColorClass.includes('white')
  const [logoFailed, setLogoFailed] = useState(false)

  const showLogo = agencyLogoUrl && !logoFailed
  const nameLabel = agencyName || 'InstantAppraisal'

  return (
    <header
      className="landing-fade-in-down fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{ backgroundColor: headerBgColor }}
    >
      <div className="container mx-auto px-4 h-14 flex items-center justify-center">
        <div className="flex items-center gap-3">
          {showLogo ? (
            <img
              src={agencyLogoUrl}
              alt={nameLabel}
              className="h-8 max-w-[160px] object-contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <LeadAgentLogo height={28} dark={isDarkBg} />
          )}
        </div>
      </div>
    </header>
  )
}
