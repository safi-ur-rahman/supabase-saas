import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Subscription, UserProfile } from "../types/account.types";

export async function getAccountData(): Promise<{ user: UserProfile; subscription: Subscription } | null> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // 1. Get core session parameters
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  // 2. Fetch profile layout parameters matching our master signup trigger
  const { data: accountRow } = await supabase
    .from("accounts")
    .select("name")
    .eq("user_id", user.id)
    .single();

  // 3. ✨ FIXED: Only select columns that actually exist in your database schema
  const { data: subRow } = await supabase
    .from("account_subscriptions")
    .select("subscription_id, plan, status, created_at, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  // Determine current active status flags safely
  const currentPlan = subRow?.plan?.toLowerCase() ?? "free";
  const isPremium = currentPlan === "premium" && subRow?.status === "active";

  // 4. Format Postgres database values into your strictly typed TypeScript interfaces
  return {
    user: {
      id: user.id,
      name: accountRow?.name ?? "Google Workspace User",
      email: user.email ?? "",
    },
    subscription: {
      // ✨ FIXED: Maps subscription_id cleanly to avoid missing column crashes
      id: subRow?.subscription_id ?? "free_tier",
      userId: user.id,
      
      // ✨ FIXED: Check matching cases exactly ("Premium" vs "Free")
      plan: isPremium ? "Premium" : "Free",
      
      // ✨ HARDCODED DEFAULT METRICS: Handled dynamically by plan type since they aren't stored in this table
      tasksCreated: 0, 
      tasksLimit: isPremium ? 1000 : 100, 
      
      renewalDate: undefined, 
      
      createdAt: subRow?.created_at ?? new Date().toISOString(),
      updatedAt: subRow?.updated_at ?? new Date().toISOString(),
    },
  };
}