import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SECOND_TRIAL_MESSAGE = "You've already used your free trial. Please enter your billing details to continue.";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Price IDs loaded from environment variables
const getProPriceId = (interval: string) => {
  if (interval === "year") return Deno.env.get("STRIPE_PRO_ANNUAL_PRICE_ID") ?? "";
  return Deno.env.get("STRIPE_PRO_PRICE_ID") ?? "";
};

const getElitePriceId = (interval: string) => {
  if (interval === "year") return Deno.env.get("STRIPE_ELITE_ANNUAL_PRICE_ID") ?? "";
  return Deno.env.get("STRIPE_ELITE_PRICE_ID") ?? "";
};

const hasStripeTrialHistory = async (stripe: Stripe, customerId: string) => {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });

  return subscriptions.data.some(
    (subscription) => subscription.trial_start !== null || subscription.trial_end !== null,
  );
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) throw new Error(`Authentication error: ${authError.message}`);

    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { tier, interval = "month" } = await req.json();

    // Validate tier
    if (!tier || !["pro", "elite"].includes(tier)) {
      throw new Error("Invalid tier specified. Must be 'pro' or 'elite'");
    }

    // Validate interval
    if (interval !== "month" && interval !== "year") {
      throw new Error("Invalid interval specified. Must be 'month' or 'year'");
    }

    const selectedPriceId = tier === "pro" ? getProPriceId(interval) : getElitePriceId(interval);
    if (!selectedPriceId) {
      throw new Error(`Price ID not configured for ${tier} ${interval}. Set the appropriate STRIPE_*_PRICE_ID env var.`);
    }

    logStep("Selected tier and interval", { tier, interval, priceId: selectedPriceId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;
    if (customerId) {
      logStep("Existing customer found", { customerId });
    }

    // Check one-time trial eligibility — check by EMAIL across all users
    let trialUsed = false;

    // 1) Check current user's billing record
    const { data: billingRecord, error: billingError } = await supabaseClient
      .from("billing")
      .select("trial_used")
      .eq("user_id", user.id)
      .maybeSingle();

    if (billingError) {
      throw new Error(`Failed to check trial eligibility: ${billingError.message}`);
    }

    if (billingRecord?.trial_used) {
      trialUsed = true;
    }

    // 2) Check ALL auth users with the same email for prior trial usage
    if (!trialUsed) {
      const { data: allUsers } = await supabaseClient.auth.admin.listUsers();
      const matchingUserIds = (allUsers?.users || [])
        .filter((u: any) => u.email === user.email)
        .map((u: any) => u.id);

      if (matchingUserIds.length > 0) {
        const { data: billingRecords } = await supabaseClient
          .from("billing")
          .select("trial_used")
          .in("user_id", matchingUserIds);

        if (billingRecords?.some((b: any) => b.trial_used)) {
          trialUsed = true;
          // Sync flag to current user's billing record
          await supabaseClient
            .from("billing")
            .upsert({ user_id: user.id, trial_used: true }, { onConflict: "user_id" });
          logStep("Trial previously used under same email (different account)", { email: user.email });
        }
      }
    }

    // 3) Fallback safety check from Stripe history
    if (!trialUsed && customerId) {
      const usedInStripe = await hasStripeTrialHistory(stripe, customerId);
      if (usedInStripe) {
        trialUsed = true;

        await supabaseClient
          .from("billing")
          .upsert({ user_id: user.id, trial_used: true }, { onConflict: "user_id" });

        logStep("Detected historical trial in Stripe and synced billing flag", { userId: user.id, customerId });
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: "https://dashboard.instantappraisal.co/?checkout=success",
      cancel_url: "https://instantappraisal.co/auth/login?checkout=cancelled",
    };

    if (!trialUsed) {
      sessionParams.subscription_data = {
        trial_period_days: 30,
      };
    } else {
      sessionParams.custom_text = {
        submit: {
          message: SECOND_TRIAL_MESSAGE,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    logStep("Checkout session created", {
      sessionId: session.id,
      url: session.url,
      trialApplied: !trialUsed,
    });

    return new Response(JSON.stringify({
      url: session.url,
      trial_applied: !trialUsed,
      message: trialUsed ? SECOND_TRIAL_MESSAGE : null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
