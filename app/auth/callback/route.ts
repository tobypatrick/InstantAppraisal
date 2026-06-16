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

    if (!error && data.session) {
      // Send brand-new users straight into checkout to start their trial. The
      // explicit ?next=checkout flag is the happy path, but Supabase can strip
      // that query param when it re-validates the email redirect — so also detect
      // new users by billing state. NOTE: the handle_new_user trigger creates a
      // billing row for EVERY signup, so "no billing row" can't tell new from
      // returning. Instead, a user who has never subscribed has no
      // stripe_customer_id — route those to checkout. Returning/lapsed users
      // (who DO have a stripe_customer_id) fall through to the dashboard, where
      // the gate shows the "resubscribe" page if their plan is inactive.
      let goToCheckout = next === 'checkout'
      if (!goToCheckout) {
        const { data: billing } = await supabase
          .from('billing')
          .select('stripe_customer_id')
          .eq('user_id', data.session.user.id)
          .maybeSingle()
        goToCheckout = !billing?.stripe_customer_id
      }

      if (goToCheckout) {
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

      return NextResponse.redirect(new URL(getDashboardUrl()))
    }
  }

  // Something went wrong — send to login with error
  return NextResponse.redirect(new URL('/auth/login?error=callback_failed', request.url))
}
