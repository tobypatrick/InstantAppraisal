import { createBrowserClient } from '@supabase/ssr'

function getCookieDomain() {
  if (typeof window === 'undefined') return undefined
  return window.location.hostname === 'localhost' ? undefined : '.instantappraisal.co'
}

export function createClient() {
  const domain = getCookieDomain()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // No document during SSR — a browser client has no cookies to read on
          // the server (server components use the server client). Guarding here
          // prevents "ReferenceError: document is not defined" when Supabase auth
          // initialises during a server render.
          if (typeof document === 'undefined') return []
          return document.cookie
            .split('; ')
            .filter(Boolean)
            .map((c) => {
              const [name, ...rest] = c.split('=')
              return { name, value: rest.join('=') }
            })
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          cookiesToSet.forEach(({ name, value, options }) => {
            const parts = [`${name}=${value}`, 'path=/']
            if (domain) parts.push(`domain=${domain}`)
            if (options?.maxAge) parts.push(`max-age=${options.maxAge}`)
            if (options?.sameSite) parts.push(`samesite=${options.sameSite}`)
            if (options?.secure !== false && window.location.protocol === 'https:') parts.push('secure')
            document.cookie = parts.join('; ')
          })
        },
      },
    }
  )
}
