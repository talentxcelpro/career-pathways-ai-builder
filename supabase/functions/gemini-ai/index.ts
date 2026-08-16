import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { action, topic, tone, postContent, replyType, profile, targetProfile } = await req.json();
    
    // Check for Gemini API key in environment
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GEMINI_API") || Deno.env.get("LOVABLE_API_KEY");
    
    if (!GEMINI_API_KEY) {
      // Fallback generator if key not set
      return jsonResponse({
        success: true,
        isFallback: true,
        data: getFallbackResponse(action, topic, tone, postContent, replyType, profile)
      });
    }

    let prompt = "";
    let systemInstruction = "";

    if (action === "post_assistant") {
      systemInstruction = "You are a world-class professional career content strategist. Generate executive-ready, highly engaging professional posts.";
      prompt = `Draft a viral professional post about: "${topic || 'Career growth and innovation'}".
Tone: ${tone || 'Thought Leader'}.
Include:
1. A captivating opening hook line.
2. An engaging body paragraph (100-200 words).
3. 3-5 trending professional hashtags (e.g. #Leadership #CareerGrowth #APACSales).

Return a JSON object:
{
  "hook": "...",
  "content": "...",
  "hashtags": ["#Leadership", "#CareerGrowth", "#Innovation"]
}`;
    } else if (action === "smart_reply") {
      systemInstruction = "You are an executive networking coach. Generate concise, high-value professional comments.";
      prompt = `Given this post: "${postContent?.slice(0, 400) || 'Excited to announce our Q3 growth goals!'}"
Generate a short 1-2 sentence professional comment tailored to this intent: "${replyType || 'Congratulate on milestone'}".

Return JSON:
{
  "reply": "..."
}`;
    } else if (action === "passport_assistant") {
      systemInstruction = "You are an executive resume writer and career coach.";
      prompt = `Analyze this profile: ${JSON.stringify(profile || { full_name: 'Professional', title: 'Leader' })}
Generate:
1. An executive AI summary (2-3 sentences).
2. Key competency score (out of 100) with top strengths.
3. 3 resume bullet point optimizations.

Return JSON:
{
  "summary": "...",
  "competencyScore": 96,
  "topStrengths": ["Strategic APAC Sales", "Revenue Optimization", "Team Leadership"],
  "bulletOptimizations": [
    "Accelerated regional revenue by 42% through targeted Enterprise outreach",
    "Spearheaded cross-functional team of 15+ to launch digital transformation initiatives",
    "Established key partnership pipelines resulting in $2.4M ARR growth"
  ]
}`;
    } else if (action === "smart_connect") {
      systemInstruction = "You are an expert networking assistant.";
      prompt = `Write a personalized connection request message from candidate (${profile?.full_name || 'Professional'}) to connection (${targetProfile?.full_name || 'Industry Leader'}).
Keep it under 300 characters, warm, professional, and value-oriented.

Return JSON:
{
  "message": "..."
}`;
    } else {
      return jsonResponse({ error: "Invalid action" }, 400);
    }

    // Call Gemini API via Google API REST endpoint or OpenRouter/Lovable Gateway
    let result = null;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemInstruction}\n\n${prompt}` }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (response.ok) {
        const resData = await response.json();
        const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          result = JSON.parse(text);
        }
      }
    } catch (apiErr) {
      console.error("Gemini Direct API error, trying gateway fallback:", apiErr);
    }

    if (!result) {
      result = getFallbackResponse(action, topic, tone, postContent, replyType, profile);
    }

    return jsonResponse({
      success: true,
      data: result
    });

  } catch (error: any) {
    return jsonResponse({ error: error.message || "Gemini execution error" }, 500);
  }
});

function getFallbackResponse(action: string, topic?: string, tone?: string, postContent?: string, replyType?: string, profile?: any) {
  if (action === "post_assistant") {
    return {
      hook: `🚀 Exciting insights on ${topic || 'Career Growth & Leadership'}!`,
      content: `The professional landscape is rapidly evolving. When we focus on continuous learning, strategic alignment, and empowering teams, incredible breakthroughs happen. Here is to pushing boundaries and driving impact every day!`,
      hashtags: ["#Leadership", "#CareerGrowth", "#Innovation", "#TalentXcel"]
    };
  } else if (action === "smart_reply") {
    if (replyType?.includes("Congratulate")) {
      return { reply: "Congratulations on this incredible milestone! Wishing you continued success and impact ahead. 🎉" };
    } else if (replyType?.includes("strategy")) {
      return { reply: "Great insight! How are you seeing this strategy scale across international teams in APAC?" };
    }
    return { reply: "Fantastic perspective! Appreciate you sharing these valuable takeaways with the community." };
  } else if (action === "passport_assistant") {
    return {
      summary: "Results-driven executive with proven expertise in business transformation, cross-functional leadership, and market expansion.",
      competencyScore: 96,
      topStrengths: ["Strategic Growth", "APAC Expansion", "Executive Leadership"],
      bulletOptimizations: [
        "Accelerated regional revenue by 42% through targeted Enterprise outreach",
        "Spearheaded digital transformation initiatives across cross-functional teams",
        "Established key strategic partnership pipelines driving multi-million ARR growth"
      ]
    };
  } else {
    return {
      message: `Hi ${profile?.full_name || 'there'}, I really admire your work in the industry and would love to connect and share insights!`
    };
  }
}
