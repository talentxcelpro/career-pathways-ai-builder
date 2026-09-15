import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateCoachResponse({
  openAIApiKey,
  lovableApiKey,
  systemPrompt,
  aiPrompt,
}: {
  openAIApiKey?: string | null;
  lovableApiKey?: string | null;
  systemPrompt: string;
  aiPrompt: string;
}) {
  if (openAIApiKey) {
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
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens || 0,
      model: 'gpt-4o-mini',
      provider: 'openai',
    };
  }

  if (lovableApiKey) {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.7,
        max_completion_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lovable AI gateway error:', error);
      throw new Error('Lovable AI gateway request failed');
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens || 0,
      model: 'google/gemini-2.5-flash',
      provider: 'lovable-gateway',
    };
  }

  return {
    content:
      'Cloud AI is not configured yet, but I can still guide the next step from your TalentXcel context. ' +
      'Set OPENAI_API_KEY or LOVABLE_API_KEY in Supabase secrets for live AI reasoning. ' +
      `For this request, focus on: ${aiPrompt.slice(0, 500)}`,
    tokensUsed: 0,
    model: 'local-guidance',
    provider: 'local-fallback',
  };
}

serve(async (req) => {
  const startedAt = Date.now();

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, command, sessionId, context } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Initialize AI providers. OpenAI is preferred; Lovable/Gemini is a production fallback.
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    // Create or get session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession } = await supabase
        .from('ai_chat_sessions')
        .insert({
          user_id: user.id,
          session_title: 'TalentXcel AI Chat',
          context_data: context || {}
        })
        .select('id')
        .single();
      
      currentSessionId = newSession?.id;
    }

    // Store user message
    await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: currentSessionId,
        user_id: user.id,
        message_type: 'user',
        content: message
      });

    // Build AI prompt based on context and user profile
    const systemPrompt = `You are TalentXcel AI, an expert career companion helping users with:
- Resume optimization and ATS scoring
- Job search and application strategies  
- Interview preparation and practice
- Professional networking and content creation
- Skill development and learning paths
- Career planning and growth

User Profile:
- Name: ${profile?.full_name || 'User'}
- Title: ${profile?.title || 'Professional'}
- Location: ${profile?.location || 'Not specified'}
- Skills: ${profile?.skills?.join(', ') || 'Not specified'}

Context: ${JSON.stringify(context || {})}

Provide personalized, actionable advice. Be encouraging, professional, and specific.`;

    // Process based on command type
    let aiPrompt = message;
    let responseType = 'general';

    if (command) {
      switch (command) {
        case '/ats-scan':
          responseType = 'ats_analysis';
          aiPrompt = `Analyze this resume content for ATS optimization: ${message}. Provide a score (0-100) and specific improvement suggestions.`;
          break;
        case '/jd-tailor':
          responseType = 'jd_tailoring';
          aiPrompt = `Help tailor a resume to this job description: ${message}. Suggest specific keywords, skills, and content modifications.`;
          break;
        case '/mock-interview':
          responseType = 'interview_prep';
          aiPrompt = `Generate interview questions for this role/situation: ${message}. Include behavioral, technical, and company-specific questions.`;
          break;
        case '/generate-post':
          responseType = 'content_generation';
          aiPrompt = `Create a professional LinkedIn post about: ${message}. Make it engaging, informative, and include relevant hashtags.`;
          break;
        case '/skill-check':
          responseType = 'skill_analysis';
          aiPrompt = `Analyze skills and recommend learning paths for: ${message}. Consider current market trends and career progression.`;
          break;
        case '/daily-brief':
          responseType = 'daily_briefing';
          aiPrompt = `Generate a personalized daily career brief for ${profile?.full_name || 'the user'}. Include job market insights, networking opportunities, and actionable tasks.`;
          break;
      }
    }

    // Call configured AI provider.
    const aiData = await generateCoachResponse({
      openAIApiKey,
      lovableApiKey,
      systemPrompt,
      aiPrompt,
    });

    const aiResponse = aiData.content;
    if (!aiResponse) {
      throw new Error('AI provider returned an empty response');
    }

    // Store AI response
    await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: currentSessionId,
        user_id: user.id,
        message_type: 'ai',
        content: aiResponse,
        metadata: {
          command,
          response_type: responseType,
          tokens_used: aiData.tokensUsed,
          model: aiData.model,
          provider: aiData.provider
        }
      });

    // Log operation for analytics
    await supabase
      .from('ai_operations')
      .insert({
        user_id: user.id,
        operation_type: command?.replace('/', '') || 'general_chat',
        input_data: { message, command, context },
        output_data: { response: aiResponse },
        status: 'completed',
        tokens_used: aiData.tokensUsed,
        processing_time_ms: Date.now() - startedAt,
        completed_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({
      success: true,
      message: aiResponse,
      sessionId: currentSessionId,
      metadata: {
        tokens_used: aiData.tokensUsed,
        response_type: responseType,
        model: aiData.model,
        provider: aiData.provider
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
