// AI CTO: turns a one-line goal into a sprint plan + tasks, queued as a decision.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goal } = await req.json();
    if (!goal || typeof goal !== "string" || goal.trim().length < 4) {
      return json({ error: "Provide a goal (min 4 chars)." }, 400);
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

    // Ask Lovable AI for a structured sprint plan via tool calling
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
              "You are the AI CTO of a SaaS company. Given a one-line product goal, " +
              "produce a focused 2-week sprint with 4-8 concrete engineering tasks. " +
              "Tasks must be small, shippable, and ordered by dependency.",
          },
          { role: "user", content: `Goal: ${goal}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "propose_sprint",
              description: "Propose a sprint with tasks for the engineering team.",
              parameters: {
                type: "object",
                properties: {
                  sprint_name: { type: "string" },
                  sprint_goal: { type: "string" },
                  velocity_target: { type: "number" },
                  confidence: { type: "number", minimum: 0, maximum: 100 },
                  tasks: {
                    type: "array",
                    minItems: 3,
                    maxItems: 10,
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        task_type: {
                          type: "string",
                          enum: ["feature", "bug", "infra", "research", "docs"],
                        },
                        priority: { type: "number", minimum: 1, maximum: 5 },
                        estimated_hours: { type: "number" },
                      },
                      required: ["title", "task_type", "priority", "estimated_hours"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["sprint_name", "sprint_goal", "tasks", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "propose_sprint" } },
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

    // Queue a decision for CEO approval
    const { data: decision, error: decErr } = await admin
      .from("ai_company_decisions")
      .insert({
        department: "engineering",
        decision_type: "create_sprint",
        title: `Sprint plan: ${plan.sprint_name}`,
        summary: plan.sprint_goal,
        payload: plan,
        priority: 2,
        confidence_score: plan.confidence ?? 70,
        requires_approval: true,
        status: "pending",
        created_by_agent: "ai_cto",
      })
      .select()
      .single();

    if (decErr) {
      console.error("Decision insert failed:", decErr);
      return json({ error: decErr.message }, 500);
    }

    return json({ decision, plan });
  } catch (e) {
    console.error("ai-cto-plan error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
