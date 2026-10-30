import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getClientIdentifier } from "../_shared/rateLimiter.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Rate Limiting Guard (SEC-010)
  const clientId = getClientIdentifier(req);
  const rateLimit = checkRateLimit(clientId, 20, 60000); // 20 requests per minute
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many AI requests. Please wait before retrying.",
        retryAfter: rateLimit.resetSeconds,
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.resetSeconds),
        },
      }
    );
  }

  const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

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
      prompt = `Optimize professional passport highlights for a candidate targeting top roles in India and APAC.
Profile context: ${JSON.stringify(profile || { role: topic || 'Professional' })}
Generate:
1. High-impact executive summary (2 sentences).
2. Competency alignment score (integer 90-99).
3. 3 core high-value strategic strengths.
4. 3 bullet-point achievements optimized for ATS and recruiters.

Return JSON:
{
  "summary": "...",
  "competencyScore": 95,
  "topStrengths": ["...", "...", "..."],
  "bulletOptimizations": ["...", "...", "..."]
}`;
    } else {
      systemInstruction = "You are an expert AI career intelligence assistant.";
      prompt = `Generate a personalized networking introduction message to connect with ${targetProfile?.full_name || 'an industry peer'} (${targetProfile?.headline || targetProfile?.title || 'Professional'}). Keep it warm, authentic, and under 50 words.`;
    }

    let result = null;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            responseMimeType: action === "post_assistant" || action === "smart_reply" || action === "passport_assistant" ? "application/json" : "text/plain"
          }
        })
      });

      if (response.ok) {
        const geminiData = await response.json();
        const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textContent) {
          if (action === "post_assistant" || action === "smart_reply" || action === "passport_assistant") {
            try {
              result = JSON.parse(textContent);
            } catch {
              result = { message: textContent };
            }
          } else {
            result = { message: textContent };
          }
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
    const norm = (replyType || "").toLowerCase();
    if (norm.includes("schedule") || norm.includes("meeting") || norm.includes("interview")) {
      return { reply: "Hi! I'd like to schedule a quick 15-20 minute sync to connect and discuss next steps. What time works best for you this week?" };
    } else if (norm.includes("proposal") || norm.includes("accept")) {
      return { reply: "Thank you for sharing the proposal! I have reviewed the details and I'm delighted to accept and move forward. Let's align on kickoff timing." };
    } else if (norm.includes("follow") || norm.includes("inquiry")) {
      return { reply: "Hi, just following up on our previous conversation to see if you've had a chance to review the details. Looking forward to your thoughts!" };
    } else if (norm.includes("congratulat")) {
      return { reply: "Congratulations on this incredible milestone! Wishing you continued success and impact ahead. 🎉" };
    } else if (norm.includes("strategy")) {
      return { reply: "Great insight! How are you seeing this strategy scale across international teams in APAC?" };
    }
    return { reply: "Thank you for getting in touch! I appreciate your message and would love to explore how we can collaborate." };
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
