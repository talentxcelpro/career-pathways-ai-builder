import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

// Inline CORS (avoid shared imports to ensure deployment)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Simple GET health
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ ok: true, function: "ai-agent-admin-trigger", timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = String(body?.action ?? "get_system_health");

    // Use standard env var names
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("ai-agent-admin-trigger invoked", { action });

    if (action === "get_system_health") {
      const data = {
        scheduler: { status: "idle", lastRun: null, queued: 0 },
        worker: { status: "idle", lastRun: null, processed: 0 },
        tasks: { pending: 0, running: 0, completed: 0, failed: 0 },
      };
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "trigger_scheduler") {
      return new Response(
        JSON.stringify({ success: true, message: "Scheduler triggered (stub)", tasksCreated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "trigger_worker") {
      return new Response(
        JSON.stringify({ success: true, message: "Worker triggered (stub)", tasksProcessed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create_test_tasks") {
      return new Response(
        JSON.stringify({ success: true, message: "Created test tasks (stub)", tasksCreated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: false, error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-agent-admin-trigger error", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message ?? String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
