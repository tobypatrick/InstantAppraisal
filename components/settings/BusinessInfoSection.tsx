'use client'

import { useState } from 'react'
import { User, Building2, Phone, Webhook, Code, Mail } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { LightCard, LightCardHeader } from '@/components/dashboard/LightCard'

interface BusinessInfoFormData {
  full_name: string
  agency_name: string
  phone_number: string
  notification_email: string
  facebook_pixel_id: string
  leadconnector_webhook_url: string
  google_tag_manager_id: string
}

interface BusinessInfoSectionProps {
  formData: BusinessInfoFormData
  onChange: (field: keyof BusinessInfoFormData, value: string) => void
}

export function BusinessInfoSection({ formData, onChange }: BusinessInfoSectionProps) {
  const [pixelError, setPixelError] = useState('')
  const [webhookError, setWebhookError] = useState('')
  const [gtmError, setGtmError] = useState('')
  const [emailError, setEmailError] = useState('')

  return (
    <LightCard>
      <LightCardHeader icon={<Building2 className="h-4 w-4" strokeWidth={1.25} />} title="Business Information" description="This information appears on your landing page." />
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-sm text-slate-600">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.25} />
              <Input id="full_name" value={formData.full_name} onChange={(e) => onChange('full_name', e.target.value)} placeholder="John Smith" className="pl-9 h-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="agency_name" className="text-sm text-slate-600">Agency Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.25} />
              <Input id="agency_name" value={formData.agency_name} onChange={(e) => onChange('agency_name', e.target.value)} placeholder="Smith Real Estate" className="pl-9 h-10" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone_number" className="text-sm text-slate-600">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.25} />
            <Input id="phone_number" type="tel" value={formData.phone_number} onChange={(e) => onChange('phone_number', e.target.value)} placeholder="+61 400 000 000" className="pl-9 h-10" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notification_email" className="text-sm text-slate-600">Notification Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.25} />
            <Input
              id="notification_email"
              type="email"
              value={formData.notification_email}
              onChange={(e) => {
                onChange('notification_email', e.target.value)
                setEmailError(e.target.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) ? 'Please enter a valid email address' : '')
              }}
              placeholder="notifications@example.com"
              className="pl-9 h-10"
            />
          </div>
          {emailError && <p className="text-xs text-destructive">{emailError}</p>}
          <p className="text-xs text-slate-400">Override where lead notifications are sent. Leave blank to use your login email.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="facebook_pixel_id" className="text-sm text-slate-600">Facebook Pixel ID</Label>
          <div className="relative">
            <Input
              id="facebook_pixel_id"
              value={formData.facebook_pixel_id}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '')
                onChange('facebook_pixel_id', cleaned)
                setPixelError(cleaned && !/^\d{15,16}$/.test(cleaned) ? 'Pixel ID must be a 15–16 digit number' : '')
              }}
              placeholder="123456789012345"
              maxLength={16}
              className="pl-9 h-10"
            />
          </div>
          {pixelError && <p className="text-xs text-destructive">{pixelError}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="google_tag_manager_id" className="text-sm text-slate-600">Google Tag Manager ID</Label>
          <div className="relative">
            <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.25} />
            <Input
              id="google_tag_manager_id"
              value={formData.google_tag_manager_id}
              onChange={(e) => {
                const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
                onChange('google_tag_manager_id', cleaned)
                setGtmError(cleaned && !/^GTM-[A-Z0-9]{4,12}$/i.test(cleaned) ? 'GTM ID must be in the format GTM-XXXXXXX' : '')
              }}
              placeholder="GTM-XXXXXXX"
              maxLength={16}
              className="pl-9 h-10"
            />
          </div>
          {gtmError && <p className="text-xs text-destructive">{gtmError}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="leadconnector_webhook_url" className="text-sm text-slate-600">LeadConnector Webhook URL</Label>
          <div className="relative">
            <Webhook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.25} />
            <Input
              id="leadconnector_webhook_url"
              value={formData.leadconnector_webhook_url}
              onChange={(e) => {
                onChange('leadconnector_webhook_url', e.target.value)
                try {
                  const url = new URL(e.target.value)
                  setWebhookError(e.target.value && !['http:', 'https:'].includes(url.protocol) ? 'Please enter a valid URL' : '')
                } catch {
                  setWebhookError(e.target.value ? 'Please enter a valid URL' : '')
                }
              }}
              placeholder="https://services.leadconnectorhq.com/hooks/..."
              className="pl-9 h-10"
            />
          </div>
          {webhookError && <p className="text-xs text-destructive">{webhookError}</p>}
        </div>
      </div>
    </LightCard>
  )
}
