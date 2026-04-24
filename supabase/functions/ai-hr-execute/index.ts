// AI Head of HR: on CEO approval, apply screening decisions to candidates.
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

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
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
      .single();
    if (dErr || !decision) return json({ error: "Decision not found" }, 404);
    if (decision.status !== "pending") {
      return json({ error: `Decision already ${decision.status}` }, 400);
    }
    if (decision.decision_type !== "screen_candidates") {
      return json({ error: "Wrong decision type for HR executor" }, 400);
    }

    const payload = decision.payload as any;
    const shortlist: any[] = payload?.screening?.shortlist ?? [];
    let updated = 0;
    const failures: string[] = [];

    for (const item of shortlist) {
      const stage = item.action === "reject" ? "rejected" : item.next_stage ?? "screening";
      const { error: upErr } = await admin
        .from("ai_hr_candidates")
        .update({
          stage,
          ai_score: item.score ?? null,
          notes:
            `[AI HR ${new Date().toISOString()}] ${item.action.toUpperCase()} → ${stage}\n` +
            `Score: ${item.score}\nReason: ${item.reasoning ?? ""}`,
        })
        .eq("id", item.candidate_id);
      if (upErr) {
        console.warn("Candidate update failed:", item.candidate_id, upErr.message);
        failures.push(item.candidate_id);
      } else {
        updated += 1;
      }
    }

    const { error: updErr } = await admin
      .from("ai_company_decisions")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        executed_at: new Date().toISOString(),
      })
      .eq("id", decision_id);
    if (updErr) {
      console.error("Decision update failed:", updErr);
      return json({ error: updErr.message }, 500);
    }

    return json({ ok: true, updated, failed: failures.length, failures });
  } catch (e) {
    console.error("ai-hr-execute error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
