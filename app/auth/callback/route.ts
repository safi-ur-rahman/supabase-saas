import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  console.log("🔗 Auth Callback Route Hit!");
  console.log(`🎫 Code Present: ${!!code}`);

  if (code) {
    const cookieStore = await cookies();

    // Create an initial response object pointing to the dashboard target
    const response = NextResponse.redirect(`${requestUrl.origin}${next}`);

    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              // Write the tokens to the current request context
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
              // ✨ CRITICAL: Sync cookies to the outgoing response headers so the browser saves them!
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options),
              );
            },
          },
        },
      );

      console.log("🔄 Exchanging code token for active JWT session storage...");
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("🛑 Supabase Session Exchange Error:", error.message);
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/auth-error?msg=${encodeURIComponent(error.message)}`,
        );
      }

      console.log(
        `🚀 Authentication success! Forwarding client to: ${requestUrl.origin}${next}`,
      );
      return response;
    } catch (catchErr: any) {
      console.error(
        "💥 Fatal runtime crash inside Callback Handler:",
        catchErr.message,
      );
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/auth-error?msg=${encodeURIComponent(catchErr.message)}`,
      );
    }
  }

  console.warn("⚠️ No authorization code vector found in parameters.");
  return NextResponse.redirect(`${requestUrl.origin}/`);
}
