import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, analysisType, data } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    switch (action) {
      case 'predictive_analysis': {
        // Get user's historical data
        const { data: userApplications, error: appsError } = await supabase
          .from('job_applications')
          .select('*, jobs(title, company_name, location, salary_range)')
          .eq('user_id', userId);

        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (appsError || profileError) {
          throw appsError || profileError;
        }

        const prompt = `Analyze this user's career data and provide predictive insights:

User Profile: ${JSON.stringify(userProfile)}
Application History: ${JSON.stringify(userApplications)}

Provide insights on:
1. Job market trends relevant to this user
2. Salary growth predictions
3. Skill development recommendations
4. Career progression opportunities

Return as JSON:
{
  "trends": ["trend1", "trend2"],
  "salaryPrediction": {"current": 80000, "predicted6months": 90000},
  "skillRecommendations": [{"skill": "name", "priority": "high", "reason": "why"}],
  "careerOpportunities": [{"role": "title", "probability": 85, "timeline": "3-6 months"}]
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
              { role: 'system', content: 'You are a career analytics expert providing data-driven insights.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        });

        const aiResponse = await response.json();
        const analysis = JSON.parse(aiResponse.choices[0].message.content);

        // Store the analysis
        await supabase
          .from('ai_predictive_analytics')
          .insert({
            user_id: userId,
            analysis_type: 'career_prediction',
            predictions: analysis,
            confidence_score: 0.85,
            data_points_used: userApplications.length + 1
          });

        return new Response(JSON.stringify({ success: true, analysis }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'market_intelligence': {
        const { industry, role, location } = data;

        const prompt = `Provide market intelligence for:
Industry: ${industry}
Role: ${role}
Location: ${location}

Include:
1. Market demand and growth
2. Salary benchmarks
3. Key skills in demand
4. Hiring trends
5. Competition level

Return as JSON with specific data points and percentages.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a market research analyst providing accurate job market data.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 800,
          }),
        });

        const aiResponse = await response.json();
        const intelligence = JSON.parse(aiResponse.choices[0].message.content);

        // Store market intelligence
        await supabase
          .from('ai_market_intelligence')
          .insert({
            industry,
            role,
            location,
            intelligence_data: intelligence,
            created_by: userId
          });

        return new Response(JSON.stringify({ success: true, intelligence }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'coaching_session': {
        const { sessionType, userMessage, context } = data;

        const prompt = `Provide AI career coaching for session type: ${sessionType}

User message: ${userMessage}
Context: ${JSON.stringify(context)}

Provide:
1. Personalized advice
2. Action items
3. Resources or next steps
4. Motivational insights

Be encouraging, specific, and actionable.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an experienced career coach providing personalized guidance.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 600,
          }),
        });

        const aiResponse = await response.json();
        const coaching = aiResponse.choices[0].message.content;

        // Store coaching session
        await supabase
          .from('ai_coaching_sessions')
          .insert({
            user_id: userId,
            session_type: sessionType,
            user_input: userMessage,
            ai_response: coaching,
            session_context: context || {}
          });

        return new Response(JSON.stringify({ success: true, coaching }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('AI analytics engine error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});