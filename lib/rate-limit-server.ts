import type { SupabaseClient } from '@supabase/supabase-js'

// Server-side, shared-store rate limiting backed by the `rate_limits` table.
// Ported from the original create-lead edge function so the Next.js routes
// have real abuse protection (the client-side localStorage limiter is
// trivially bypassed). Keyed by (identifier, endpoint) — identifier is
// normally the caller's IP.

export function getClientIP(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf
  return 'unknown'
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  endpoint: string,
  max: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStartCutoff = now - windowMs

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .maybeSingle()

  if (existing) {
    const entryStart = new Date(existing.window_start).getTime()

    // Window expired — reset the counter
    if (entryStart < windowStartCutoff) {
      await supabase
        .from('rate_limits')
        .update({ request_count: 1, window_start: new Date(now).toISOString(), updated_at: new Date(now).toISOString() })
        .eq('id', existing.id)
      return { allowed: true, remaining: max - 1, retryAfterSeconds: 0 }
    }

    // Over the limit within the window
    if (existing.request_count >= max) {
      return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((entryStart + windowMs - now) / 1000) }
    }

    // Increment within the window
    await supabase
      .from('rate_limits')
      .update({ request_count: existing.request_count + 1, updated_at: new Date(now).toISOString() })
      .eq('id', existing.id)
    return { allowed: true, remaining: max - existing.request_count - 1, retryAfterSeconds: 0 }
  }

  // First request in a fresh window
  await supabase
    .from('rate_limits')
    .insert({ identifier, endpoint, request_count: 1, window_start: new Date(now).toISOString() })
  return { allowed: true, remaining: max - 1, retryAfterSeconds: 0 }
}
