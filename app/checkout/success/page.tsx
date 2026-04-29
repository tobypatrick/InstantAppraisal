'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getDashboardUrl } from '@/lib/subdomain'
import { LeadAgentLogo } from '@/components/ui/LeadAgentLogo'
import { CheckCircle, Loader2 } from 'lucide-react'

const MAX_WAIT_MS = 20_000   // 20 seconds before giving up
const POLL_INTERVAL_MS = 1_500

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'polling' | 'success' | 'timeout'>('polling')
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const start = Date.now()
    const supabase = createClient()

    const poll = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Not logged in — shouldn't happen, send to login
        router.replace('/auth/login')
        return
      }

      const { data: billing } = await supabase
        .from('billing')
        .select('subscription_status')
        .eq('user_id', user.id)
        .maybeSingle()

      const isActive = ['active', 'trialing'].includes(billing?.subscription_status ?? '')

      if (isActive) {
        setStatus('success')
        setTimeout(() => {
          window.location.href = getDashboardUrl()
        }, 1000)
        return
      }

      if (Date.now() - start > MAX_WAIT_MS) {
        setStatus('timeout')
        return
      }

      setTimeout(poll, POLL_INTERVAL_MS)
    }

    poll()
  }, [router])

  // Animated dots
  useEffect(() => {
    if (status !== 'polling') return
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '.' : d + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [status])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <LeadAgentLogo height={36} dark className="mx-auto mb-10" />

        {status === 'polling' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-7 w-7 text-emerald-400 animate-spin" strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Setting up your account{dots}</h1>
            <p className="text-zinc-400 text-sm">
              Confirming your subscription with Stripe. This only takes a moment.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-7 w-7 text-emerald-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">You're all set!</h1>
            <p className="text-zinc-400 text-sm">Taking you to your dashboard now...</p>
          </>
        )}

        {status === 'timeout' && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-7 w-7 text-amber-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Still confirming...</h1>
            <p className="text-zinc-400 text-sm mb-6">
              Your payment was received. It's taking a moment longer than usual to activate your account.
            </p>
            <button
              onClick={() => { window.location.href = getDashboardUrl() }}
              className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-6 h-11 rounded text-sm transition-colors w-full"
            >
              Go to Dashboard
            </button>
            <p className="text-zinc-600 text-xs mt-4">
              If your account isn't active, email{' '}
              <a href="mailto:team@instantappraisal.co" className="text-zinc-400 hover:text-white transition-colors">
                team@instantappraisal.co
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
