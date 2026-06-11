import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TIER_LIMITS: Record<string, number> = { pro: 20, elite: 100 }
const VALID_INTEREST = ['Looking to Sell', 'Just Interested']

interface CompleteBody {
  lead_id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  interest_level: string
}

function validate(b: CompleteBody): string | null {
  if (!b.lead_id || !UUID_RE.test(b.lead_id)) return 'Invalid lead ID format'
  if (!b.contact_name || !b.contact_name.trim()) return 'Name is required'
  if (b.contact_name.length > 200) return 'Name must be less than 200 characters'
  if (/<[^>]*>/g.test(b.contact_name)) return 'Name cannot contain HTML tags'
  if (!b.contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.contact_email)) return 'Valid email is required'
  if (b.contact_email.length > 255) return 'Email must be less than 255 characters'
  if (!b.contact_phone || b.contact_phone.trim().length < 8) return 'Phone number must be at least 8 characters'
  if (b.contact_phone.length > 20) return 'Phone number must be less than 20 characters'
  if (!/^[0-9+\-\s()]+$/.test(b.contact_phone)) return 'Phone number format invalid'
  if (!b.interest_level || !VALID_INTEREST.includes(b.interest_level)) return 'Invalid interest level'
  return null
}

// Ports the original complete-lead edge function. Validates the contact
// details, enforces the agent's subscription + monthly report limit, marks
// the lead complete, and records one unit of report usage. It does NOT send
// the complete notification or fire the LeadConnector webhook — the landing
// page already does both (after the report step, so the email can include the
// report URL). Recording usage here is the single source of truth; the report
// route no longer records it.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CompleteBody

    const validationError = validate(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, agent_id')
      .eq('id', body.lead_id)
      .eq('status', 'partial')
      .maybeSingle()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found or already completed' }, { status: 404 })
    }

    const { data: billing } = await supabase
      .from('billing')
      .select('subscription_status, subscription_tier')
      .eq('user_id', lead.agent_id)
      .maybeSingle()

    const isActive = ['active', 'trialing'].includes(billing?.subscription_status ?? '')
    if (!isActive) {
      return NextResponse.json(
        { error: 'subscription_inactive', message: 'Agent subscription is not active' },
        { status: 403 }
      )
    }

    const reportLimit = TIER_LIMITS[billing?.subscription_tier ?? ''] ?? 0
    const { data: usageCount } = await supabase.rpc('get_monthly_report_count', { p_agent_id: lead.agent_id })
    const currentUsage = usageCount ?? 0
    if (currentUsage >= reportLimit) {
      return NextResponse.json(
        { error: 'limit_reached', message: 'Monthly report limit reached', current_usage: currentUsage, limit: reportLimit },
        { status: 403 }
      )
    }

    const { error: updateError } = await supabase
      .from('leads')
      .update({
        status: 'complete',
        contact_name: body.contact_name.trim(),
        contact_email: body.contact_email.trim().toLowerCase(),
        contact_phone: body.contact_phone.trim(),
        interest_level: body.interest_level,
      })
      .eq('id', body.lead_id)
      .eq('status', 'partial')

    if (updateError) throw updateError

    // Single source of truth for quota usage.
    await supabase.rpc('record_report_usage', { p_agent_id: lead.agent_id })

    return NextResponse.json({ success: true, agent_id: lead.agent_id })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[leads/complete]', message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
