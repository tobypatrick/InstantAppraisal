'use client'

import { useState, useMemo } from 'react'
import { Video, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface VSLInputProps {
  value: string
  onChange: (url: string) => void
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function VSLInput({ value, onChange }: VSLInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const videoId = useMemo(() => extractYouTubeId(value), [value])
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null

  return (
    <div className="space-y-3">
      <Label htmlFor="vsl_url" className="text-sm">YouTube VSL Link</Label>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            id="vsl_url"
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="https://youtube.com/watch?v=..."
            className="pl-9 h-10"
          />
        </div>
        {thumbnailUrl && (
          <a href={value} target="_blank" rel="noopener noreferrer" className="relative w-24 h-10 rounded overflow-hidden border border-border hover:border-primary transition-colors group">
            <img src={thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4 text-white" strokeWidth={1.5} />
            </div>
          </a>
        )}
      </div>
      {!videoId && value && <p className="text-xs text-destructive">Please enter a valid YouTube URL</p>}
      {!value && !isFocused && <p className="text-xs text-muted-foreground">Add a video to showcase on your landing page</p>}
    </div>
  )
}
