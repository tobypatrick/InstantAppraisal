import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { LimitReachedEmail } from '../_shared/email-templates/limit-reached.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIER_LABELS: Record<string, string> = {
  pro: 'Pro',
  elite: 'Elite',
}

const TIER_LIMITS: Record<string, number> = {
  pro: 20,
  elite: 100,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const fromDomain = Deno.env.get('EMAIL_FROM_DOMAIN') || 'team.instantappraisal.co'
  const dashboardUrl = 'https://dashboard.instantappraisal.co/billing'

  if (!resendApiKey) {
    console.error('Missing RESEND_API_KEY')
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let payload: { agent_id: string }
  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { agent_id } = payload
  if (!agent_id) {
    return new Response(JSON.stringify({ error: 'agent_id is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  // Fetch agent profile + billing + email in parallel
  const [profileRes, billingRes, userRes] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', agent_id).single(),
    supabase.from('billing').select('subscription_tier, subscription_status').eq('user_id', agent_id).single(),
    supabase.auth.admin.getUserById(agent_id),
  ])

  const agentEmail = userRes.data?.user?.email
  if (!agentEmail) {
    console.error('Agent email not found for', agent_id)
    return new Response(JSON.stringify({ error: 'Agent not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const agentName = profileRes.data?.full_name || 'there'
  const tier = billingRes.data?.subscription_tier || 'pro'
  const tierLabel = TIER_LABELS[tier] || tier
  const limit = TIER_LIMITS[tier] || 0

  // Get current month usage
  const { data: usageCount } = await supabase.rpc('get_monthly_report_count', { p_agent_id: agent_id })
  const currentUsage = usageCount ?? limit

  const html = await renderAsync(
    React.createElement(LimitReachedEmail, {
      agentName,
      currentUsage,
      limit,
      tier: tierLabel,
      upgradeUrl: dashboardUrl,
    })
  )
  const text = await renderAsync(
    React.createElement(LimitReachedEmail, {
      agentName,
      currentUsage,
      limit,
      tier: tierLabel,
      upgradeUrl: dashboardUrl,
    }),
    { plainText: true }
  )

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `InstantAppraisal <noreply@${fromDomain}>`,
      to: [agentEmail],
      subject: "You've reached your monthly report limit — InstantAppraisal",
      html,
      text,
    }),
  })

  if (!resendRes.ok) {
    const errBody = await resendRes.text()
    console.error('Resend error', { status: resendRes.status, body: errBody })
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const resendData = await resendRes.json()
  console.log('Limit reached email sent', { agent_id, email: agentEmail, id: resendData.id })

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
