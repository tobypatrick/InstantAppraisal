import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Forward inbound emails to the admin's personal inbox
const FORWARD_TO = process.env.INBOUND_FORWARD_TO ?? 'toby.patrick@strudmarketing.com.au'
const ADMIN_ADDRESS = 'admin@instantappraisal.co'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // Only handle email.received events
    if (payload.type !== 'email.received') {
      return NextResponse.json({ ok: true })
    }

    const { email_id, from, to, subject } = payload.data

    // Only forward emails addressed to admin@instantappraisal.co
    const toAddresses: string[] = to ?? []
    const isForAdmin = toAddresses.some((addr: string) =>
      addr.toLowerCase().includes('admin@instantappraisal.co')
    )
    if (!isForAdmin) {
      return NextResponse.json({ ok: true })
    }

    // Fetch the full email body from Resend
    let textBody = ''
    let htmlBody = ''
    try {
      const { data: emailContent } = await resend.emails.get(email_id)
      // @ts-ignore – Resend SDK types lag behind the API
      textBody = emailContent?.text ?? ''
      // @ts-ignore
      htmlBody = emailContent?.html ?? ''
    } catch {
      // If we can't fetch the body, forward with metadata only
      textBody = `[Could not retrieve email body. View it in the Resend dashboard: https://resend.com/emails/${email_id}]`
    }

    // Build a forwarded email
    const forwardedHtml = htmlBody
      ? `
        <div style="border-left:4px solid #e5e7eb;padding:12px 16px;margin-bottom:24px;color:#6b7280;font-family:sans-serif;font-size:13px;">
          <strong>Forwarded from:</strong> ${from}<br/>
          <strong>Originally to:</strong> ${toAddresses.join(', ')}<br/>
          <strong>Subject:</strong> ${subject}
        </div>
        ${htmlBody}
      `
      : `
---------- Forwarded message ----------
From: ${from}
To: ${toAddresses.join(', ')}
Subject: ${subject}
-------------------------------------------

${textBody}
      `

    await resend.emails.send({
      from: `InstantAppraisal Admin <noreply@instantappraisal.co>`,
      to: [FORWARD_TO],
      reply_to: from, // Reply goes back to the original sender
      subject: `[Fwd] ${subject}`,
      html: forwardedHtml || undefined,
      text: forwardedHtml ? undefined : forwardedHtml,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[inbound email] error:', error)
    // Return 200 so Resend doesn't keep retrying on permanent errors
    return NextResponse.json({ ok: false, error: String(error) })
  }
}
