import { cn } from '@/lib/utils'
import React from 'react'

interface LightCardProps {
  children: React.ReactNode
  className?: string
  'data-tour'?: string
}

export function LightCard({ children, className, 'data-tour': dataTour }: LightCardProps) {
  return (
    <div
      className={cn('bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow', className)}
      data-tour={dataTour}
    >
      {children}
    </div>
  )
}

interface LightCardHeaderProps {
  icon?: React.ReactNode
  title: string
  description?: string
}

export function LightCardHeader({ icon, title, description }: LightCardHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-slate-400">{icon}</span>}
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
      </div>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
  )
}
