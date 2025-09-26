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
    // Get the JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify JWT and extract user info (simplified for now)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;
    
    if (!userId) {
      throw new Error('Invalid token');
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
        acquisition in various fields.`
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
    console.log('AI service matching completed for user:', userId, 'service:', serviceType);

    return new Response(JSON.stringify({
      response: aiResponse,
      conversationId,
      serviceType,
      userId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI service matching:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});