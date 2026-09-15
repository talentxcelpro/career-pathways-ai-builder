import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (type === 'interview-questions') {
      const { profile } = data;
      const prompt = `Generate 5 relevant interview questions for a ${profile?.title || 'professional'} in the ${profile?.industry || 'general'} industry. 
      Profile Context: ${profile?.bio || 'No bio provided'}. 
      Skills: ${profile?.skills?.join(', ') || 'General professional skills'}.
      Return ONLY a JSON object with a "questions" array of strings.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        }),
      });

      const aiData = await response.json();
      return new Response(aiData.choices[0].message.content, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'interview-feedback') {
      const { questions, responses } = data;
      const prompt = `As an expert AI Recruiter, analyze these interview responses.
      Questions: ${JSON.stringify(questions)}
      User Responses: ${JSON.stringify(responses)}
      
      Evaluate each response for:
      1. STAR Method structure (Situation, Task, Action, Result).
      2. Professional tone and confidence.
      3. Keyword relevance to the role.
      
      Return a JSON object with:
      - overall_score (0-100)
      - communication_score (0-100)
      - content_score (0-100)
      - confidence_score (0-100)
      - feedback (array of strings)
      - areas_for_improvement (array of strings)
      - star_analysis (object with breakdown for each response)`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const aiData = await response.json();
      // Extract JSON from response string
      const content = aiData.choices[0].message.content;
      const jsonStr = content.match(/\{[\s\S]*\}/)?.[0] || content;
      
      return new Response(jsonStr, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid tool type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
