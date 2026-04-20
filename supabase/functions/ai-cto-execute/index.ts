// Executes an approved AI CTO sprint decision: creates sprint + tasks rows.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { decision_id } = await req.json();
    if (!decision_id) return json({ error: "decision_id required" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Super admin only" }, 403);

    const { data: decision, error: dErr } = await admin
      .from("ai_company_decisions")
      .select("*")
      .eq("id", decision_id)
      .maybeSingle();
    if (dErr || !decision) return json({ error: "Decision not found" }, 404);
    if (decision.decision_type !== "create_sprint")
      return json({ error: "Wrong decision type" }, 400);

    const plan = decision.payload as any;
    const start = new Date();
    const end = new Date(Date.now() + 14 * 86400000);

    const { data: sprint, error: sErr } = await admin
      .from("ai_engineering_sprints")
      .insert({
        name: plan.sprint_name,
        goal: plan.sprint_goal,
        start_date: start.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
        velocity_target: plan.velocity_target ?? null,
        status: "active",
      })
      .select()
      .single();
    if (sErr) return json({ error: sErr.message }, 500);

    const taskRows = (plan.tasks ?? []).map((t: any) => ({
      sprint_id: sprint.id,
      title: t.title,
      description: t.description ?? null,
      task_type: t.task_type,
      priority: t.priority ?? 3,
      estimated_hours: t.estimated_hours ?? null,
      status: "todo",
    }));

    if (taskRows.length) {
      const { error: tErr } = await admin.from("ai_engineering_tasks").insert(taskRows);
      if (tErr) return json({ error: tErr.message }, 500);
    }

    await admin
      .from("ai_company_decisions")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        executed_at: new Date().toISOString(),
      })
      .eq("id", decision_id);

    return json({ sprint, tasks_created: taskRows.length });
  } catch (e) {
    console.error("ai-cto-execute error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
