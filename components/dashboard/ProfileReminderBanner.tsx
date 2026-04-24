import { AlertCircle, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProfileReminderBannerProps {
  onDismiss: () => void
}

export function ProfileReminderBanner({ onDismiss }: ProfileReminderBannerProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-amber-800">Complete your profile</h3>
          <p className="text-xs text-amber-700 mt-1">
            Add your name, phone number, and agency to get your custom landing page URL and start capturing leads.
          </p>
          <div className="mt-3">
            <Button size="sm" className="h-8 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium" onClick={() => window.location.href = '/dashboard/settings'}>
              Complete Profile
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          </div>
        </div>
        <button onClick={onDismiss} className="text-amber-500 hover:text-amber-700 transition-colors shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
