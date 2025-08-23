import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

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

    // Initialize OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error('OpenAI API request failed');
    }

    const aiData = await openAIResponse.json();
    const aiResponse = aiData.choices[0].message.content;

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
          tokens_used: aiData.usage?.total_tokens || 0,
          model: 'gpt-4o-mini'
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
        tokens_used: aiData.usage?.total_tokens || 0,
        processing_time_ms: Date.now() - Date.now(), // Simplified for now
        completed_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({
      success: true,
      message: aiResponse,
      sessionId: currentSessionId,
      metadata: {
        tokens_used: aiData.usage?.total_tokens || 0,
        response_type: responseType
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});