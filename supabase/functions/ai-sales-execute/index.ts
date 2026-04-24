// AI Head of Sales: on CEO approval, persist the lead with the drafted outreach.
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
    if (decision.decision_type !== "send_outreach") {
      return json({ error: "Wrong decision type for sales executor" }, 400);
    }

    const payload = decision.payload as any;
    const lead = payload?.lead ?? {};
    const draft = payload?.draft ?? {};

    const nextActionAt = new Date();
    nextActionAt.setDate(
      nextActionAt.getDate() + Number(draft.next_action_in_days ?? 3),
    );

    const { data: leadRow, error: leadErr } = await admin
      .from("ai_sales_leads")
      .insert({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        source: lead.source ?? "ai_outreach",
        stage: draft.stage ?? "contacted",
        score: draft.score ?? null,
        deal_value: draft.estimated_deal_value_usd ?? null,
        currency: "USD",
        next_action_at: nextActionAt.toISOString(),
        notes:
          `Subject: ${draft.email_subject ?? ""}\n\n` +
          `${draft.email_body ?? ""}\n\n` +
          `--\nDrafted by AI Head of Sales. Approved by CEO ${new Date().toISOString()}.`,
      })
      .select()
      .single();

    if (leadErr) {
      console.error("Lead insert failed:", leadErr);
      return json({ error: leadErr.message }, 500);
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

    return json({ ok: true, lead: leadRow });
  } catch (e) {
    console.error("ai-sales-execute error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
