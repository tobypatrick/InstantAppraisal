import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    const { agent_id, event_type, source } = await request.json()

    if (!agent_id || !event_type) {
      return NextResponse.json({ error: 'Missing required fields: agent_id, event_type' }, { status: 400 })
    }

    if (!['view', 'click'].includes(event_type)) {
      return NextResponse.json({ error: "Invalid event_type. Must be 'view' or 'click'" }, { status: 400 })
    }

    if (!UUID_RE.test(agent_id)) {
      return NextResponse.json({ error: 'Invalid agent_id format' }, { status: 400 })
    }

    const sanitizedSource = source
      ? String(source).substring(0, 100).replace(/[<>"']/g, '')
      : null

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { error } = await supabase.from('analytics').insert({
      agent_id,
      event_type,
      source: sanitizedSource,
    })

    if (error) {
      console.error('Error inserting analytics:', error)
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
