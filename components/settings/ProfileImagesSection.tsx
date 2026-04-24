'use client'

import { User } from 'lucide-react'
import { LightCard, LightCardHeader } from '@/components/dashboard/LightCard'
import { ImageUpload } from './ImageUpload'

interface ProfileImagesFormData {
  profile_picture_url: string
  agency_logo_url: string
}

interface ProfileImagesSectionProps {
  formData: ProfileImagesFormData
  onChange: (field: keyof ProfileImagesFormData, value: string) => void
}

export function ProfileImagesSection({ formData, onChange }: ProfileImagesSectionProps) {
  return (
    <LightCard>
      <LightCardHeader icon={<User className="h-4 w-4" strokeWidth={1.25} />} title="Profile Images" description="Upload your photo and agency logo." />
      <div className="flex flex-wrap gap-6">
        <ImageUpload
          currentUrl={formData.profile_picture_url}
          onUpload={(url) => onChange('profile_picture_url', url)}
          folder="profile"
          label="Profile Photo"
          aspectRatio="square"
        />
        <ImageUpload
          currentUrl={formData.agency_logo_url}
          onUpload={(url) => onChange('agency_logo_url', url)}
          folder="logo"
          label="Agency Logo"
          aspectRatio="wide"
        />
      </div>
    </LightCard>
  )
}
