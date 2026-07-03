// AI Career Coach — analyzes verified passport data and returns roadmap.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goal, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI not configured" }, 500);

    const context = {
      goal: (goal ?? "").toString().slice(0, 500),
      profile: profile?.profile ?? null,
      education: (profile?.education ?? []).slice(0, 10),
      experience: (profile?.experience ?? []).slice(0, 15),
      skills: (profile?.skills ?? []).slice(0, 40),
      certificates: (profile?.certificates ?? []).slice(0, 20),
    };

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
              "You are a senior AI career coach. Analyze a candidate's verified career passport (education, experience, skills, certificates) plus their stated goal, and return a personalized plan. Be specific, realistic, and concise. Prioritize truly missing skills based on their target.",
          },
          {
            role: "user",
            content: `CANDIDATE CONTEXT (JSON):\n${JSON.stringify(context)}\n\nReturn a structured coaching plan.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "career_plan",
              description: "Personalized career coaching plan.",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  strengths: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
                  missing_skills: {
                    type: "array",
                    minItems: 2,
                    maxItems: 8,
                    items: {
                      type: "object",
                      properties: {
                        skill: { type: "string" },
                        why: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["skill", "why", "priority"],
                      additionalProperties: false,
                    },
                  },
                  roadmap: {
                    type: "array",
                    minItems: 3,
                    maxItems: 5,
                    items: {
                      type: "object",
                      properties: {
                        horizon: { type: "string", description: "e.g. 0-3 months" },
                        goal: { type: "string" },
                        actions: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
                      },
                      required: ["horizon", "goal", "actions"],
                      additionalProperties: false,
                    },
                  },
                  target_roles: { type: "array", items: { type: "string" }, maxItems: 5 },
                },
                required: ["summary", "strengths", "missing_skills", "roadmap"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "career_plan" } },
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
      return json({ error: "No plan returned." }, 500);
    }
    const plan = JSON.parse(toolCall.function.arguments);
    return json(plan);
  } catch (e) {
    console.error("passport-ai-coach error:", e);
    return json({ error: (e as Error).message ?? "Unknown error" }, 500);
  }
});
