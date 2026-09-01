'use client'

import { useState, useEffect } from 'react'
import { Save, Layout, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_HEADER_COLOR, DEFAULT_PAGE_COLOR, DEFAULT_ACCENT_COLOR } from '@/lib/color-utils'
import { ProfileImagesSection } from '@/components/settings/ProfileImagesSection'
import { VSLInput } from '@/components/settings/VSLInput'
import { BrandingSection } from '@/components/settings/BrandingSection'
import { BusinessInfoSection } from '@/components/settings/BusinessInfoSection'
import { SlugSection } from '@/components/settings/SlugSection'
import { LightCard, LightCardHeader } from '@/components/dashboard/LightCard'
import { LANDING_VARIANTS, variantCopy, normaliseVariant, type LandingVariant } from '@/lib/landing-variants'

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
  accent_color: string
  facebook_pixel_id: string
  leadconnector_webhook_url: string
  google_tag_manager_id: string
  notification_email: string
  send_vendor_email: boolean
  landing_variant: LandingVariant
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
  accent_color: DEFAULT_ACCENT_COLOR,
  facebook_pixel_id: '',
  leadconnector_webhook_url: '',
  google_tag_manager_id: '',
  notification_email: '',
  send_vendor_email: true,
  landing_variant: 'sales',
}

export default function SettingsPage() {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [slugError, setSlugError] = useState('')
  const [saving, setSaving] = useState(false)
  // If the profile never loaded, the form is showing empty defaults rather than
  // the user's real settings. Saving then would blank their profile, so block it.
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setProfileId(user.id)
      supabase
        .from('profiles')
        .select('full_name, agency_name, phone_number, vsl_youtube_url, slug, agency_logo_url, profile_picture_url, header_bg_color, page_bg_color, accent_color, facebook_pixel_id, leadconnector_webhook_url, google_tag_manager_id, notification_email, send_vendor_email, landing_variant')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            setLoadFailed(true)
            toast.error('Could not load your settings. Refresh before making changes.')
            return
          }
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
              accent_color: (data as any).accent_color || DEFAULT_ACCENT_COLOR,
              facebook_pixel_id: data.facebook_pixel_id || '',
              leadconnector_webhook_url: data.leadconnector_webhook_url || '',
              google_tag_manager_id: data.google_tag_manager_id || '',
              notification_email: (data as any).notification_email || '',
              send_vendor_email: (data as any).send_vendor_email ?? true,
              landing_variant: normaliseVariant((data as any).landing_variant),
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
    if (loadFailed) {
      toast.error('Your settings did not load, so saving would overwrite them. Refresh the page.')
      return
    }

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
          slug: formData.slug || null,
          agency_logo_url: formData.agency_logo_url || null,
          profile_picture_url: formData.profile_picture_url || null,
          header_bg_color: formData.header_bg_color,
          page_bg_color: formData.page_bg_color,
          accent_color: formData.accent_color,
          facebook_pixel_id: formData.facebook_pixel_id || null,
          leadconnector_webhook_url: formData.leadconnector_webhook_url || null,
          google_tag_manager_id: formData.google_tag_manager_id || null,
          notification_email: formData.notification_email || null,
          send_vendor_email: formData.send_vendor_email,
          landing_variant: formData.landing_variant,
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
      if (!session?.access_token) throw new Error('Not authenticated')
      // Use the Next.js route (same path the billing page uses), not the
      // legacy `customer-portal` Supabase edge function, which was never
      // ported to the new project.
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Failed to open billing portal')
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
        <div data-tour="profile-images">
          <ProfileImagesSection
            formData={{ profile_picture_url: formData.profile_picture_url, agency_logo_url: formData.agency_logo_url }}
            onChange={(field, value) => handleChange(field, value)}
          />
        </div>

        <LightCard>
          <LightCardHeader
            icon={<Layout className="h-4 w-4" strokeWidth={1.25} />}
            title="Landing Page Type"
            description="Choose whether your page asks about selling or renting. The PropTrack report is the same either way."
          />
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Landing page type">
            {LANDING_VARIANTS.map((v) => {
              const variant = variantCopy(v)
              const selected = formData.landing_variant === v
              return (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setFormData((prev) => ({ ...prev, landing_variant: v }))}
                  className={`text-left rounded-lg border p-4 transition-colors ${
                    selected
                      ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2 mb-1">
                    <span
                      className={`h-3.5 w-3.5 rounded-full border flex-shrink-0 ${
                        selected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                      }`}
                    />
                    <span className="text-sm font-semibold text-slate-900">{variant.settingsLabel}</span>
                  </span>
                  <span className="block text-xs leading-snug text-slate-500 pl-[1.375rem]">
                    {variant.settingsDescription}
                  </span>
                </button>
              )
            })}
          </div>
        </LightCard>

        <LightCard>
          <LightCardHeader icon={<Layout className="h-4 w-4" strokeWidth={1.25} />} title="Landing Page Video" description="Add a YouTube video to your landing page." />
          <VSLInput value={formData.vsl_youtube_url} onChange={(url) => handleChange('vsl_youtube_url', url)} />
        </LightCard>

        <div data-tour="branding-colours">
          <BrandingSection
            formData={{
              header_bg_color: formData.header_bg_color,
              page_bg_color: formData.page_bg_color,
              accent_color: formData.accent_color,
              agency_logo_url: formData.agency_logo_url,
              agency_name: formData.agency_name,
            }}
            onChange={(field, value) => handleChange(field, value)}
          />
        </div>

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

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">Homeowner Confirmation Email</h2>
          <p className="text-xs text-slate-500 mb-4">
            When a homeowner requests a report, we can send them a confirmation email on your behalf —
            from your name, with replies going to you.
          </p>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.send_vendor_email}
              onChange={(e) => setFormData((prev) => ({ ...prev, send_vendor_email: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">Send confirmation emails to homeowners</span>
          </label>
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
            <p className="font-medium text-slate-700 mb-2">What the homeowner receives</p>
            <p className="mb-2"><span className="text-slate-400">Subject:</span> Your Instant Property Appraisal — [their address]</p>
            <p className="mb-1">Hi [first name],</p>
            <p className="mb-1">Thanks for requesting a property appraisal for [address].</p>
            <p className="mb-1">{formData.full_name || '[Your name]'}{formData.agency_name ? ` from ${formData.agency_name}` : ''} will be in touch with you shortly to discuss your property&apos;s value and answer any questions you may have.</p>
            <p className="mb-1 text-slate-400">If a report was generated, a line about the PropTrack report and a &ldquo;View Your Property Report&rdquo; button are included.</p>
            <p className="mb-0">In the meantime, you can reach {formData.full_name || '[you]'} directly — phone and email.</p>
          </div>
        </div>

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
