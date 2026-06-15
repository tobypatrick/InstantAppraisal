import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature',
}

const SITE_NAME = 'InstantAppraisal'
const SITE_URL = Deno.env.get('SITE_URL') || 'https://instantappraisal.co'
const FROM_DOMAIN = Deno.env.get('EMAIL_FROM_DOMAIN') || 'team.instantappraisal.co'

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your email — InstantAppraisal',
  invite: "You've been invited to InstantAppraisal",
  magiclink: 'Your login link — InstantAppraisal',
  recovery: 'Reset your password — InstantAppraisal',
  email_change: 'Confirm your new email — InstantAppraisal',
  reauthentication: 'Your verification code — InstantAppraisal',
}

const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

// Standard Webhooks signature verification
// https://docs.supabase.com/docs/guides/functions/webhook-standard-webhooks
async function verifyStandardWebhook(req: Request, secret: string): Promise<string> {
  const msgId = req.headers.get('webhook-id')
  const msgTimestamp = req.headers.get('webhook-timestamp')
  const msgSignature = req.headers.get('webhook-signature')

  if (!msgId || !msgTimestamp || !msgSignature) {
    throw new Error('Missing Standard Webhooks headers')
  }

  // Reject timestamps more than 5 minutes old
  const ts = parseInt(msgTimestamp, 10)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - ts) > 300) {
    throw new Error('Webhook timestamp too old or too far in the future')
  }

  const body = await req.text()

  // Decode the whsec_ secret
  const secretBytes = base64Decode(secret.replace(/^v1,whsec_/, '').replace(/^whsec_/, ''))

  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const toSign = `${msgId}.${msgTimestamp}.${body}`
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(toSign))
  const computedSig = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))

  // webhook-signature may contain multiple signatures (v1,sig1 v1,sig2)
  const sigs = msgSignature.split(' ').map((s) => s.replace(/^v1,/, ''))
  const valid = sigs.some((s) => s === computedSig)
  if (!valid) {
    throw new Error('Invalid webhook signature')
  }

  return body
}

function base64Decode(str: string): Uint8Array {
  const bin = atob(str)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const webhookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')

  if (!resendApiKey || !webhookSecret) {
    console.error('Missing RESEND_API_KEY or SEND_EMAIL_HOOK_SECRET')
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let body: string
  try {
    body = await verifyStandardWebhook(req, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Verification failed'
    console.error('Webhook verification failed:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let payload: any
  try {
    payload = JSON.parse(body)
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Supabase auth hook payload structure:
  // { user: { email, ... }, email_data: { email_action_type, token, token_hash, redirect_to, site_url, ... } }
  const emailType = payload?.email_data?.email_action_type
  const recipientEmail = payload?.user?.email
  const tokenHash = payload?.email_data?.token_hash
  const token = payload?.email_data?.token
  const newEmail = payload?.user?.new_email || payload?.email_data?.new_email

  // Sanitise redirect URL — Supabase may send localhost if Site URL wasn't set yet
  let rawRedirectTo = payload?.email_data?.redirect_to || payload?.email_data?.site_url || SITE_URL
  const redirectTo = (rawRedirectTo.includes('localhost') || rawRedirectTo.startsWith('/'))
    ? `${SITE_URL}/auth/callback`
    : rawRedirectTo

  // Build the real Supabase verify URL — this processes the token then forwards to redirectTo with a code
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const confirmationUrl = tokenHash
    ? `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${emailType}&redirect_to=${encodeURIComponent(redirectTo)}`
    : redirectTo

  console.log('Auth email hook received', { emailType, recipient: recipientEmail })

  if (!emailType || !recipientEmail) {
    return new Response(
      JSON.stringify({ error: 'Missing email_action_type or user.email in payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate) {
    console.error('Unknown email type:', emailType)
    return new Response(
      JSON.stringify({ error: `Unknown email type: ${emailType}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    recipient: recipientEmail,
    confirmationUrl,
    token,
    email: recipientEmail,
    newEmail,
  }

  const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), { plainText: true })

  const subject = EMAIL_SUBJECTS[emailType] || 'InstantAppraisal notification'
  // Friendly, reply-able sender (not no-reply) — replies route to a monitored
  // inbox. Improves trust/engagement signals with spam filters.
  const fromAddress = `InstantAppraisal <hello@${FROM_DOMAIN}>`
  const replyToAddress = 'team@instantappraisal.co'

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      reply_to: replyToAddress,
      to: [recipientEmail],
      subject,
      html,
      text,
    }),
  })

  if (!resendRes.ok) {
    const errBody = await resendRes.text()
    console.error('Resend API error', { status: resendRes.status, body: errBody })
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const resendData = await resendRes.json()
  console.log('Auth email sent via Resend', { emailType, recipient: recipientEmail, id: resendData.id })

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
