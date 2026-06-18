import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Does an account exist for this email? Used by the login form to show
// "No account found" vs "Incorrect password".
//
// NOTE: GoTrue's /admin/users list endpoint does NOT filter by email (the old
// ?email= query was silently ignored, so it always returned a user → always
// "exists: true"). So we list and match the email ourselves. Fine for the
// current scale; swap for an email_exists() RPC if the user base grows large.
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ exists: false })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (error) {
      // Unknown — default to "exists" so we fall through to the generic
      // "Incorrect password" rather than wrongly telling a real user they
      // have no account.
      return NextResponse.json({ exists: true })
    }

    const target = email.trim().toLowerCase()
    const exists = (data?.users ?? []).some((u) => u.email?.toLowerCase() === target)
    return NextResponse.json({ exists })
  } catch {
    return NextResponse.json({ exists: true })
  }
}
