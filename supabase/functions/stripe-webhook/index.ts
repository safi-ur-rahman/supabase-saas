import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.25.0";

// Load environment variables
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") as string;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

console.log("🌍 Stripe Webhook Handler initializing...");

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Required configuration mapping for Deno Web Crypto execution context
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  try {
    if (!signature || !WEBHOOK_SECRET) {
      throw new Error(
        "Missing verification vectors: Webhook secret handshake or signature signature payload",
      );
    }

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      WEBHOOK_SECRET,
      undefined,
      cryptoProvider,
    );

    console.log(`🔔 Stripe Webhook Intercepted Event: [${event.type}]`);

    // Initialize the superuser admin client context to confidently manage RLS subscription matrices
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        // 🚀 CRITICAL: Extract the Supabase User UUID we injected during checkout generation
        const userId = session.client_reference_id as string;

        if (!userId) {
          throw new Error(
            "Stripe checkout session missing critical 'client_reference_id' payload metadata map.",
          );
        }

        console.log(
          `🎉 Checkout complete received for User UUID: ${userId} -> Stripe Customer: ${customerId}`,
        );

        // 1. Sync the newly minted Stripe Customer ID back to their account profile row permanently
        const { error: accountUpdateError } = await supabaseAdmin
          .from("accounts")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", userId);

        if (accountUpdateError) {
          console.error(
            `⚠️ Failed to update account record with stripe_customer_id for user ${userId}:`,
            accountUpdateError,
          );
          throw accountUpdateError;
        }

        // 2. Fetch deep object parameters straight from Stripe API endpoints to capture precise billing timestamps
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

        // 3. Upsert state directly into public.account_subscriptions using the database constraints ('premium')
        const { error: syncError } = await supabaseAdmin
          .from("account_subscriptions")
          .upsert(
            {
              user_id: userId,
              stripe_subscription_id: subscriptionId,
              plan: "premium", // Matches your lowercase check constraint
              status: stripeSub.status, // e.g., 'active'
            },
            { onConflict: "user_id" },
          );

        if (syncError) throw syncError;
        console.log(
          `🎉 Successfully initialized premium subscription tier for user: ${userId}`,
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(
          `🔄 Processing lifecycle update event loop for client subscription: ${subscription.id}`,
        );

        const { data: account } = await supabaseAdmin
          .from("accounts")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (account) {
          // Sync modifications back to your ledger matching check constraints ('premium' / 'free')
          const { error: updateError } = await supabaseAdmin
            .from("account_subscriptions")
            .update({
              status: subscription.status,
              plan: subscription.status === "active" ? "premium" : "free",
            })
            .eq("user_id", account.user_id);

          if (updateError) throw updateError;
          console.log(
            `✅ Synced status modification metrics [${subscription.status}] to ledger.`,
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(
          `❌ Subscription termination signal received for: ${subscription.id}`,
        );

        const { data: account } = await supabaseAdmin
          .from("accounts")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (account) {
          // Gracefully downgrade entry back to free plan ruleset
          const { error: downgradeError } = await supabaseAdmin
            .from("account_subscriptions")
            .update({
              plan: "free", // Reverts cleanly back to 'free' matching your database layout rules
              status: "canceled",
              stripe_subscription_id: null,
            })
            .eq("user_id", account.user_id);

          if (downgradeError) throw downgradeError;
          console.log(
            `📉 Downgraded account schema authorization successfully for user: ${account.user_id}`,
          );
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(
      "🛑 Webhook execution pipeline threw fatal error context:",
      error.message,
    );
    return new Response(
      JSON.stringify({ error: `Webhook error handler: ${error.message}` }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
