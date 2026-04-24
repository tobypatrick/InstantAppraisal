'use client'

import { Settings, LogOut, ExternalLink, ChevronDown, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getMarketingUrl, getAgentPageUrl } from '@/lib/subdomain'

interface Profile {
  id: string
  full_name: string | null
  agency_name: string | null
  slug: string | null
}

interface DashboardHeaderProps {
  profile?: Profile | null
  onSignOut: () => void
}

export function DashboardHeader({ profile, onSignOut }: DashboardHeaderProps) {
  const agentPageUrl = profile?.slug ? getAgentPageUrl(profile.slug) : null

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        {agentPageUrl && (
          <Button variant="ghost" size="sm" className="hidden md:inline-flex h-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100" onClick={() => window.open(agentPageUrl, '_blank')}>
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.25} />
            Landing Page
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 px-2 inline-flex items-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors">
            <div className="w-6 h-6 rounded bg-slate-900 text-white text-xs font-medium flex items-center justify-center mr-2">
              {profile?.full_name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="hidden sm:inline text-xs font-medium">Account</span>
            <ChevronDown className="h-3.5 w-3.5 ml-1 text-slate-400" strokeWidth={1.25} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name || 'Agent'}</p>
              <p className="text-xs text-slate-500 truncate">{profile?.agency_name || 'No agency'}</p>
            </div>
            <DropdownMenuItem onClick={() => window.location.href = getMarketingUrl()} className="flex items-center gap-2 cursor-pointer">
              <Home className="h-4 w-4" strokeWidth={1.25} /><span>Home</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = '/dashboard/settings'} className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4" strokeWidth={1.25} /><span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="text-red-600 focus:text-red-600 cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" strokeWidth={1.25} /><span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
