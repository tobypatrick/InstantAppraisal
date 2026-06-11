'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { ReportLimitBanner } from '@/components/dashboard/ReportLimitBanner'
import { createClient } from '@/lib/supabase/client'
import { getMarketingUrl } from '@/lib/subdomain'

interface Profile {
  id: string
  full_name: string | null
  agency_name: string | null
  slug: string | null
  header_bg_color: string | null
  agency_logo_url: string | null
}

interface DashboardShellProps {
  profile: Profile | null
  isAdmin: boolean
  children: React.ReactNode
}

export function DashboardShell({ profile, isAdmin, children }: DashboardShellProps) {
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = getMarketingUrl()
  }

  return (
    <SidebarProvider>
      <div className="h-dvh flex flex-col w-full bg-background overflow-hidden">
        <DashboardHeader profile={profile} onSignOut={handleSignOut} />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar profile={profile} onSignOut={handleSignOut} isAdmin={isAdmin} />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <ReportLimitBanner />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
