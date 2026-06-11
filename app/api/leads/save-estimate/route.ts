import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    const { lead_id, estimated_value, report_url } = await request.json()

    if (!lead_id || !UUID_RE.test(lead_id)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 })
    }

    if (!estimated_value && !report_url) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Write only the columns that exist on `leads`. estimated_value is a
    // jsonb column holding { low, mid, high }; report_url is text. The
    // previous port also wrote estimated_value_low/mid/high, which don't
    // exist — that made every write fail and silently drop the report URL.
    const update: Record<string, unknown> = {}
    if (estimated_value && typeof estimated_value === 'object') {
      update.estimated_value = estimated_value
    }
    if (report_url && typeof report_url === 'string') {
      update.report_url = report_url
    }

    const { error } = await supabase
      .from('leads')
      .update(update)
      .eq('id', lead_id)
      .eq('status', 'complete')

    if (error) {
      console.error('[save-estimate] update failed:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[save-estimate] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
