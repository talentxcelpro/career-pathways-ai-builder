
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, section, improvementType = 'general' } = await req.json();

    console.log(`Improving ${section} content with type: ${improvementType}`);

    const improvementPrompts = {
      grammar: `Fix grammar, spelling, and punctuation errors in this ${section} content: "${content}"`,
      clarity: `Improve clarity and readability of this ${section} content: "${content}"`,
      impact: `Make this ${section} content more impactful and action-oriented: "${content}"`,
      keywords: `Optimize this ${section} content for ATS and relevant keywords: "${content}"`,
      general: `Improve this ${section} content for grammar, clarity, and impact: "${content}"`
    };

    const prompt = `
${improvementPrompts[improvementType] || improvementPrompts.general}

Provide the response in JSON format:
{
  "improvedContent": "improved version of the content",
  "changes": [
    { "original": "original text", "improved": "improved text", "reason": "why this change was made" }
  ],
  "score": { "before": number, "after": number },
  "suggestions": ["additional suggestions for further improvement"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert resume writer and editor with deep knowledge of professional communication.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const improvement = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ success: true, ...improvement }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Content improvement error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      improvedContent: content,
      changes: [],
      score: { before: 70, after: 70 },
      suggestions: []
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
