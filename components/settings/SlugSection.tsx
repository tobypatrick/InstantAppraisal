'use client'

import { Link as LinkIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { LightCard, LightCardHeader } from '@/components/dashboard/LightCard'
import { getAgentPageUrl, getAgentSubdomainUrl } from '@/lib/subdomain'

interface SlugSectionProps {
  formData: { slug: string }
  slugError: string
  onChange: (value: string) => void
}

export function SlugSection({ formData, slugError, onChange }: SlugSectionProps) {
  const handleSlugChange = (value: string) => {
    const formatted = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    onChange(formatted)
  }

  return (
    <LightCard>
      <LightCardHeader icon={<LinkIcon className="h-4 w-4" strokeWidth={1.25} />} title="Your Landing Page URL" description="This is the link you'll share with potential clients." />
      <div className="space-y-2">
        <Label htmlFor="slug" className="text-sm text-slate-600">Custom URL</Label>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 px-3 py-2.5 rounded text-xs font-mono text-slate-500 shrink-0 border border-slate-200">
            {getAgentSubdomainUrl()}/
          </div>
          <Input id="slug" value={formData.slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="john-smith" className="font-mono text-sm h-10" />
        </div>
        {slugError && <p className="text-xs text-destructive">{slugError}</p>}
        <p className="text-xs text-slate-400">Only lowercase letters, numbers, and hyphens.</p>
      </div>
      {formData.slug && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded">
          <p className="text-xs text-slate-400 mb-1">Your landing page:</p>
          <p className="font-mono text-sm text-emerald-700 font-medium">{getAgentPageUrl(formData.slug)}</p>
        </div>
      )}
    </LightCard>
  )
}
