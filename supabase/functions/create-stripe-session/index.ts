import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.25.0"; // Updated to a modern, stable package release

// Load environment variables
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") as string;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STRIPE_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID");

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16", // Maintained your target API layout version pinned string
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("🔄 Authenticating user via Auth JWT...");
    const authHeader = req.headers.get("Authorization")?.split(" ")[1] ?? "";
    if (!authHeader) {
      throw new Error("Missing authorization credential vector header");
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader);

    if (authError || !user) {
      throw new Error(`Authentication validation failed: ${authError?.message ?? "User payload empty"}`);
    }

    console.log(`🔎 Target matched user reference: ${user.id}`);

    // 1. Fetch Stripe Customer ID from the updated public.accounts table
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (accountError || !account) {
      console.error("Account fetch runtime error:", accountError);
      throw new Error("Target user account entity footprint not found in database registry");
    }

    if (!account.stripe_customer_id) {
      throw new Error("Stripe consumer token association missing on this record account layer");
    }

    // 2. Cross-reference subscription tier status from public.account_subscriptions
    const { data: subscription } = await supabase
      .from("account_subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(); // Gracefully handles if no active record row is matched directly

    const originUrl = req.headers.get("origin") ?? "http://localhost:3000";

    // 3. Routing Condition: Send active premium users straight to the Billing Management Portal
    if (subscription && subscription.plan === "premium") {
      console.log(`🎟️ Redirecting Premium client (${user.id}) to Stripe Management Portal`);
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: account.stripe_customer_id,
        return_url: `${originUrl}/profile`,
      });
      
      return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Routing Condition: Create a regular Checkout Session if they are on the free plan
    console.log(`💳 Initializing Stripe checkout session workflow for customer: ${account.stripe_customer_id}`);
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: account.stripe_customer_id,
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${originUrl}/profile?success=true`,
      cancel_url: `${originUrl}/profile?canceled=true`,
    });

    return new Response(JSON.stringify({ url: checkoutSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Fatal exception caught in create-stripe-session runtime block:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});