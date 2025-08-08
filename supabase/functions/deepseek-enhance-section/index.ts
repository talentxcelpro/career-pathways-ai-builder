import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { section, text, targetRole, atsJson } = await req.json();

    if (!section || typeof text !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
    const apiUrl = Deno.env.get("DEEPSEEK_API_URL") || "https://api.deepseek.com/v1/chat/completions";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing DEEPSEEK_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `Enhance this resume SECTION for ATS compatibility while preserving facts.\nSection: ${section}\nTarget role: ${targetRole || "general"}\nATS JSON: ${JSON.stringify(atsJson ?? {})}\nText:\n${text}\nReturn ONLY the enhanced text (no extra commentary).`;

    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You enhance resume sections for ATS without inventing facts." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 800,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("DeepSeek API error:", txt);
      return new Response(
        JSON.stringify({ success: false, error: "DeepSeek API request failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    // Try common shapes
    const enhancedText =
      data?.choices?.[0]?.message?.content?.trim?.() ??
      data?.result?.trim?.() ??
      text;

    return new Response(
      JSON.stringify({ success: true, enhancedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("deepseek-enhance-section failed:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
