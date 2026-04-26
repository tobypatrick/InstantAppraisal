import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must not add any logic between createServerClient and getUser
  const { data: { user } } = await supabase.auth.getUser()

  const hostname = request.headers.get('host') ?? ''
  const url = request.nextUrl.clone()

  // Local dev: use ?domain=dashboard|agent query param to simulate subdomains
  const devDomain = url.searchParams.get('domain')

  const isDashboard =
    hostname.startsWith('dashboard.') || devDomain === 'dashboard'
  const isAgent =
    hostname.startsWith('my.') || devDomain === 'agent'

  if (isDashboard) {
    // Protect all dashboard routes
    if (!user && !url.pathname.startsWith('/auth') && url.pathname !== '/subscription-expired') {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
    // Rewrite to dashboard route group
    if (!url.pathname.startsWith('/dashboard')) {
      url.pathname = `/dashboard${url.pathname}`
      supabaseResponse = NextResponse.rewrite(url)
    }
  } else if (isAgent) {
    // Public agent pages — rewrite to agent route group
    if (!url.pathname.startsWith('/agent')) {
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
