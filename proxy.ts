import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip auth if Supabase credentials aren't configured (e.g. local preview without .env)
  let user = null
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          const domain = process.env.NODE_ENV === 'production' ? '.instantappraisal.co' : undefined
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options, domain })
          )
        },
      },
    })
    // Refresh session — must not add any logic between createServerClient and getUser
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  const hostname = request.headers.get('host') ?? ''
  const url = request.nextUrl.clone()

  // Supabase email confirmation links land at "/" with a ?code=… query param
  // (because the Supabase project's Site URL is the marketing root). Forward
  // them to /auth/callback so the code → session exchange happens correctly.
  if (url.pathname === '/' && url.searchParams.has('code')) {
    const callbackUrl = url.clone()
    callbackUrl.pathname = '/auth/callback'
    if (!callbackUrl.searchParams.has('next')) {
      callbackUrl.searchParams.set('next', 'checkout')
    }
    return NextResponse.redirect(callbackUrl)
  }

  // Local dev: use ?domain=dashboard|agent query param to simulate subdomains
  const devDomain = url.searchParams.get('domain')

  const isDashboard =
    hostname.startsWith('dashboard.') || devDomain === 'dashboard'
  const isAgent =
    hostname.startsWith('my.') || devDomain === 'agent'

  if (isDashboard) {
    // Redirect /dashboard/* → /* for clean URLs (e.g. /dashboard/settings → /settings)
    if (url.pathname.startsWith('/dashboard/') || url.pathname === '/dashboard') {
      const cleanPath = url.pathname.replace(/^\/dashboard/, '') || '/'
      const redirectUrl = url.clone()
      redirectUrl.pathname = cleanPath
      return NextResponse.redirect(redirectUrl)
    }

    // Protect all dashboard routes — auth lives on the marketing domain
    if (!user && url.pathname !== '/subscription-expired') {
      const loginUrl = devDomain
        ? new URL(`/auth/login?redirect=${encodeURIComponent(url.pathname)}`, url.origin)
        : new URL(`https://instantappraisal.co/auth/login?redirect=${encodeURIComponent('https://dashboard.instantappraisal.co' + url.pathname)}`)
      return NextResponse.redirect(loginUrl)
    }

    // Rewrite clean path → internal /dashboard/* route
    // Don't rewrite /subscription-expired — it's served directly from app/subscription-expired/page.tsx
    if (!url.pathname.startsWith('/dashboard') && url.pathname !== '/subscription-expired') {
      url.pathname = url.pathname === '/'
        ? '/dashboard/overview'
        : `/dashboard${url.pathname}`
      supabaseResponse = NextResponse.rewrite(url)
    }
  } else if (isAgent) {
    // Public agent pages — rewrite to agent route group
    // Don't rewrite API routes or Next.js internals
    if (!url.pathname.startsWith('/agent') && !url.pathname.startsWith('/api/')) {
      url.pathname = `/agent${url.pathname}`
      supabaseResponse = NextResponse.rewrite(url)
    }
  }
  // else: marketing domain — serve as-is

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
