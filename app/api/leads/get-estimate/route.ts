import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Returns the saved estimate for a completed lead. Ports the original
// `get-estimate` Supabase edge function, which was never migrated — the
// landing page's "reveal estimate" button was calling a function that
// doesn't exist, so it always failed.
export async function POST(request: NextRequest) {
  try {
    const { lead_id } = await request.json()

    if (!lead_id || !UUID_RE.test(lead_id)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: lead, error } = await supabase
      .from('leads')
      .select('estimated_value')
      .eq('id', lead_id)
      .eq('status', 'complete')
      .single()

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, estimated_value: lead.estimated_value })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[get-estimate] error:', message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
