import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { lead_id, estimated_value, report_url } = await request.json()

    if (!lead_id) {
      return NextResponse.json({ error: 'Missing lead_id' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const update: Record<string, unknown> = {
      status: 'complete',
      updated_at: new Date().toISOString(),
    }
    if (report_url) update.report_url = report_url
    if (estimated_value && typeof estimated_value === 'object') {
      // Try common column names — keep both write attempts so we cover the
      // schema regardless of how the original Lovable migration named it.
      update.estimated_value_low = estimated_value.low ?? null
      update.estimated_value_mid = estimated_value.mid ?? null
      update.estimated_value_high = estimated_value.high ?? null
      update.estimated_value = estimated_value
    }

    const { error } = await supabase.from('leads').update(update).eq('id', lead_id)

    if (error) {
      // Retry without the columns most likely to be missing
      console.warn('[save-estimate] full update failed, retrying minimal:', error.message)
      const minimal: Record<string, unknown> = {
        status: 'complete',
        updated_at: new Date().toISOString(),
      }
      if (report_url) minimal.report_url = report_url
      const { error: minimalError } = await supabase.from('leads').update(minimal).eq('id', lead_id)
      if (minimalError) {
        console.error('[save-estimate] minimal update also failed:', minimalError.message)
        return NextResponse.json({ error: minimalError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[save-estimate] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
