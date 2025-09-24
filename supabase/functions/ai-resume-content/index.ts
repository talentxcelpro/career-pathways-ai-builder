import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    console.log('Resume content request received:', { type, data: !!data });

    if (!type || !data) {
      return new Response(JSON.stringify({ error: 'Type and data are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let prompt = '';
    let systemMessage = '';

    switch (type) {
      case 'summary':
        systemMessage = 'You are an expert resume writer. Generate compelling professional summaries that highlight key achievements and skills.';
        prompt = `Generate a professional summary for someone applying for a technology role. 
        Current info: ${JSON.stringify(data)}
        
        Make it 2-3 sentences, achievement-focused, and ATS-friendly. Include relevant keywords.`;
        break;

      case 'experience':
        systemMessage = 'You are an expert resume writer specializing in crafting impactful job experience descriptions using action verbs and quantified achievements.';
        prompt = `Enhance this job experience description:
        Position: ${data.position || data.title}
        Company: ${data.company}
        Current description: ${data.description || 'No description provided'}
        
        Create 3-4 bullet points that:
        - Start with strong action verbs
        - Include quantified achievements where possible
        - Are ATS-optimized with relevant keywords
        - Highlight impact and results
        
        Format as bullet points with • symbol.`;
        break;

      case 'skills':
        systemMessage = 'You are an expert at identifying and categorizing professional skills for resumes.';
        prompt = `Suggest relevant skills for someone in technology applying for a professional role.
        Current skills: ${Array.isArray(data.skills) ? data.skills.join(', ') : 'No skills provided'}
        
        Provide 8-12 skills in order of relevance. Include:
        - Technical skills
        - Soft skills  
        - Industry-specific skills
        
        Return as a comma-separated list.`;
        break;

      case 'projects':
        systemMessage = 'You are an expert at writing compelling project descriptions for resumes.';
        prompt = `Enhance this project description:
        Project: ${data.title}
        Current description: ${data.description || 'No description provided'}
        Technologies: ${Array.isArray(data.technologies) ? data.technologies.join(', ') : 'Not specified'}
        
        Create a concise description (2-3 sentences) that:
        - Highlights the business impact
        - Mentions key technologies used
        - Shows problem-solving skills
        - Is relevant to the target role`;
        break;

      case 'optimization':
        systemMessage = 'You are an ATS optimization expert who helps improve resume keyword density and relevance.';
        prompt = `Analyze this resume section and suggest improvements for ATS optimization:
        Section type: ${data.sectionType}
        Content: ${JSON.stringify(data.content)}
        
        Provide:
        1. Missing keywords that should be added
        2. Phrases that could be improved for ATS
        3. Specific suggestions for each improvement
        
        Format as actionable recommendations.`;
        break;

      default:
        throw new Error('Invalid content generation type');
    }

    console.log('Generating AI content for type:', type);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices[0].message.content;

    console.log('AI content generated successfully');

    // Log usage for analytics
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          await supabase.from('ai_usage_logs').insert({
            user_id: user.id,
            feature_type: 'resume_content_generation',
            request_type: type,
            tokens_used: aiResponse.usage?.total_tokens || 0,
            success: true
          });
        }
      } catch (error) {
        console.error('Error logging usage:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        type: type,
        suggestions: type === 'optimization' ? generatedContent : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-resume-content function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate content', 
        details: (error as Error).message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});