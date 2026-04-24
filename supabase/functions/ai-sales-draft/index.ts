// AI Head of Sales: drafts personalized outreach for a lead, queued as a decision.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { name, company, email, source, brief } = body ?? {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return json({ error: "Lead name is required (min 2 chars)." }, 400);
    }
    if (!brief || typeof brief !== "string" || brief.trim().length < 10) {
      return json({ error: "Provide a short brief about the lead (min 10 chars)." }, 400);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not set" }, 500);

    // Verify caller is super_admin
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

    // Ask Lovable AI to qualify the lead and draft outreach
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
              "You are the AI Head of Sales for TalentXcel, an AI-powered talent platform. " +
              "Given a lead, qualify them, estimate deal value in USD, score them 0-100, " +
              "and draft a concise, personalized cold email (under 120 words, no fluff, " +
              "one clear CTA). Pick the most likely pipeline stage to start in.",
          },
          {
            role: "user",
            content:
              `Lead: ${name}\n` +
              `Company: ${company ?? "unknown"}\n` +
              `Email: ${email ?? "unknown"}\n` +
              `Source: ${source ?? "unknown"}\n` +
              `Brief: ${brief}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "propose_outreach",
              description: "Qualify the lead and draft outreach for CEO approval.",
              parameters: {
                type: "object",
                properties: {
                  stage: {
                    type: "string",
                    enum: ["new", "qualified", "contacted", "demo", "negotiation", "won", "lost"],
                  },
                  score: { type: "number", minimum: 0, maximum: 100 },
                  estimated_deal_value_usd: { type: "number", minimum: 0 },
                  next_action_in_days: { type: "number", minimum: 0, maximum: 30 },
                  reasoning: { type: "string" },
                  email_subject: { type: "string" },
                  email_body: { type: "string" },
                  confidence: { type: "number", minimum: 0, maximum: 100 },
                },
                required: [
                  "stage",
                  "score",
                  "estimated_deal_value_usd",
                  "next_action_in_days",
                  "email_subject",
                  "email_body",
                  "confidence",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "propose_outreach" } },
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
      return json({ error: "AI did not return a draft." }, 500);
    }
    const draft = JSON.parse(toolCall.function.arguments);

    const payload = {
      lead: { name, company: company ?? null, email: email ?? null, source: source ?? null, brief },
      draft,
    };

    const { data: decision, error: decErr } = await admin
      .from("ai_company_decisions")
      .insert({
        department: "sales",
        decision_type: "send_outreach",
        title: `Outreach: ${name}${company ? ` @ ${company}` : ""}`,
        summary: draft.email_subject,
        payload,
        priority: 3,
        confidence_score: draft.confidence ?? 70,
        requires_approval: true,
        status: "pending",
        created_by_agent: "ai_head_of_sales",
      })
      .select()
      .single();

    if (decErr) {
      console.error("Decision insert failed:", decErr);
      return json({ error: decErr.message }, 500);
    }

    return json({ decision, draft });
  } catch (e) {
    console.error("ai-sales-draft error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
