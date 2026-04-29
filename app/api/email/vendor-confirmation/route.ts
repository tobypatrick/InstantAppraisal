import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { buildEmail, escapeHtml } from '@/lib/email-template'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const { lead_id, agent_id } = await request.json()
    if (!lead_id || !agent_id) {
      return NextResponse.json({ error: 'Missing lead_id or agent_id' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: lead } = await supabase
      .from('leads')
      .select('contact_email, contact_name, address, status, report_url')
      .eq('id', lead_id)
      .single()

    // Only requirement is a contact email — the homeowner has already given
    // it to us by submitting the form. The previous status === 'complete'
    // check caused races with save-estimate (which sets that status) and
    // resulted in confirmations being silently skipped.
    if (!lead || !lead.contact_email) {
      return NextResponse.json({ skipped: true, reason: 'no contact email' })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, agency_name, phone_number, notification_email')
      .eq('id', agent_id)
      .single()
    const { data: userData } = await supabase.auth.admin.getUserById(agent_id)

    const agentName = escapeHtml(profile?.full_name) || 'Your agent'
    const agencyPart = profile?.agency_name ? ` from ${escapeHtml(profile.agency_name)}` : ''
    const contactEmail = profile?.notification_email || userData?.user?.email || ''
    const contactPhone = profile?.phone_number || ''
    const vendorFirstName = escapeHtml(lead.contact_name?.split(' ')[0]) || 'there'
    const address = escapeHtml(lead.address)

    let contactLines = ''
    if (contactPhone) {
      contactLines += `<p style="margin:0 0 8px 0;"><a href="tel:${escapeHtml(contactPhone)}" style="color:#10B981;text-decoration:none;">📞 ${escapeHtml(contactPhone)}</a></p>`
    }
    if (contactEmail) {
      contactLines += `<p style="margin:0;"><a href="mailto:${escapeHtml(contactEmail)}" style="color:#10B981;text-decoration:none;">✉️ ${escapeHtml(contactEmail)}</a></p>`
    }

    const body = `
      <p style="margin:0 0 16px 0;">Hi ${vendorFirstName},</p>
      <p style="margin:0 0 16px 0;">Thanks for using Instant Appraisal to get your property report for <strong>${address}</strong>.</p>
      <p style="margin:0 0 16px 0;">${agentName}${agencyPart} will be in touch with you shortly to discuss your property's value and answer any questions you may have.</p>
      <p style="margin:0 0 16px 0;">Your PropTrack property report includes your estimated value range, recent comparable sales in your area, and local market insights — everything you need to understand your property's current market position.</p>
      ${contactLines ? `<p style="margin:0 0 8px 0;color:#6b7280;font-size:14px;">In the meantime, you can reach ${agentName} directly:</p>${contactLines}` : ''}
    `

    const html = buildEmail({
      body,
      ctaText: lead.report_url ? 'View Your Property Report' : undefined,
      ctaUrl: lead.report_url || undefined,
      showLogo: false,
      footerText: 'You received this email because you requested a property report through an Instant Appraisal powered page.',
    })

    const fromDomain = process.env.EMAIL_FROM_DOMAIN || 'team.instantappraisal.co'
    const resend = new Resend(apiKey)
    const { error: sendError } = await resend.emails.send({
      from: `${agentName} via InstantAppraisal <noreply@${fromDomain}>`,
      to: [lead.contact_email],
      replyTo: contactEmail || undefined,
      subject: `Your Instant Property Appraisal — ${lead.address}`,
      html,
    })

    if (sendError) {
      console.error('[vendor-confirmation] Resend error:', sendError)
      return NextResponse.json({ error: sendError.message ?? 'Send failed' }, { status: 502 })
    }

    console.log(`[vendor-confirmation] sent to ${lead.contact_email} for lead ${lead_id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[vendor-confirmation] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
