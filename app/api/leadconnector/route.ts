import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { agent_id, lead_id } = await request.json()

    if (!agent_id || !lead_id) {
      return NextResponse.json({ error: 'agent_id and lead_id are required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const [{ data: profile }, { data: lead }] = await Promise.all([
      supabase.from('profiles').select('leadconnector_webhook_url').eq('id', agent_id).single(),
      supabase.from('leads').select('address, contact_name, contact_email, contact_phone, interest_level, utm_source').eq('id', lead_id).single(),
    ])

    const webhookUrl = profile?.leadconnector_webhook_url
    if (!webhookUrl) {
      return NextResponse.json({ skipped: true, reason: 'no webhook configured' })
    }

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const [firstName, ...rest] = (lead.contact_name || '').trim().split(' ')
    const payload = {
      firstName: firstName || '',
      lastName: rest.join(' ') || '',
      email: lead.contact_email || '',
      phone: lead.contact_phone || '',
      address: lead.address || '',
      source: lead.utm_source || 'instant-appraisal',
      tags: ['instant-appraisal'],
      customField: {
        interest_level: lead.interest_level || '',
        address: lead.address || '',
      },
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      console.error('LeadConnector webhook failed:', res.status, await res.text())
      return NextResponse.json({ error: 'Webhook delivery failed', status: res.status }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('leadconnector route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
