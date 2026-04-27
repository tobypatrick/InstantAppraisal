import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { buildEmail, escapeHtml } from "../_shared/email-template.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function formatAEST(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function buildPartialEmail(firstName: string, address: string, date: string, utmSource: string): string {
  return `
    <p style="margin:0 0 16px 0;">Hey ${firstName},</p>
    <p style="margin:0 0 16px 0;">Someone searched for a property valuation on your Instant Appraisal page but didn't complete the form. No contact details were captured.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px 0;">
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Property</td><td style="padding:8px 0;font-size:16px;font-weight:500;color:#333333;">${address}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Source</td><td style="padding:8px 0;font-size:16px;color:#333333;">${utmSource}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Date</td><td style="padding:8px 0;font-size:16px;color:#333333;">${date}</td></tr>
    </table>
    <p style="margin:0 0 0 0;color:#6b7280;font-size:14px;line-height:1.6;">This is a market activity signal. Consider a letterbox drop, door knock, or check if it is a nearby listing you could prospect.</p>`;
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
  limitReached = false,
): string {
  let actionButtons = "";
  if (leadPhone) {
    actionButtons += `<a href="tel:${escapeHtml(leadPhone)}" style="display:inline-block;background-color:#10B981;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:0 24px;line-height:40px;border-radius:6px;margin-right:8px;">Call Now</a>`;
  }
  if (leadEmail) {
    actionButtons += `<a href="mailto:${escapeHtml(leadEmail)}" style="display:inline-block;background-color:#10B981;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:0 24px;line-height:40px;border-radius:6px;">Send Email</a>`;
  }

  const actionRow = actionButtons
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0 0 0;"><tr><td>${actionButtons}</td></tr></table>`
    : "";

  const reportRow = reportUrl
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Report</td><td style="padding:8px 0;font-size:16px;color:#333333;"><a href="${escapeHtml(reportUrl)}" target="_blank" style="color:#10B981;text-decoration:underline;">View PropTrack Report</a></td></tr>`
    : limitReached
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Report</td><td style="padding:8px 0;font-size:14px;color:#dc2626;">A report could not be generated for this property as you have reached your report limit.</td></tr>`
    : "";

  return `
    <p style="margin:0 0 16px 0;">Hey ${firstName},</p>
    <p style="margin:0 0 24px 0;">A homeowner has completed an instant appraisal on your page. This is a warm seller lead — follow up promptly.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 8px 0;">
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Name</td><td style="padding:8px 0;font-size:16px;font-weight:500;color:#333333;">${leadName}</td></tr>
      ${leadEmail ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Email</td><td style="padding:8px 0;font-size:16px;color:#333333;">${escapeHtml(leadEmail)}</td></tr>` : ""}
      ${leadPhone ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Phone</td><td style="padding:8px 0;font-size:16px;color:#333333;">${escapeHtml(leadPhone)}</td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Property</td><td style="padding:8px 0;font-size:16px;color:#333333;">${address}</td></tr>
      ${reportRow}
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Source</td><td style="padding:8px 0;font-size:16px;color:#333333;">${utmSource}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;vertical-align:top;">Date</td><td style="padding:8px 0;font-size:16px;color:#333333;">${date}</td></tr>
    </table>
    ${actionRow}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();

    // Support both direct invocation and webhook payload
    const record = payload.record || payload;
    const notificationType: string = payload.type || "complete";
    const limitReached: boolean = payload.limit_reached === true;
    const leadId = record.id || record.lead_id;
    const agentId = record.agent_id;

    if (!leadId || !agentId) {
      return new Response(JSON.stringify({ error: "Missing lead_id or agent_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For partial notifications, verify the lead is still partial
    if (notificationType === "partial") {
      const { data: lead } = await supabase
        .from("leads")
        .select("status")
        .eq("id", leadId)
        .single();

      if (!lead || lead.status !== "partial") {
        // Lead has already been completed, skip partial notification
        console.log("Lead", leadId, "is no longer partial, skipping notification");
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch full lead data
    const { data: leadData, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadError || !leadData) {
      console.error("Lead not found:", leadId);
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get agent profile (including notification_email override)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, slug, notification_email")
      .eq("id", agentId)
      .single();

    // Get agent email (fallback if no notification_email override)
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(agentId);
    if (userError || !userData.user?.email) {
      console.error("Could not find agent email for", agentId);
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use notification_email override if set, otherwise fall back to login email
    const agentEmail = profile?.notification_email || userData.user.email;
    const firstName = escapeHtml(profile?.full_name?.split(" ")[0]) || "there";
    const leadAddress = escapeHtml(leadData.address);
    const utmSource = escapeHtml(leadData.utm_source) || "Direct";
    const formattedDate = formatAEST(leadData.created_at || new Date().toISOString());

    let subject: string;
    let body: string;
    let ctaText: string;
    let ctaUrl: string;

    if (notificationType === "partial") {
      subject = `New Address Search \u2014 ${leadData.address}`;
      body = buildPartialEmail(firstName, leadAddress, formattedDate, utmSource);
      ctaText = "View All Leads";
      ctaUrl = "https://dashboard.instantappraisal.co/leads";
    } else {
      const leadName = escapeHtml(leadData.contact_name) || "Anonymous";
      const leadEmail = leadData.contact_email || "";
      const leadPhone = leadData.contact_phone || "";
      const reportUrl = leadData.report_url || null;

      subject = `Instant Appraisal Completed \u2014 ${leadData.address}`;
      body = buildCompleteEmail(
        firstName,
        leadName,
        leadEmail,
        leadPhone,
        leadAddress,
        reportUrl,
        formattedDate,
        utmSource,
        limitReached,
      );
      ctaText = "View Lead";
      ctaUrl = `https://dashboard.instantappraisal.co/leads?highlight=${leadId}`;
    }

    const emailHtml = buildEmail({ body, ctaText, ctaUrl });

    const fromDomain = Deno.env.get("EMAIL_FROM_DOMAIN") || "team.instantappraisal.co";
    await resend.emails.send({
      from: `Instant Appraisal <noreply@${fromDomain}>`,
      to: [agentEmail],
      subject,
      html: emailHtml,
    });

    console.log(`${notificationType} lead notification sent for lead ${leadId} to ${agentEmail}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Lead notification error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
