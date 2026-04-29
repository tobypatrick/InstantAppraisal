'use client'

import { Palette } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { LightCard, LightCardHeader } from '@/components/dashboard/LightCard'
import { ColorPicker } from './ColorPicker'

interface BrandingFormData {
  header_bg_color: string
  page_bg_color: string
  accent_color: string
  agency_logo_url: string
  agency_name: string
}

type ColorField = 'header_bg_color' | 'page_bg_color' | 'accent_color'

interface BrandingSectionProps {
  formData: BrandingFormData
  onChange: (field: ColorField, value: string) => void
}

export function BrandingSection({ formData, onChange }: BrandingSectionProps) {
  return (
    <LightCard>
      <LightCardHeader
        icon={<Palette className="h-4 w-4" strokeWidth={1.25} />}
        title="Branding"
        description="Customise your landing page colours."
      />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ColorPicker label="Header Colour" value={formData.header_bg_color} onChange={(c) => onChange('header_bg_color', c)} />
          <ColorPicker label="Page Background" value={formData.page_bg_color} onChange={(c) => onChange('page_bg_color', c)} />
          <ColorPicker
            label="Accent Colour"
            value={formData.accent_color}
            onChange={(c) => onChange('accent_color', c)}
          />
          <p className="text-xs text-slate-500 -mt-2">
            Used for the call-to-action button, icons, and highlight elements throughout your landing page.
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block text-slate-600">Live Preview</Label>
          <div className="rounded-lg overflow-hidden border border-slate-200" style={{ backgroundColor: formData.page_bg_color }}>
            <div className="h-12 flex items-center px-4 gap-3" style={{ backgroundColor: formData.header_bg_color }}>
              {formData.agency_logo_url ? (
                <img src={formData.agency_logo_url} alt="Logo" className="h-6 max-w-[120px] object-contain brightness-0 invert" />
              ) : (
                <span className="text-white text-sm font-semibold truncate">{formData.agency_name || 'Agency Name'}</span>
              )}
            </div>
            <div className="p-4 space-y-2">
              <div className="h-3 bg-white/30 rounded w-3/4" />
              <div className="h-3 bg-white/20 rounded w-1/2" />
              <div
                className="h-8 rounded mt-4 w-full"
                style={{ backgroundColor: formData.accent_color }}
              />
            </div>
          </div>
        </div>
      </div>
    </LightCard>
  )
}
