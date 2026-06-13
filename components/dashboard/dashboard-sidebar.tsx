'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, QrCode, Settings, HelpCircle, LogOut, Shield, CreditCard, ShieldCheck, Compass } from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarHeader,
  SidebarFooter, SidebarSeparator, useSidebar,
} from '@/components/ui/sidebar'
import { LeadAgentLogo } from '@/components/ui/LeadAgentLogo'
import { getMarketingUrl } from '@/lib/subdomain'
import { useTour } from '@/components/dashboard/tour-context'
import { toast } from 'sonner'

const SUPPORT_EMAIL = 'team@instantappraisal.co'

function handleHelp() {
  // mailto: silently does nothing when no mail client is configured, so also
  // copy the address and confirm via a toast — the button always does something.
  navigator.clipboard?.writeText(SUPPORT_EMAIL).catch(() => {})
  toast.success(`Support: ${SUPPORT_EMAIL} — copied to clipboard`)
  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Instant%20Appraisal%20Support`
}

interface Profile {
  id: string
  full_name: string | null
  agency_name: string | null
  agency_logo_url: string | null
  slug: string | null
  header_bg_color: string | null
}

interface DashboardSidebarProps {
  profile: Profile | null
  onSignOut: () => void
  isAdmin?: boolean
}

const navItems = [
  { title: 'Overview', url: '/overview', icon: LayoutDashboard },
  { title: 'Leads', url: '/leads', icon: Users },
  { title: 'Marketing', url: '/marketing', icon: QrCode },
  { title: 'Billing', url: '/billing', icon: CreditCard },
  { title: 'Settings', url: '/settings', icon: Settings },
]

export function DashboardSidebar({ profile, onSignOut, isAdmin }: DashboardSidebarProps) {
  const { state, isMobile, setOpenMobile } = useSidebar()
  const collapsed = state === 'collapsed'
  const pathname = usePathname()
  const accentColor = profile?.header_bg_color || '#10b981'
  const { startTour } = useTour()
  // On mobile the sidebar is an overlay drawer — close it after a tap so the
  // user doesn't have to dismiss it every time they switch pages.
  const closeMobile = () => { if (isMobile) setOpenMobile(false) }

  return (
    <Sidebar
      className="border-r-0"
      style={{ width: collapsed ? '56px' : '240px' }}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 pb-6">
        <a href={getMarketingUrl()} className="flex items-center gap-3">
          {collapsed ? (
            <img src="/favicon.svg" alt="IA" className="w-7 h-7 shrink-0" />
          ) : profile?.agency_logo_url ? (
            <img src={profile.agency_logo_url} alt={profile.agency_name || 'Agency'} className="h-6 max-w-[160px] object-contain brightness-0 invert" />
          ) : (
            <img src="/logo-white.svg" alt="InstantAppraisal" className="h-7 w-auto max-w-[160px] object-contain" />
          )}
        </a>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      href={item.url}
                      onClick={closeMobile}
                      data-tour={item.title === 'Settings' ? 'settings-link' : undefined}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                        isActive ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      style={isActive ? { borderLeft: `2px solid ${accentColor}`, marginLeft: '-2px', paddingLeft: 'calc(0.75rem + 2px)' } : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.25} />
                      {!collapsed && <span className="text-[13px] font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-4">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/dashboard/admin" onClick={closeMobile} className={`relative flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${pathname === '/dashboard/admin' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                    <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.25} />
                    {!collapsed && <span className="text-[13px] font-medium">Admin</span>}
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/admin/audit-log" onClick={closeMobile} className={`relative flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${pathname === '/admin/audit-log' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                    <Shield className="h-4 w-4 shrink-0" strokeWidth={1.25} />
                    {!collapsed && <span className="text-[13px] font-medium">Audit Log</span>}
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="bg-white/10 mb-3" />
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <button
              type="button"
              onClick={() => { closeMobile(); startTour() }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Compass className="h-4 w-4 shrink-0" strokeWidth={1.25} />
              {!collapsed && <span className="text-[13px] font-medium">Tour</span>}
            </button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <button
              type="button"
              onClick={handleHelp}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <HelpCircle className="h-4 w-4 shrink-0" strokeWidth={1.25} />
              {!collapsed && <span className="text-[13px] font-medium">Help</span>}
            </button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <button onClick={onSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.25} />
              {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
