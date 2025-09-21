import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Smart Connect AI function called');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { currentUser, potentialMatch, matchType = 'connection' } = await req.json();
    
    if (!currentUser || !potentialMatch) {
      return new Response(
        JSON.stringify({ error: 'Missing required data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating AI insight for connection');

    const systemPrompt = matchType === 'mentor' 
      ? `You are a mentorship AI assistant. Analyze a potential mentor-mentee pairing and provide insights about how they could work together for professional growth.

Focus on:
- How the mentor's experience aligns with mentee's goals
- Knowledge transfer opportunities
- Career guidance potential
- Skill development areas
- Industry insights mentor can share

Keep the response under 100 words and make it actionable.`
      : matchType === 'collaboration'
      ? `You are a collaboration AI assistant. Analyze two professionals for project collaboration potential.

Focus on:
- Complementary skills and expertise
- Shared project interests
- Collaboration synergies
- How they can achieve mutual goals
- Project success potential

Keep the response under 100 words and make it compelling.`
      : `You are a professional networking AI assistant. Analyze two professional profiles and provide a concise, actionable insight about why they should connect and how they could benefit each other professionally.

Focus on:
- Shared interests or goals
- Complementary skills or experience  
- Potential collaboration opportunities
- Career advancement possibilities
- Industry insights they could exchange

Keep the response under 100 words and make it personalized and engaging.`;

    const userPrompt = `Current User Profile:
Name: ${currentUser.full_name || 'Professional'}
Title: ${currentUser.title || 'N/A'}
Career Goals: ${currentUser.career_goals?.join(', ') || 'N/A'}
Interests: ${currentUser.career_interests?.join(', ') || 'N/A'}
Career Stage: ${currentUser.career_stage || 'N/A'}

Potential Connection:
Name: ${potentialMatch.full_name || 'Professional'}  
Title: ${potentialMatch.title || 'N/A'}
Career Goals: ${potentialMatch.career_goals?.join(', ') || 'N/A'}
Interests: ${potentialMatch.career_interests?.join(', ') || 'N/A'}
Career Stage: ${potentialMatch.career_stage || 'N/A'}

Provide a compelling insight about why these two professionals should connect.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const insight = data.choices[0]?.message?.content;

    if (!insight) {
      throw new Error('No insight generated from OpenAI');
    }

    console.log('AI insight generated successfully');

    return new Response(
      JSON.stringify({ 
        insight,
        confidence: 85 // Mock confidence score
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in smart-connect-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI insight',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});