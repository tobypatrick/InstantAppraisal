'use client'

import { useState, useEffect } from 'react'
import { Save, Layout, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_HEADER_COLOR, DEFAULT_PAGE_COLOR } from '@/lib/color-utils'
import { ProfileImagesSection } from '@/components/settings/ProfileImagesSection'
import { VSLInput } from '@/components/settings/VSLInput'
import { BrandingSection } from '@/components/settings/BrandingSection'
import { BusinessInfoSection } from '@/components/settings/BusinessInfoSection'
import { SlugSection } from '@/components/settings/SlugSection'
import { LightCard, LightCardHeader } from '@/components/dashboard/LightCard'

interface FormData {
  full_name: string
  agency_name: string
  phone_number: string
  vsl_youtube_url: string
  slug: string
  agency_logo_url: string
  profile_picture_url: string
  header_bg_color: string
  page_bg_color: string
  facebook_pixel_id: string
  leadconnector_webhook_url: string
  google_tag_manager_id: string
  notification_email: string
}

const DEFAULT_FORM: FormData = {
  full_name: '',
  agency_name: '',
  phone_number: '',
  vsl_youtube_url: '',
  slug: '',
  agency_logo_url: '',
  profile_picture_url: '',
  header_bg_color: DEFAULT_HEADER_COLOR,
  page_bg_color: DEFAULT_PAGE_COLOR,
  facebook_pixel_id: '',
  leadconnector_webhook_url: '',
  google_tag_manager_id: '',
  notification_email: '',
}

export default function SettingsPage() {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [slugError, setSlugError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setProfileId(user.id)
      supabase
        .from('profiles')
        .select('full_name, agency_name, phone_number, vsl_youtube_url, slug, agency_logo_url, profile_picture_url, header_bg_color, page_bg_color, facebook_pixel_id, leadconnector_webhook_url, google_tag_manager_id, notification_email')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setFormData({
              full_name: data.full_name || '',
              agency_name: data.agency_name || '',
              phone_number: data.phone_number || '',
              vsl_youtube_url: data.vsl_youtube_url || '',
              slug: data.slug || '',
              agency_logo_url: data.agency_logo_url || '',
              profile_picture_url: data.profile_picture_url || '',
              header_bg_color: data.header_bg_color || DEFAULT_HEADER_COLOR,
              page_bg_color: data.page_bg_color || DEFAULT_PAGE_COLOR,
              facebook_pixel_id: data.facebook_pixel_id || '',
              leadconnector_webhook_url: data.leadconnector_webhook_url || '',
              google_tag_manager_id: data.google_tag_manager_id || '',
              notification_email: (data as any).notification_email || '',
            })
          }
        })
    })
  }, [])

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'slug') setSlugError('')
  }

  const validateSlug = (slug: string) => {
    if (slug.length < 3) return false
    return /^[a-z0-9-]+$/.test(slug) && !slug.startsWith('-') && !slug.endsWith('-')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileId) return

    if (formData.slug && !validateSlug(formData.slug)) {
      setSlugError('URL must be at least 3 characters and can only contain lowercase letters, numbers, and hyphens')
      return
    }

    if (formData.slug) {
      const supabase = createClient()
      const { data } = await supabase.from('profiles').select('id').eq('slug', formData.slug).neq('id', profileId).maybeSingle()
      if (data) { setSlugError('This URL is already taken. Please choose another.'); return }
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          agency_name: formData.agency_name || null,
          phone_number: formData.phone_number || null,
          vsl_youtube_url: formData.vsl_youtube_url || null,
          selected_template: 'data_hub',
          slug: formData.slug || null,
          agency_logo_url: formData.agency_logo_url || null,
          profile_picture_url: formData.profile_picture_url || null,
          header_bg_color: formData.header_bg_color,
          page_bg_color: formData.page_bg_color,
          facebook_pixel_id: formData.facebook_pixel_id || null,
          leadconnector_webhook_url: formData.leadconnector_webhook_url || null,
          google_tag_manager_id: formData.google_tag_manager_id || null,
          notification_email: formData.notification_email || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)

      if (error) throw error

      toast.success('Profile saved. Refresh to see updated branding.')
      window.location.reload()
    } catch (error: unknown) {
      if ((error as any)?.code === '23505' && (error as any)?.message?.includes('slug')) {
        setSlugError('This URL is already taken. Please choose another.')
      } else {
        toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleOpenPortal = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      if (error) throw error
      if (data?.url) window.open(data.url, '_blank')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Please try again.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-1 tracking-tight text-slate-900">Profile Settings</h1>
        <p className="text-sm text-slate-500">Customize your landing page and branding.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <ProfileImagesSection
          formData={{ profile_picture_url: formData.profile_picture_url, agency_logo_url: formData.agency_logo_url }}
          onChange={(field, value) => handleChange(field, value)}
        />

        <LightCard>
          <LightCardHeader icon={<Layout className="h-4 w-4" strokeWidth={1.25} />} title="Landing Page Video" description="Add a YouTube video to your landing page." />
          <VSLInput value={formData.vsl_youtube_url} onChange={(url) => handleChange('vsl_youtube_url', url)} />
        </LightCard>

        <BrandingSection
          formData={{ header_bg_color: formData.header_bg_color, page_bg_color: formData.page_bg_color, agency_logo_url: formData.agency_logo_url, agency_name: formData.agency_name }}
          onChange={(field, value) => handleChange(field, value)}
        />

        <BusinessInfoSection
          formData={{
            full_name: formData.full_name,
            agency_name: formData.agency_name,
            phone_number: formData.phone_number,
            notification_email: formData.notification_email,
            facebook_pixel_id: formData.facebook_pixel_id,
            leadconnector_webhook_url: formData.leadconnector_webhook_url,
            google_tag_manager_id: formData.google_tag_manager_id,
          }}
          onChange={(field, value) => handleChange(field, value)}
        />

        <SlugSection formData={{ slug: formData.slug }} slugError={slugError} onChange={(value) => handleChange('slug', value)} />

        <Separator className="my-6" />

        <div className="flex justify-end gap-3">
          <Button type="submit" className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" strokeWidth={1.25} />
                Save Changes
              </span>
            )}
          </Button>
        </div>
      </form>

      <Separator className="my-8" />
      <div className="pb-8">
        <h2 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h2>
        <p className="text-xs text-slate-400 mb-4">Close your account by cancelling your subscription. This will permanently delete your account and landing page.</p>
        <Button type="button" variant="outline" className="h-10 border-red-200 text-red-600 hover:bg-red-50" onClick={handleOpenPortal}>
          <AlertTriangle className="h-4 w-4 mr-2" strokeWidth={1.25} />
          Close Account
        </Button>
      </div>
    </div>
  )
}
