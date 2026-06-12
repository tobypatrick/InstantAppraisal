'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  currentUrl: string | null
  onUpload: (url: string) => void
  folder: string
  label: string
  aspectRatio?: 'square' | 'wide'
}

export function ImageUpload({ currentUrl, onUpload, folder, label, aspectRatio = 'square' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [storagePath, setStoragePath] = useState<string | null>(currentUrl)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setStoragePath(currentUrl) }, [currentUrl])

  useEffect(() => {
    if (!storagePath) { setSignedUrl(null); return }
    const supabase = createClient()
    supabase.storage.from('agent-assets').createSignedUrl(storagePath, 3600).then(({ data }) => {
      if (data?.signedUrl) setSignedUrl(data.signedUrl)
    })
  }, [storagePath])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file (JPG, PNG, etc.)'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Please upload an image smaller than 5MB.'); return }

    setUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('agent-assets').upload(fileName, file, { upsert: false })
      if (uploadError) throw uploadError

      setStoragePath(fileName)
      onUpload(fileName)
      toast.success(`Your ${label.toLowerCase()} has been updated.`)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setStoragePath(null)
    setSignedUrl(null)
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const hasImage = !!storagePath

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-900">{label}</label>
      <div className={`relative border-2 border-dashed border-slate-200 rounded-lg overflow-hidden transition-colors hover:border-slate-300 ${aspectRatio === 'wide' ? 'w-48 aspect-[3/1]' : 'w-32 aspect-square'} ${aspectRatio === 'wide' ? 'bg-slate-50' : ''}`}>
        {signedUrl && (
          <>
            <img src={signedUrl} alt={label} className={`w-full h-full ${aspectRatio === 'wide' ? 'object-contain p-2' : 'object-cover'}`} onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>Change</Button>
              <Button type="button" variant="destructive" size="sm" onClick={handleRemove} disabled={uploading}><X className="h-4 w-4" /></Button>
            </div>
          </>
        )}
        {!hasImage && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
            {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <><ImageIcon className="h-8 w-8" /><span className="text-xs">Click to upload</span></>}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      <p className="text-xs text-slate-400">JPG, PNG up to 5MB</p>
    </div>
  )
}
