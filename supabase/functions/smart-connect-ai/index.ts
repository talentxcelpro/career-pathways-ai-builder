import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentUser, potentialMatch } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an AI career networking advisor. Analyze two professional profiles and provide intelligent connection insights. Focus on:

1. Professional synergies and collaboration opportunities
2. Knowledge exchange potential 
3. Career advancement possibilities
4. Industry insights they could share
5. Mutual benefit opportunities

Provide a concise, actionable insight in 1-2 sentences that explains why this connection would be valuable for both parties.`;

    const userPrompt = `Current User Profile:
Name: ${currentUser.full_name}
Title: ${currentUser.title}
Career Stage: ${currentUser.career_stage}
Career Goals: ${currentUser.career_goals?.join(', ') || 'Not specified'}
Career Interests: ${currentUser.career_interests?.join(', ') || 'Not specified'}
Skills: ${currentUser.skills?.join(', ') || 'Not specified'}
Industry: ${currentUser.industry || 'Not specified'}
Company: ${currentUser.current_company || 'Not specified'}

Potential Connection Profile:
Name: ${potentialMatch.full_name}
Title: ${potentialMatch.title}
Career Stage: ${potentialMatch.career_stage}
Career Goals: ${potentialMatch.career_goals?.join(', ') || 'Not specified'}
Career Interests: ${potentialMatch.career_interests?.join(', ') || 'Not specified'}
Skills: ${potentialMatch.skills?.join(', ') || 'Not specified'}
Industry: ${potentialMatch.industry || 'Not specified'}
Company: ${potentialMatch.current_company || 'Not specified'}

Generate a smart connection insight that explains the mutual value of this connection.`;

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
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI');
    }

    const aiInsight = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ 
      insight: aiInsight,
      confidence: Math.floor(Math.random() * 20 + 80) // Mock confidence score 80-100%
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in smart-connect-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackInsight: "This connection could provide valuable networking opportunities and knowledge exchange in your industry."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});