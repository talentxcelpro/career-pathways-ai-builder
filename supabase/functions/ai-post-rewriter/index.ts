import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, tone, userRole, targetAudience } = await req.json();

    if (!content || !tone) {
      return new Response(JSON.stringify({ error: 'Content and tone are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tonePrompts = {
      professional: "Rewrite this post in a professional, formal tone suitable for LinkedIn and business networking. Keep it concise and impactful.",
      engaging: "Rewrite this post to be more engaging, compelling, and likely to generate comments and interactions. Add personality and make it more conversational.",
      casual: "Rewrite this post in a casual, friendly tone that feels natural and approachable. Keep the same message but make it more relaxed.",
      concise: "Make this post more concise while keeping all the key points. Remove unnecessary words and make it punchy.",
      thoughtful: "Rewrite this post to be more thoughtful and insightful. Add depth and perspective that provides value to readers."
    };

    const systemPrompt = `You are an AI social media expert helping professionals create better posts. 
    ${tonePrompts[tone as keyof typeof tonePrompts] || tonePrompts.professional}
    
    Additional context:
    - User role: ${userRole || 'Professional'}
    - Target audience: ${targetAudience || 'Professional network'}
    
    Rules:
    1. Keep the core message and intent intact
    2. Maintain authenticity - don't make it sound robotic
    3. Optimize for engagement and clarity
    4. Add relevant hashtags if appropriate
    5. Keep it under 280 words
    6. Make it scannable with line breaks if needed
    
    Return only the rewritten post, nothing else.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const rewrittenContent = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      rewrittenContent,
      originalLength: content.length,
      newLength: rewrittenContent.length,
      tone: tone
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-post-rewriter function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});