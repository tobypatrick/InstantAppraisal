'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, QrCode, BarChart3, Settings, HelpCircle, LogOut, Shield, CreditCard } from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarHeader,
  SidebarFooter, SidebarSeparator, useSidebar,
} from '@/components/ui/sidebar'
import { LeadAgentLogo } from '@/components/ui/LeadAgentLogo'
import { getMarketingUrl } from '@/lib/subdomain'

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
  { title: 'Overview', url: '/dashboard/overview', icon: LayoutDashboard },
  { title: 'Leads', url: '/dashboard/leads', icon: Users },
  { title: 'Marketing', url: '/dashboard/marketing', icon: QrCode },
  { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3 },
  { title: 'Billing', url: '/dashboard/billing', icon: CreditCard },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar({ profile, onSignOut, isAdmin }: DashboardSidebarProps) {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const pathname = usePathname()
  const accentColor = profile?.header_bg_color || '#10b981'

  return (
    <Sidebar
      className="border-r-0"
      style={{ backgroundColor: '#000000', width: collapsed ? '56px' : '240px' }}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 pb-6">
        <a href={getMarketingUrl()} className="flex items-center gap-3">
          {collapsed ? (
            <svg viewBox="0 0 28 28" className="w-7 h-7 shrink-0" fill="none">
              <rect width="28" height="28" rx="4" fill="rgba(255,255,255,0.1)" />
              <text x="14" y="18.5" textAnchor="middle" fill="white" fontFamily="system-ui" fontWeight="bold" fontSize="11">IA</text>
            </svg>
          ) : (
            profile?.agency_logo_url ? (
              <img src={profile.agency_logo_url} alt={profile.agency_name || 'Agency'} className="h-6 max-w-[160px] object-contain brightness-0 invert" />
            ) : (
              <LeadAgentLogo height={18} dark />
            )
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
                  <Link href="/dashboard/admin/audit-log" className={`relative flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${pathname === '/dashboard/admin/audit-log' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
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
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-white/60 hover:text-white hover:bg-white/5 transition-colors">
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
