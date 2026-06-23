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

  // Simulate the dashboard/agent subdomains via a ?domain=dashboard|agent query
  // param — on local dev AND preview deploys — so a single preview URL can
  // exercise all three sites (dashboard/agent otherwise need their own
  // subdomains). NEVER honour it on production, where the real hostname is the
  // only source of truth (otherwise anyone could force dashboard/agent routing
  // on the public marketing site via a query param).
  const devDomain = process.env.VERCEL_ENV !== 'production'
    ? url.searchParams.get('domain')
    : null

  const isDashboard =
    hostname.startsWith('dashboard.') ||
    hostname.startsWith('staging-dashboard.') ||
    devDomain === 'dashboard'
  const isAgent =
    hostname.startsWith('my.') ||
    hostname.startsWith('staging-my.') ||
    devDomain === 'agent'
  const isAdmin =
    hostname.startsWith('admin.') ||
    hostname.startsWith('staging-admin.') ||
    devDomain === 'admin'

  // Per-host robots.txt. Dashboard/admin are auth-gated and blocked entirely.
  // The agent host ALLOWS crawling on purpose — its pages carry an
  // X-Robots-Tag: noindex header (set below) so Google crawls them, sees the
  // noindex, and keeps them out of search (a plain disallow can leave bare URLs
  // listed). The marketing host falls through to app/robots.ts.
  if (url.pathname === '/robots.txt') {
    if (isDashboard || isAdmin) {
      return new NextResponse('User-agent: *\nDisallow: /\n', { headers: { 'content-type': 'text/plain' } })
    }
    if (isAgent) {
      return new NextResponse('User-agent: *\nAllow: /\n', { headers: { 'content-type': 'text/plain' } })
    }
  }

  if (isDashboard) {
    // API routes manage their own auth (Authorization header / RLS) and must
    // never be redirected to the login page — the redirect returns HTML, which
    // breaks the client's `await res.json()` with an "Unexpected token '<'" error.
    if (url.pathname.startsWith('/api/')) {
      return supabaseResponse
    }

    // Redirect /dashboard/* → /* for clean URLs (e.g. /dashboard/settings → /settings)
    if (url.pathname.startsWith('/dashboard/') || url.pathname === '/dashboard') {
      const cleanPath = url.pathname.replace(/^\/dashboard/, '') || '/'
      const redirectUrl = url.clone()
      redirectUrl.pathname = cleanPath
      return NextResponse.redirect(redirectUrl)
    }

    // Protect all dashboard page routes — auth lives on the marketing domain
    if (!user && url.pathname !== '/subscription-expired') {
      // Build the login URL using env vars so staging redirects to the right place
      const marketingBase = process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://instantappraisal.co'
      const dashboardBase = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'https://dashboard.instantappraisal.co'
      const loginUrl = devDomain
        ? new URL(`/auth/login?redirect=${encodeURIComponent(url.pathname)}`, url.origin)
        : new URL(`${marketingBase}/auth/login?redirect=${encodeURIComponent(dashboardBase + url.pathname)}`)
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
    // Keep agent landing pages out of search engines.
    supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow')
  } else if (isAdmin) {
    // API routes manage their own auth — never redirect them to the login page.
    if (url.pathname.startsWith('/api/')) {
      return supabaseResponse
    }

    // Clean URLs: /admin/* → /* (e.g. /admin/overview → /overview)
    if (url.pathname.startsWith('/admin/') || url.pathname === '/admin') {
      const cleanPath = url.pathname.replace(/^\/admin/, '') || '/'
      const redirectUrl = url.clone()
      redirectUrl.pathname = cleanPath
      return NextResponse.redirect(redirectUrl)
    }

    // The login page is the only public admin route — everything else needs a
    // session. The admin role itself is enforced in the protected layout.
    const isLoginPage = url.pathname === '/login'
    if (!user && !isLoginPage) {
      const loginUrl = url.clone()
      loginUrl.pathname = '/login'
      loginUrl.search = devDomain ? '?domain=admin' : ''
      return NextResponse.redirect(loginUrl)
    }

    // Rewrite clean path → internal /admin/* route
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = url.pathname === '/' ? '/admin/overview' : `/admin${url.pathname}`
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
