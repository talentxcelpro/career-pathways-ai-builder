import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");
    
    if (!deepseekApiKey) {
      throw new Error("Missing DeepSeek API key");
    }

    const { messages, model = "deepseek-chat", temperature = 0.7, max_tokens = 2048 } = await req.json();

    console.log('DeepSeek request:', { model, temperature, max_tokens, messageCount: messages?.length });

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${deepseekApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', response.status, errorData);
      throw new Error(`DeepSeek API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('DeepSeek response received:', { 
      usage: data.usage,
      content_length: data.choices?.[0]?.message?.content?.length 
    });

    return new Response(JSON.stringify({
      success: true,
      data: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in deepseek-ai function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});