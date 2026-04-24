'use client'

import { Palette } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { LightCard, LightCardHeader } from '@/components/dashboard/LightCard'
import { ColorPicker } from './ColorPicker'

interface BrandingFormData {
  header_bg_color: string
  page_bg_color: string
  agency_logo_url: string
  agency_name: string
}

interface BrandingSectionProps {
  formData: BrandingFormData
  onChange: (field: 'header_bg_color' | 'page_bg_color', value: string) => void
}

export function BrandingSection({ formData, onChange }: BrandingSectionProps) {
  return (
    <LightCard>
      <LightCardHeader icon={<Palette className="h-4 w-4" strokeWidth={1.25} />} title="Branding" description="Customise your landing page colours." />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ColorPicker label="Header Colour" value={formData.header_bg_color} onChange={(color) => onChange('header_bg_color', color)} />
          <ColorPicker label="Page Background" value={formData.page_bg_color} onChange={(color) => onChange('page_bg_color', color)} />
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
              <div className="h-8 bg-emerald-500/80 rounded mt-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    </LightCard>
  )
}
