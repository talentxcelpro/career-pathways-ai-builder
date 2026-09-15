import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) {
      return json({ error: 'Authorization required' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      return json({ error: 'Supabase auth config not configured' }, 500);
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user?.id) {
      return json({ error: 'Invalid authorization token' }, 401);
    }

    const { message, serviceType, conversationId } = await req.json();

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // For now, we'll work without profile context
    // TODO: Fetch user profile when needed

    // Create system prompt based on service type
    const systemPrompts = {
      career_coaching: `You are an expert career coach helping professionals advance their careers. 
        Provide personalized advice on career development, job search strategies, interview preparation, 
        and professional growth. Be encouraging, specific, and actionable in your responses.`,
      
      resume_optimization: `You are a professional resume expert who helps optimize resumes for maximum impact.
        Analyze resumes for structure, content, keywords, and ATS compatibility. Provide specific 
        suggestions for improvements and highlight strengths.`,
      
      interview_prep: `You are an experienced interview coach specializing in helping candidates prepare 
        for job interviews. Provide mock interview questions, feedback on responses, and strategies 
        for different interview formats and company types.`,
      
      salary_negotiation: `You are a salary negotiation expert who helps professionals maximize their 
        compensation packages. Provide guidance on research, timing, negotiation tactics, and 
        benefit evaluation.`,
      
      skill_development: `You are a learning and development specialist who helps professionals identify 
        and develop relevant skills. Recommend learning paths, resources, and strategies for skill 
        acquisition in various fields.`,
      
      job_matching: `You are a Senior Technical Recruiter and AI Job Matcher. 
        Your task is to analyze the compatibility between a candidate's profile/resume and a specific job description or search query.
        
        Provide a detailed response in JSON format with:
        1. match_score (0-100)
        2. match_reasons (Array of 3-5 specific bullet points explaining the fit)
        3. skill_gap_analysis (Specific skills missing)
        4. interview_readiness_score (0-100)
        5. personalized_tips (Specific advice to improve chances)
        
        Focus on:
        - Technical skill overlap
        - Years of experience vs. requirements
        - Industry relevance
        - Cultural fit markers (from resume summary)
        - Location/Remote preference alignment`
    };

    const systemPrompt = systemPrompts[serviceType as keyof typeof systemPrompts] || 
                        systemPrompts.career_coaching;

    // Prepare context (simplified for now)
    const userContext = '\nProviding personalized career guidance...';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt + userContext 
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // TODO: Store conversation and messages in database
    // For now, just log the successful interaction
    console.log('AI service matching completed for user:', user.id, 'service:', serviceType);

    return json({
      response: aiResponse,
      conversationId,
      serviceType,
      userId: user.id,
    });

  } catch (error) {
    console.error('Error in AI service matching:', error);
    return json({
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, 500);
  }
});
