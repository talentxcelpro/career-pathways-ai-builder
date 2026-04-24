// AI CMO: drafts a marketing campaign + content calendar from a brief, queued as a decision.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { objective, audience, channel, budget_usd, brief } = await req.json();

    if (!objective || typeof objective !== "string" || objective.trim().length < 4) {
      return json({ error: "Objective is required (min 4 chars)." }, 400);
    }
    if (!brief || typeof brief !== "string" || brief.trim().length < 10) {
      return json({ error: "Provide a campaign brief (min 10 chars)." }, 400);
    }

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
              "You are the AI CMO of TalentXcel, an AI-powered talent platform. " +
              "Given a campaign brief, design a focused 2-week campaign with " +
              "5-8 calendar items across the chosen channel(s). Each item must be " +
              "specific, dated relative to day 1, and have a single clear CTA.",
          },
          {
            role: "user",
            content:
              `Objective: ${objective}\n` +
              `Audience: ${audience ?? "unspecified"}\n` +
              `Primary channel: ${channel ?? "mixed"}\n` +
              `Budget USD: ${budget_usd ?? 0}\n` +
              `Brief: ${brief}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "propose_campaign",
              description: "Propose a marketing campaign with a content calendar.",
              parameters: {
                type: "object",
                properties: {
                  campaign_name: { type: "string" },
                  channel: { type: "string" },
                  objective: { type: "string" },
                  positioning: { type: "string" },
                  budget_usd: { type: "number", minimum: 0 },
                  duration_days: { type: "number", minimum: 3, maximum: 60 },
                  kpi_targets: {
                    type: "object",
                    properties: {
                      reach: { type: "number" },
                      clicks: { type: "number" },
                      signups: { type: "number" },
                    },
                    additionalProperties: false,
                  },
                  calendar: {
                    type: "array",
                    minItems: 4,
                    maxItems: 10,
                    items: {
                      type: "object",
                      properties: {
                        day_offset: { type: "number", minimum: 0, maximum: 60 },
                        channel: { type: "string" },
                        content_type: {
                          type: "string",
                          enum: ["post", "ad", "email", "video", "blog", "webinar"],
                        },
                        title: { type: "string" },
                        body: { type: "string" },
                        cta: { type: "string" },
                      },
                      required: ["day_offset", "channel", "content_type", "title", "body", "cta"],
                      additionalProperties: false,
                    },
                  },
                  confidence: { type: "number", minimum: 0, maximum: 100 },
                },
                required: [
                  "campaign_name",
                  "channel",
                  "objective",
                  "duration_days",
                  "calendar",
                  "confidence",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "propose_campaign" } },
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
      return json({ error: "AI did not return a campaign." }, 500);
    }
    const plan = JSON.parse(toolCall.function.arguments);

    const { data: decision, error: decErr } = await admin
      .from("ai_company_decisions")
      .insert({
        department: "marketing",
        decision_type: "launch_campaign",
        title: `Campaign: ${plan.campaign_name}`,
        summary: plan.positioning ?? plan.objective,
        payload: plan,
        priority: 3,
        confidence_score: plan.confidence ?? 70,
        requires_approval: true,
        status: "pending",
        created_by_agent: "ai_cmo",
      })
      .select()
      .single();

    if (decErr) {
      console.error("Decision insert failed:", decErr);
      return json({ error: decErr.message }, 500);
    }

    return json({ decision, plan });
  } catch (e) {
    console.error("ai-cmo-plan error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
