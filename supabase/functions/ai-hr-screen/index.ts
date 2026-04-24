// AI Head of HR: screens existing candidates against a role brief and queues a hiring decision.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { role, brief, must_haves, nice_to_haves } = await req.json();

    if (!role || typeof role !== "string" || role.trim().length < 2) {
      return json({ error: "Role title is required (min 2 chars)." }, 400);
    }
    if (!brief || typeof brief !== "string" || brief.trim().length < 10) {
      return json({ error: "Provide a role brief (min 10 chars)." }, 400);
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

    // Pull in the active candidate pool. Limit to a manageable batch for the model.
    const { data: candidates, error: cErr } = await admin
      .from("ai_hr_candidates")
      .select("id, full_name, email, role, stage, ai_score, notes")
      .in("stage", ["new", "applied", "screening", "interview"])
      .order("created_at", { ascending: false })
      .limit(25);
    if (cErr) {
      console.error("Candidate fetch failed:", cErr);
      return json({ error: cErr.message }, 500);
    }
    if (!candidates || candidates.length === 0) {
      return json({ error: "No candidates available to screen." }, 400);
    }

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
              "You are the AI Head of HR for TalentXcel. Given a role brief and a " +
              "candidate pool, score each candidate 0-100 on fit, recommend an action " +
              "(advance or reject), and explain your reasoning briefly. Be honest, " +
              "not optimistic — a low score is more useful than a generous one.",
          },
          {
            role: "user",
            content:
              `Role: ${role}\n` +
              `Must-haves: ${must_haves ?? "n/a"}\n` +
              `Nice-to-haves: ${nice_to_haves ?? "n/a"}\n` +
              `Brief: ${brief}\n\n` +
              `Candidates:\n${JSON.stringify(candidates, null, 2)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "screen_candidates",
              description: "Score candidates and recommend advance/reject actions.",
              parameters: {
                type: "object",
                properties: {
                  shortlist: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      properties: {
                        candidate_id: { type: "string" },
                        full_name: { type: "string" },
                        score: { type: "number", minimum: 0, maximum: 100 },
                        action: { type: "string", enum: ["advance", "reject"] },
                        next_stage: {
                          type: "string",
                          enum: ["screening", "interview", "offer", "rejected"],
                        },
                        reasoning: { type: "string" },
                      },
                      required: ["candidate_id", "score", "action", "next_stage", "reasoning"],
                      additionalProperties: false,
                    },
                  },
                  summary: { type: "string" },
                  confidence: { type: "number", minimum: 0, maximum: 100 },
                },
                required: ["shortlist", "summary", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "screen_candidates" } },
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
      return json({ error: "AI did not return a screening." }, 500);
    }
    const screening = JSON.parse(toolCall.function.arguments);

    const advancing = screening.shortlist.filter((s: any) => s.action === "advance").length;
    const rejecting = screening.shortlist.length - advancing;

    const { data: decision, error: decErr } = await admin
      .from("ai_company_decisions")
      .insert({
        department: "hr",
        decision_type: "screen_candidates",
        title: `Screening for ${role}: advance ${advancing}, reject ${rejecting}`,
        summary: screening.summary,
        payload: { role, brief, must_haves, nice_to_haves, screening },
        priority: 3,
        confidence_score: screening.confidence ?? 70,
        requires_approval: true,
        status: "pending",
        created_by_agent: "ai_head_of_hr",
      })
      .select()
      .single();

    if (decErr) {
      console.error("Decision insert failed:", decErr);
      return json({ error: decErr.message }, 500);
    }

    return json({ decision, screening });
  } catch (e) {
    console.error("ai-hr-screen error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
