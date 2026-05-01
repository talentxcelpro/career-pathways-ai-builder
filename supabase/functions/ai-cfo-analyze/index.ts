// AI CFO: scans finance entries for runway/burn and proposes spend cuts or budget reallocations.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { focus, cash_on_hand } = await req.json().catch(() => ({}));

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not set" }, 500);

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

    // Pull last 90 days of finance entries.
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const { data: entries, error: eErr } = await admin
      .from("ai_finance_entries")
      .select("id, entry_date, entry_type, category, department, amount, currency, description")
      .gte("entry_date", since.toISOString().slice(0, 10))
      .order("entry_date", { ascending: false })
      .limit(500);
    if (eErr) {
      console.error("Finance fetch failed:", eErr);
      return json({ error: eErr.message }, 500);
    }
    if (!entries || entries.length === 0) {
      return json({ error: "No finance entries in the last 90 days." }, 400);
    }

    // Quick aggregates to anchor the model.
    let revenue = 0;
    let expense = 0;
    const byDept: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    for (const e of entries) {
      const amt = Number(e.amount ?? 0);
      if (e.entry_type === "revenue") revenue += amt;
      else if (e.entry_type === "expense") {
        expense += amt;
        if (e.department) byDept[e.department] = (byDept[e.department] ?? 0) + amt;
        if (e.category) byCategory[e.category] = (byCategory[e.category] ?? 0) + amt;
      }
    }
    const monthlyBurn = Math.max(0, (expense - revenue) / 3);
    const runwayMonths = cash_on_hand && monthlyBurn > 0
      ? Number(cash_on_hand) / monthlyBurn
      : null;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are the AI CFO for TalentXcel. Analyze 90 days of revenue and expense " +
              "data, identify burn/runway risk, and propose 2-5 concrete budget actions " +
              "(cuts, reallocations, freezes). Be conservative — preserve revenue-generating " +
              "spend, target waste first.",
          },
          {
            role: "user",
            content:
              `Focus: ${focus ?? "general runway optimization"}\n` +
              `Cash on hand: ${cash_on_hand ?? "unknown"}\n` +
              `Last 90 days revenue: ${revenue}\n` +
              `Last 90 days expense: ${expense}\n` +
              `Estimated monthly burn: ${monthlyBurn.toFixed(2)}\n` +
              `Estimated runway (months): ${runwayMonths?.toFixed(1) ?? "n/a"}\n` +
              `Spend by department: ${JSON.stringify(byDept)}\n` +
              `Spend by category: ${JSON.stringify(byCategory)}\n\n` +
              `Recent entries (sample):\n${JSON.stringify(entries.slice(0, 60), null, 2)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "propose_budget_actions",
              description: "Propose budget cuts and reallocations to extend runway.",
              parameters: {
                type: "object",
                properties: {
                  health: {
                    type: "string",
                    enum: ["healthy", "watch", "at_risk", "critical"],
                  },
                  monthly_burn: { type: "number" },
                  runway_months: { type: "number" },
                  actions: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      properties: {
                        kind: {
                          type: "string",
                          enum: ["cut", "reallocate", "freeze", "increase"],
                        },
                        department: { type: "string" },
                        category: { type: "string" },
                        amount: { type: "number" },
                        currency: { type: "string" },
                        rationale: { type: "string" },
                      },
                      required: ["kind", "department", "amount", "rationale"],
                      additionalProperties: false,
                    },
                  },
                  summary: { type: "string" },
                  confidence: { type: "number", minimum: 0, maximum: 100 },
                },
                required: ["health", "actions", "summary", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "propose_budget_actions" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) return json({ error: "AI rate limit. Try again shortly." }, 429);
      if (aiResp.status === 402) return json({ error: "AI credits exhausted." }, 402);
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return json({ error: "AI did not return a plan." }, 500);
    }
    const plan = JSON.parse(toolCall.function.arguments);

    const totalImpact = plan.actions.reduce(
      (sum: number, a: any) =>
        sum + (a.kind === "increase" ? -Number(a.amount ?? 0) : Number(a.amount ?? 0)),
      0,
    );

    const { data: decision, error: decErr } = await admin
      .from("ai_company_decisions")
      .insert({
        department: "finance",
        decision_type: "apply_budget_actions",
        title: `${plan.health.toUpperCase()} • ${plan.actions.length} budget action(s), net save ${totalImpact.toFixed(0)}`,
        summary: plan.summary,
        payload: {
          focus,
          cash_on_hand,
          aggregates: { revenue, expense, monthlyBurn, runwayMonths, byDept, byCategory },
          plan,
        },
        priority: plan.health === "critical" ? 1 : plan.health === "at_risk" ? 2 : 3,
        confidence_score: plan.confidence ?? 70,
        requires_approval: true,
        status: "pending",
        created_by_agent: "ai_cfo",
      })
      .select()
      .single();

    if (decErr) {
      console.error("Decision insert failed:", decErr);
      return json({ error: decErr.message }, 500);
    }

    return json({ decision, plan });
  } catch (e) {
    console.error("ai-cfo-analyze error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
