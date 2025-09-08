import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
// Helper functions inlined for edge function compatibility

function createResumeText(resumeData: any): string {
  let text = '';
  if (resumeData.personalInfo) {
    text += `Name: ${resumeData.personalInfo.fullName || 'N/A'}\n`;
    text += `Email: ${resumeData.personalInfo.email || 'N/A'}\n`;
    if (resumeData.personalInfo.summary) text += `Summary: ${resumeData.personalInfo.summary}\n\n`;
  }
  if (resumeData.experience?.length > 0) {
    text += 'EXPERIENCE:\n';
    resumeData.experience.forEach((exp: any) => {
      text += `${exp.position || 'Position'} at ${exp.company || 'Company'} (${exp.startDate || ''} - ${exp.endDate || 'Present'})\n${exp.description || ''}\n\n`;
    });
  }
  if (resumeData.skills?.length > 0) {
    text += 'SKILLS:\n' + resumeData.skills.join(', ') + '\n\n';
  }
  return text;
}

function createFallbackAnalysis(resumeData: any) {
  const hasPersonalInfo = resumeData.personalInfo?.fullName && resumeData.personalInfo?.email;
  const hasExperience = resumeData.experience?.length > 0;
  const hasSkills = resumeData.skills?.length > 0;
  const sectionsScore = [hasPersonalInfo, hasExperience, hasSkills].filter(Boolean).length * 30;
  return {
    score: Math.max(50, sectionsScore),
    breakdown: { keywords: 70, formatting: 80, sections: sectionsScore, length: 75 },
    suggestions: ['Add more relevant keywords', 'Include measurable achievements'],
    strengths: hasPersonalInfo ? ['Complete contact info'] : [],
    weaknesses: !hasSkills ? ['Missing skills section'] : []
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData } = await req.json();

    if (!resumeData) {
      return new Response(JSON.stringify({ error: 'Resume data is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert resume data to text for analysis
    const resumeContent = createResumeText(resumeData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header (optional for testing)
    const authHeader = req.headers.get('authorization');
    let user = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
        if (!userError && authUser) {
          user = authUser;
        }
      } catch (error) {
        console.error('Auth error (continuing without user):', error);
      }
    }

    // Initialize OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build comprehensive ATS analysis prompt
    const analysisPrompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume and provide a comprehensive ATS compatibility score.

RESUME CONTENT:
${resumeContent}

Analyze the resume based on these criteria:
1. Keywords (25%): Presence of relevant industry keywords and skills
2. Formatting (25%): ATS-friendly formatting, proper section headers
3. Sections (25%): Essential sections present (contact, experience, education, skills)
4. Length (25%): Appropriate length (1-2 pages)

Provide your analysis in the following JSON format:
{
  "score": [overall score 0-100],
  "breakdown": {
    "keywords": [score 0-100],
    "formatting": [score 0-100], 
    "sections": [score 0-100],
    "length": [score 0-100]
  },
  "suggestions": [
    "List of specific improvement suggestions"
  ],
  "strengths": [
    "List of resume strengths"
  ],
  "weaknesses": [
    "List of areas needing improvement"
  ]
}

Be specific and actionable in your suggestions. Focus on ATS compatibility issues.`;

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
          { role: 'system', content: 'You are an expert ATS (Applicant Tracking System) analyzer. Provide detailed, actionable feedback for resume optimization.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error('OpenAI API request failed');
    }

    const aiData = await openAIResponse.json();
    let analysisResult;

    try {
      // Try to parse JSON response
      const responseText = aiData.choices[0].message.content;
      analysisResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Provide fallback analysis
      analysisResult = createFallbackAnalysis(resumeData);
    }

    // Store analysis result in database (only if user is authenticated)
    if (user) {
      try {
        await supabase
          .from('ai_operations')
          .insert({
            user_id: user.id,
            operation_type: 'ats_scan',
            input_data: { 
              resumeContent: resumeContent.substring(0, 1000) + '...', // Truncate for storage
              resumeData: resumeData
            },
            output_data: analysisResult,
            status: 'completed',
            tokens_used: aiData.usage?.total_tokens || 0,
            completed_at: new Date().toISOString()
          });
      } catch (dbError) {
        console.error('Database logging error:', dbError);
        // Continue without failing the request
      }
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      metadata: {
        tokens_used: aiData.usage?.total_tokens || 0,
        model: 'gpt-4o-mini'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-ats-analyzer function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});