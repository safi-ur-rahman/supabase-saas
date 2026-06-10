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
    try {
      const cookieStore = await cookies();
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch (err: any) {
                console.warn("⚠️ cookieStore.set dropped inside Server Component context:", err.message);
              }
            },
          },
        }
      );

      console.log("🔄 Exchanging code token for active JWT session storage...");
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("🛑 Supabase Session Exchange Error:", error.message);
        throw error;
      }

      console.log(`🚀 Authentication success! Forwarding client to: ${requestUrl.origin}${next}`);
      return NextResponse.redirect(`${requestUrl.origin}${next}`);

    } catch (catchErr: any) {
      console.error("💥 Fatal runtime crash inside Callback Handler execution pipeline:", catchErr.message);
      return NextResponse.redirect(`${requestUrl.origin}/auth/auth-error?msg=${encodeURIComponent(catchErr.message)}`);
    }
  }

  console.warn("⚠️ No authorization code vector found in parameters, defaulting back to home landing page.");
  return NextResponse.redirect(`${requestUrl.origin}/`);
}