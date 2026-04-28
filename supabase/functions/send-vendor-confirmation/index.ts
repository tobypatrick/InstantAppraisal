import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { buildEmail, escapeHtml } from "../_shared/email-template.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const fromDomain = Deno.env.get("EMAIL_FROM_DOMAIN") || "team.instantappraisal.co";

    const { lead_id, agent_id } = await req.json();
    if (!lead_id || !agent_id) {
      return new Response(JSON.stringify({ error: "Missing lead_id or agent_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch lead
    const { data: lead } = await supabase.from("leads").select("contact_email, contact_name, address, status, report_url").eq("id", lead_id).single();
    if (!lead || lead.status !== "complete" || !lead.contact_email) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch agent profile
    const { data: profile } = await supabase.from("profiles").select("full_name, agency_name, phone_number, notification_email").eq("id", agent_id).single();
    const { data: userData } = await supabase.auth.admin.getUserById(agent_id);

    const agentName = escapeHtml(profile?.full_name) || "Your agent";
    const agencyPart = profile?.agency_name ? ` from ${escapeHtml(profile.agency_name)}` : "";
    const contactEmail = profile?.notification_email || userData?.user?.email || "";
    const contactPhone = profile?.phone_number || "";
    const vendorFirstName = escapeHtml(lead.contact_name?.split(" ")[0]) || "there";
    const address = escapeHtml(lead.address);

    let contactLines = "";
    if (contactPhone) contactLines += `<p style="margin:0 0 8px 0;"><a href="tel:${escapeHtml(contactPhone)}" style="color:#10B981;text-decoration:none;">📞 ${escapeHtml(contactPhone)}</a></p>`;
    if (contactEmail) contactLines += `<p style="margin:0;"><a href="mailto:${escapeHtml(contactEmail)}" style="color:#10B981;text-decoration:none;">✉️ ${escapeHtml(contactEmail)}</a></p>`;

    const body = `
      <p style="margin:0 0 16px 0;">Hi ${vendorFirstName},</p>
      <p style="margin:0 0 16px 0;">Thanks for using Instant Appraisal to get your property report for <strong>${address}</strong>.</p>
      <p style="margin:0 0 16px 0;">${agentName}${agencyPart} will be in touch with you shortly to discuss your property's value and answer any questions you may have.</p>
      <p style="margin:0 0 16px 0;">Your PropTrack property report includes your estimated value range, recent comparable sales in your area, and local market insights — everything you need to understand your property's current market position.</p>
      ${contactLines ? `<p style="margin:0 0 8px 0;color:#6b7280;font-size:14px;">In the meantime, you can reach ${agentName} directly:</p>${contactLines}` : ""}
    `;

    const html = buildEmail({
      body,
      ctaText: lead.report_url ? "View Your Property Report" : undefined,
      ctaUrl: lead.report_url || undefined,
      showLogo: false,
      footerText: "You received this email because you requested a property report through an Instant Appraisal powered page.",
    });

    await resend.emails.send({
      from: `${agentName} via InstantAppraisal <noreply@${fromDomain}>`,
      to: [lead.contact_email],
      reply_to: contactEmail || undefined,
      subject: `Your Instant Property Appraisal — ${lead.address}`,
      html,
    });

    console.log(`Vendor confirmation sent to ${lead.contact_email} for lead ${lead_id}`);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Vendor confirmation error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
