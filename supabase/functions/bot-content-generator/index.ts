import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  // CORS Handling
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Bot Content Generator Request ===");
    console.log("Method:", req.method);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    
    // Request Validation
    if (!req.headers.get("Content-Type")?.includes("application/json")) {
      throw new Error("Invalid content type");
    }

    const requestBody = await req.json();
    console.log("Request Body:", requestBody);
    
    const { botId, prompt, category, contentType } = requestBody;
    if (!botId || !category) {
      throw new Error("Missing required fields: botId and category are required");
    }

    // Check for DeepSeek API key
    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!deepseekApiKey) {
      throw new Error("DeepSeek API key not configured");
    }

    // Create enhanced prompt
    const enhancedPrompt = prompt || `Create a ${contentType || 'post'} about ${category} for professionals on TalentXcel platform. Make it engaging and valuable.`;
    
    console.log("Calling DeepSeek API...");
    
    // Deepseek API Call
    const apiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a professional content creator for TalentXcel, a career development platform. Create engaging, valuable content for professionals."
          },
          {
            role: "user", 
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.text();
      console.error("DeepSeek API Error:", error);
      throw new Error(`DeepSeek API error: ${apiResponse.status} - ${error}`);
    }

    const data = await apiResponse.json();
    console.log("DeepSeek API Response:", data);
    
    const generatedContent = data.choices[0].message.content;
    
    return new Response(JSON.stringify({
      success: true,
      content: {
        title: `${category} - Professional Insights`,
        content: generatedContent,
        content_type: contentType || 'post',
        status: 'draft',
        meta_data: {
          category,
          bot_id: botId,
          ai_generated: true
        }
      },
      usage: data.usage
    }), {
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      }
    });

  } catch (error) {
    console.error("=== Generation Error ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: error.stack
    }), { 
      status: 500,
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      }
    });
  }
});

// Timeout configuration
export const config = {
  maxDuration: 30,
};