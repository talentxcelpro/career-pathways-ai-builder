import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { prompt, resumeData, category } = await req.json();

    if (!prompt || !resumeData) {
      throw new Error('Prompt and resume data are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Enhancing resume with prompt:', prompt);

    // Create category-specific system prompts
    const systemPrompts = {
      general: 'You are an expert resume writer with 15+ years of experience. Focus on making resumes professional, impactful, and modern.',
      jobSpecific: 'You are a career coach specializing in job-specific resume tailoring. Match resumes perfectly to job requirements.',
      ats: 'You are an ATS optimization expert. Ensure resumes pass through applicant tracking systems with proper keywords and formatting.',
      achievements: 'You are an achievement-focused resume consultant. Transform job duties into quantifiable accomplishments and impact statements.',
      fresher: 'You are a career counselor for new graduates and entry-level professionals. Make limited experience shine.',
      skills: 'You are a skills assessment expert. Optimize technical and soft skills presentation for maximum impact.',
      design: 'You are a resume design consultant. Focus on structure, layout, and visual hierarchy for professional presentation.',
      review: 'You are a critical resume reviewer and recruiter. Provide honest, detailed feedback with specific improvement suggestions.'
    };

    const systemPrompt = systemPrompts[category as keyof typeof systemPrompts] || systemPrompts.general;

    const enhancedPrompt = `${systemPrompt}

ENHANCEMENT REQUEST: ${prompt}

INSTRUCTIONS:
- If this is a review/feedback request, provide detailed, actionable feedback in plain text
- If this is an enhancement request, provide the enhanced content
- For ATS optimization, focus on keywords, formatting, and compatibility
- For job-specific tailoring, match content to job requirements
- For achievement focus, use metrics, percentages, and quantifiable results
- For freshers, emphasize potential, projects, education, and transferable skills
- For skills enhancement, organize and strengthen technical/soft skills presentation
- For design suggestions, provide structural and formatting recommendations

RESUME DATA TO ENHANCE:
${resumeData}

Provide a comprehensive enhancement based on the request. Be specific, actionable, and professional.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional resume enhancement AI with expertise in modern recruitment practices, ATS systems, and career development.' 
          },
          { role: 'user', content: enhancedPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancement = data.choices[0].message.content;

    console.log('Resume enhancement completed successfully');

    return new Response(
      JSON.stringify({ 
        enhancement,
        category,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI resume enhancement:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});