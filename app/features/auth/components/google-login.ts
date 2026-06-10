import { supabase } from "../utils/supabase";

export async function handleGoogleLogin() {
  try {
    // Dynamically identify our hosting origin so it works flawlessly across localhost and production URLs
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Points directly to the Next.js server route handler we will create in Step 5
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error("Failed to initiate secure redirect to Google authorization server:", (error as Error).message);
    alert(`Authentication handshake error: ${(error as Error).message}`);
  }
}