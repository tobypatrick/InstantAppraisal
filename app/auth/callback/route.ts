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
          const domain = process.env.NODE_ENV === 'production' ? '.instantappraisal.co' : undefined
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, { ...options, domain }))
        },
      },
    }
  )

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session && next === 'checkout') {
      // New signup — create Stripe Checkout session via Next.js API route
      try {
        const baseUrl = request.nextUrl.origin
        const res = await fetch(`${baseUrl}/api/stripe/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: JSON.stringify({ tier: 'pro', interval: 'month' }),
        })
        const checkoutData = await res.json()
        if (res.ok && checkoutData?.url) {
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
