import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { buildEmail, escapeHtml } from '@/lib/email-template'

const TIER_LABELS: Record<string, string> = { pro: 'Pro', elite: 'Elite' }
const TIER_LIMITS: Record<string, number> = { pro: 20, elite: 100 }

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const { agent_id } = await request.json()
    if (!agent_id) {
      return NextResponse.json({ error: 'agent_id required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const [profileRes, billingRes, userRes] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', agent_id).single(),
      supabase.from('billing').select('subscription_tier').eq('user_id', agent_id).single(),
      supabase.auth.admin.getUserById(agent_id),
    ])

    const agentEmail = userRes.data?.user?.email
    if (!agentEmail) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const agentName = escapeHtml(profileRes.data?.full_name) || 'there'
    const tier = billingRes.data?.subscription_tier || 'pro'
    const tierLabel = TIER_LABELS[tier] || tier
    const limit = TIER_LIMITS[tier] || 0

    const isElite = tier === 'elite'
    const upgradeUrl = 'https://dashboard.instantappraisal.co/billing'

    const body = `
      <p style="margin:0 0 16px 0;">Hi ${agentName},</p>
      <p style="margin:0 0 16px 0;">You've used all <strong>${limit} property reports</strong> on your ${tierLabel} plan this month. Your homeowners are still being captured as leads, but they will not receive a PropTrack report until your usage resets next month or you upgrade your plan.</p>
      ${isElite
        ? `<p style="margin:0 0 16px 0;">Your usage will reset at the start of next billing period.</p>`
        : `<p style="margin:0 0 16px 0;">Upgrade to Elite for <strong>100 reports per month</strong> and priority email support.</p>`}
    `

    const html = buildEmail({
      body,
      ctaText: isElite ? 'Manage Subscription' : 'Upgrade to Elite',
      ctaUrl: upgradeUrl,
    })

    const fromDomain = process.env.EMAIL_FROM_DOMAIN || 'team.instantappraisal.co'
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: `InstantAppraisal <hello@${fromDomain}>`,
      replyTo: 'team@instantappraisal.co',
      to: [agentEmail],
      subject: "You've reached your monthly report limit",
      html,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[limit-reached] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
