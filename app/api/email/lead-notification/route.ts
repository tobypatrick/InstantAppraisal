import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { buildEmail, escapeHtml, formatAEST } from '@/lib/email-template'

function buildPartialEmail(firstName: string, address: string, date: string, utmSource: string): string {
  return `
    <p style="margin:0 0 16px 0;">Hey ${firstName},</p>
    <p style="margin:0 0 16px 0;">Someone searched for a property valuation on your Instant Appraisal page but didn't complete the form. No contact details were captured.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px 0;">
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Property</td><td style="padding:8px 0;font-size:16px;font-weight:500;color:#333333;">${address}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Source</td><td style="padding:8px 0;font-size:16px;color:#333333;">${utmSource}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Date</td><td style="padding:8px 0;font-size:16px;color:#333333;">${date}</td></tr>
    </table>
    <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">This is a market activity signal. Consider a letterbox drop, door knock, or check if it is a nearby listing you could prospect.</p>`
}

function buildCompleteEmail(
  firstName: string,
  leadName: string,
  leadEmail: string,
  leadPhone: string,
  address: string,
  reportUrl: string | null,
  date: string,
  utmSource: string,
  limitReached = false
): string {
  let actionButtons = ''
  if (leadPhone) {
    actionButtons += `<a href="tel:${escapeHtml(leadPhone)}" style="display:inline-block;background-color:#10B981;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:0 24px;line-height:40px;border-radius:6px;margin-right:8px;">Call Now</a>`
  }
  if (leadEmail) {
    actionButtons += `<a href="mailto:${escapeHtml(leadEmail)}" style="display:inline-block;background-color:#10B981;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:0 24px;line-height:40px;border-radius:6px;">Send Email</a>`
  }

  const actionRow = actionButtons
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0 0 0;"><tr><td>${actionButtons}</td></tr></table>`
    : ''

  const reportRow = reportUrl
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Report</td><td style="padding:8px 0;font-size:16px;color:#333333;"><a href="${escapeHtml(reportUrl)}" target="_blank" style="color:#10B981;text-decoration:underline;">View PropTrack Report</a></td></tr>`
    : limitReached
      ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Report</td><td style="padding:8px 0;font-size:14px;color:#dc2626;">A report could not be generated for this property as you have reached your report limit.</td></tr>`
      : ''

  return `
    <p style="margin:0 0 16px 0;">Hey ${firstName},</p>
    <p style="margin:0 0 24px 0;">A homeowner has completed an instant appraisal on your page. This is a warm seller lead — follow up promptly.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 8px 0;">
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Name</td><td style="padding:8px 0;font-size:16px;font-weight:500;color:#333333;">${leadName}</td></tr>
      ${leadEmail ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Email</td><td style="padding:8px 0;font-size:16px;color:#333333;">${escapeHtml(leadEmail)}</td></tr>` : ''}
      ${leadPhone ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Phone</td><td style="padding:8px 0;font-size:16px;color:#333333;">${escapeHtml(leadPhone)}</td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Property</td><td style="padding:8px 0;font-size:16px;color:#333333;">${address}</td></tr>
      ${reportRow}
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Source</td><td style="padding:8px 0;font-size:16px;color:#333333;">${utmSource}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Date</td><td style="padding:8px 0;font-size:16px;color:#333333;">${date}</td></tr>
    </table>
    ${actionRow}`
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const payload = await request.json()
    const notificationType: string = payload.type || 'complete'
    const limitReached: boolean = payload.limit_reached === true
    const leadId = payload.lead_id
    const agentId = payload.agent_id

    if (!leadId || !agentId) {
      return NextResponse.json({ error: 'Missing lead_id or agent_id' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // For partial notifications, only send if lead is still partial
    if (notificationType === 'partial') {
      const { data: lead } = await supabase
        .from('leads')
        .select('status')
        .eq('id', leadId)
        .single()
      if (!lead || lead.status !== 'partial') {
        return NextResponse.json({ success: true, skipped: true })
      }
    }

    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError || !leadData) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, slug, notification_email')
      .eq('id', agentId)
      .single()

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(agentId)
    if (userError || !userData.user?.email) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Custom override beats Supabase login email
    const agentEmail = profile?.notification_email || userData.user.email
    const firstName = escapeHtml(profile?.full_name?.split(' ')[0]) || 'there'
    const leadAddress = escapeHtml(leadData.address)
    const utmSource = escapeHtml(leadData.utm_source) || 'Direct'
    const formattedDate = formatAEST(leadData.created_at || new Date().toISOString())

    let subject: string
    let body: string
    let ctaText: string
    let ctaUrl: string
    let secondaryCtaText: string | undefined
    let secondaryCtaUrl: string | undefined

    if (notificationType === 'partial') {
      subject = `New Address Search — ${leadData.address}`
      body = buildPartialEmail(firstName, leadAddress, formattedDate, utmSource)
      ctaText = 'View All Leads'
      ctaUrl = 'https://dashboard.instantappraisal.co/leads'
    } else {
      const leadName = escapeHtml(leadData.contact_name) || 'Anonymous'
      const leadEmail = leadData.contact_email || ''
      const leadPhone = leadData.contact_phone || ''
      const reportUrl = leadData.report_url || null

      subject = `Instant Appraisal Completed — ${leadData.address}`
      body = buildCompleteEmail(
        firstName, leadName, leadEmail, leadPhone, leadAddress,
        reportUrl, formattedDate, utmSource, limitReached
      )
      ctaText = 'View Lead'
      ctaUrl = `https://dashboard.instantappraisal.co/leads?highlight=${leadId}`
      // Secondary "View Report" button next to "View Lead", only when a
      // PropTrack report was generated for this lead.
      if (reportUrl) {
        secondaryCtaText = 'View Report'
        secondaryCtaUrl = reportUrl
      }
    }

    const html = buildEmail({ body, ctaText, ctaUrl, secondaryCtaText, secondaryCtaUrl })

    const fromDomain = process.env.EMAIL_FROM_DOMAIN || 'team.instantappraisal.co'
    const resend = new Resend(apiKey)
    const { error: sendError } = await resend.emails.send({
      from: `Instant Appraisal <noreply@${fromDomain}>`,
      to: [agentEmail],
      subject,
      html,
    })

    if (sendError) {
      console.error('[lead-notification] Resend error:', sendError)
      return NextResponse.json({ error: sendError.message ?? 'Send failed' }, { status: 502 })
    }

    console.log(`[lead-notification] sent ${notificationType} for lead ${leadId} → ${agentEmail}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[lead-notification] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
