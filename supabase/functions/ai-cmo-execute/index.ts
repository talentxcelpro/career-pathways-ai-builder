// AI CMO: on CEO approval, persist the campaign and its content calendar.
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
    if (decision.decision_type !== "launch_campaign") {
      return json({ error: "Wrong decision type for marketing executor" }, 400);
    }

    const plan = decision.payload as any;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(plan.duration_days ?? 14));

    const { data: campaign, error: cErr } = await admin
      .from("ai_marketing_campaigns")
      .insert({
        name: plan.campaign_name,
        channel: plan.channel ?? "mixed",
        objective: plan.objective,
        budget: plan.budget_usd ?? 0,
        spent: 0,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "active",
        metrics: {
          kpi_targets: plan.kpi_targets ?? {},
          positioning: plan.positioning ?? null,
        },
      })
      .select()
      .single();

    if (cErr) {
      console.error("Campaign insert failed:", cErr);
      return json({ error: cErr.message }, 500);
    }

    // Persist calendar items if the company_content_calendar table exists & accepts them.
    const calendar: any[] = Array.isArray(plan.calendar) ? plan.calendar : [];
    let calendarInserted = 0;
    if (calendar.length > 0) {
      const rows = calendar.map((item) => {
        const scheduled = new Date(startDate);
        scheduled.setDate(scheduled.getDate() + Number(item.day_offset ?? 0));
        return {
          content_type: item.content_type ?? "post",
          title: item.title ?? "Untitled",
          description: item.body ?? null,
          scheduled_date: scheduled.toISOString(),
          status: "scheduled",
          created_by: user.id,
          content_data: { cta: item.cta, channel: item.channel, campaign_id: campaign.id },
        };
      });
      const { error: calErr, count } = await admin
        .from("company_content_calendar")
        .insert(rows, { count: "exact" });
      if (calErr) {
        console.warn("Calendar insert skipped:", calErr.message);
      } else {
        calendarInserted = count ?? rows.length;
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

    return json({ ok: true, campaign, calendar_items: calendarInserted });
  } catch (e) {
    console.error("ai-cmo-execute error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
