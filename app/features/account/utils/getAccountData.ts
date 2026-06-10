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

  // 3. Fetch live usage limits and payment schedules via your local subscription views
  const { data: subRow } = await supabase
    .from("account_subscriptions")
    .select("id, plan, tasks_created, tasks_limit, renewal_date, created_at, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  // 4. Format Postgres database values into your strictly typed TypeScript interfaces
  return {
    user: {
      id: user.id,
      name: accountRow?.name ?? "Google Workspace User",
      email: user.email ?? "",
    },
    subscription: {
      id: subRow?.id ?? "free_tier",
      userId: user.id,
      // Map database text safely to your strict "Free" | "Premium" type literals
      plan: subRow?.plan === "premium" ? "Premium" : "Free",
      tasksCreated: subRow?.tasks_created ?? 0,
      tasksLimit: subRow?.tasks_limit ?? 10, // Default base restriction ceiling
      renewalDate: subRow?.renewal_date ? new Date(subRow.renewal_date).toLocaleDateString() : undefined,
      createdAt: subRow?.created_at ?? new Date().toISOString(),
      updatedAt: subRow?.updated_at ?? new Date().toISOString(),
    },
  };
}