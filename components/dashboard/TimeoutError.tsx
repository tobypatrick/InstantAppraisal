import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LightCard } from './LightCard'

interface TimeoutErrorProps {
  title?: string
  message?: string
  onRetry: () => void
  isRetrying?: boolean
}

export function TimeoutError({
  title = 'Connection Timeout',
  message = 'Unable to load data. This might be due to a slow connection or server issues.',
  onRetry,
  isRetrying = false,
}: TimeoutErrorProps) {
  return (
    <LightCard className="max-w-md mx-auto">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-md">{message}</p>
        <Button onClick={onRetry} disabled={isRetrying}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </Button>
      </div>
    </LightCard>
  )
}
