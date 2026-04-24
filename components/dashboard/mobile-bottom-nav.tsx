'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, QrCode, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Home', url: '/dashboard/overview', icon: LayoutDashboard },
  { title: 'Leads', url: '/dashboard/leads', icon: Users },
  { title: 'Marketing', url: '/dashboard/marketing', icon: QrCode },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.url
          return (
            <Link key={item.title} href={item.url} className={cn('flex flex-col items-center justify-center gap-1 flex-1 h-full', isActive ? 'text-sidebar-foreground' : 'text-sidebar-foreground/50')}>
              <div className={cn('p-2 rounded-lg transition-colors', isActive && 'bg-sidebar-accent')}>
                <item.icon className="h-5 w-5" strokeWidth={1.25} />
              </div>
              <span className="text-[10px] font-medium tracking-wide">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
