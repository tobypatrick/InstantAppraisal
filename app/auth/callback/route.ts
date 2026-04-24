import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getDashboardUrl } from '@/lib/subdomain'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session && next === 'checkout') {
      // New signup — create Stripe Checkout session via Supabase function
      try {
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
          body: { tier: 'pro', interval: 'month' },
        })
        if (!checkoutError && checkoutData?.url) {
          return NextResponse.redirect(checkoutData.url)
        }
      } catch {
        // fall through to dashboard
      }
    }

    if (!error) {
      return NextResponse.redirect(new URL(getDashboardUrl()))
    }
  }

  // Something went wrong — send to login with error
  return NextResponse.redirect(new URL('/auth/login?error=callback_failed', request.url))
}
