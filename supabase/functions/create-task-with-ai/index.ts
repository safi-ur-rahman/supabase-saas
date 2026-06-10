import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

// Load environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();

    console.log("🔄 Initializing AI task orchestration payload context...");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing client verification credential header");
    }

    // Initialize Supabase Client with service role to securely bypass read locks
    const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Extract user profile context securely from JWT token
    const token = authHeader.split(" ")[1] ?? "";
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error(`Authentication context failed: ${authError?.message ?? "Empty user payload"}`);
    }

    // 1. Structural Optimizations Check: Try to insert the basic layout details first
    // This catches your DB's check_task_limit() trigger BEFORE executing the OpenAI network trip.
    console.log(`⚡ Verifying subscription quota boundary for user: ${user.id}`);
    const { data: baseTask, error: dbInsertError } = await supabaseServer
      .from("tasks")
      .insert({
        title,
        description,
        completed: false,
        user_id: user.id,
        label: null, // Initial empty placeholder state
      })
      .select()
      .single();

    if (dbInsertError) {
      // If our database trigger threw the custom 'limit reached' exception, pass it clean to front-end
      console.warn("❌ Creation aborted by database gatekeeper:", dbInsertError.message);
      throw dbInsertError;
    }

    // 2. Initialize LLM Processing since quota confirmation passed cleanly
    console.log("🤖 Querying OpenAI categorization engine...");
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    const prompt = `Based on this task title: "${title}" and description: "${description}", suggest ONE of these labels: work, personal, priority, shopping, home. Reply with just the label word and nothing else.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      temperature: 0.1, // Dropped to 0.1 for high determinism matching the selection array
      max_tokens: 12,
    });

    const suggestedLabel = completion.choices[0].message.content
      ?.toLowerCase()
      .trim() ?? "";

    console.log(`✨ OpenAI suggested parsing metric: [${suggestedLabel}]`);

    // Validate if LLM structured the response array constraints accurately
    const validLabels = ["work", "personal", "priority", "shopping", "home"];
    const targetLabel = validLabels.includes(suggestedLabel) ? suggestedLabel : null;

    // 3. Patch the generated analytical data tag onto our record row placeholder
    if (targetLabel) {
      const { data: updatedTask, error: patchError } = await supabaseServer
        .from("tasks")
        .update({ label: targetLabel })
        .eq("task_id", baseTask.task_id)
        .select()
        .single();

      if (!patchError && updatedTask) {
        return new Response(JSON.stringify(updatedTask), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback response matrix if AI categorization values fail array evaluation validation
    return new Response(JSON.stringify(baseTask), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Exception handled inside Edge Function core block:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});