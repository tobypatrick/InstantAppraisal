'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, Link as LinkIcon, Copy, Check, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getAgentPageUrl } from '@/lib/subdomain'
import { getQrColor } from '@/lib/color-utils'

interface MarketingKitProps {
  agentSlug: string
  accentColor?: string
}

interface Campaign {
  name: string
  source: string
  medium: string
  url: string
}

const SOURCE_OPTIONS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google', label: 'Google' },
  { value: 'letterbox', label: 'Letterbox Drop' },
  { value: 'email', label: 'Email' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'other', label: 'Other' },
]

const MEDIUM_OPTIONS = [
  { value: 'social', label: 'Social Media' },
  { value: 'cpc', label: 'Paid Ads (CPC)' },
  { value: 'email', label: 'Email' },
  { value: 'print', label: 'Print' },
  { value: 'qr', label: 'QR Code' },
  { value: 'referral', label: 'Referral' },
]

export function MarketingKit({ agentSlug, accentColor = '#10b981' }: MarketingKitProps) {
  const [campaignName, setCampaignName] = useState('')
  const [source, setSource] = useState('facebook')
  const [medium, setMedium] = useState('social')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const baseUrl = getAgentPageUrl(agentSlug)
  const storageKey = `marketing-campaigns-${agentSlug}`
  const qrColor = getQrColor(accentColor)

  // Persist campaigns per-agent in localStorage so they survive refresh/navigation.
  // Load once on mount; only start saving after load so the initial empty state
  // doesn't overwrite what's stored.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setCampaigns(JSON.parse(raw))
    } catch {
      // ignore malformed/unavailable storage
    }
    setLoaded(true)
  }, [storageKey])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(campaigns))
    } catch {
      // ignore quota/unavailable storage
    }
  }, [campaigns, loaded, storageKey])

  const generateUtmUrl = (name: string, src: string, med: string) => {
    const params = new URLSearchParams({
      utm_source: src,
      utm_medium: med,
      utm_campaign: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    })
    return `${baseUrl}?${params.toString()}`
  }

  const handleCreateCampaign = () => {
    if (!campaignName.trim()) {
      toast.error('Please enter a name for your campaign.')
      return
    }
    const url = generateUtmUrl(campaignName, source, medium)
    setCampaigns([{ name: campaignName, source, medium, url }, ...campaigns])
    setCampaignName('')
    toast.success('Campaign created — your UTM-tagged link is ready.')
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast.success('URL copied to clipboard.')
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const downloadQR = (url: string, name: string) => {
    const svg = document.querySelector(`[data-qr="${CSS.escape(url)}"]`) as SVGElement
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = 512
      canvas.height = 512
      ctx?.drawImage(img, 0, 0, 512, 512)
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `qr-${name.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = pngUrl
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div className="space-y-6">
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <QrCode className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            Your Landing Page QR Code
          </CardTitle>
          <CardDescription className="text-xs">Print this QR code on flyers, business cards, or signs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-white p-4 rounded-lg border">
              <QRCodeSVG value={baseUrl} size={140} level="H" data-qr={baseUrl} fgColor={qrColor} />
            </div>
            <div className="flex-1 space-y-3">
              <div className="bg-slate-50 rounded px-3 py-2 font-mono text-xs break-all text-slate-700">{baseUrl}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(baseUrl)} className="text-xs">
                  {copiedUrl === baseUrl ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadQR(baseUrl, 'landing-page')} className="text-xs">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download QR
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <LinkIcon className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            Campaign Link Builder
          </CardTitle>
          <CardDescription className="text-xs">Create trackable links for different marketing campaigns.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Campaign Name</Label>
              <Input placeholder="e.g., Spring Mailer 2024" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Source</Label>
              <Select value={source} onValueChange={(v) => v && setSource(v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Medium</Label>
              <Select value={medium} onValueChange={(v) => v && setMedium(v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEDIUM_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleCreateCampaign} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Campaign Link
          </Button>
        </CardContent>
      </Card>

      {campaigns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Your Campaigns</h3>
          {campaigns.map((campaign) => (
            <Card key={campaign.url} className="border">
              <CardContent className="py-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  <div className="bg-white p-2 rounded border shrink-0">
                    <QRCodeSVG value={campaign.url} size={80} level="H" data-qr={campaign.url} fgColor={qrColor} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{campaign.name}</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wide text-slate-500">{campaign.source}</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wide text-slate-500">{campaign.medium}</span>
                    </div>
                    <div className="bg-slate-50 rounded px-3 py-2 font-mono text-xs break-all text-slate-700">{campaign.url}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(campaign.url)} className="text-xs">
                      {copiedUrl === campaign.url ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadQR(campaign.url, campaign.name)} className="text-xs">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
