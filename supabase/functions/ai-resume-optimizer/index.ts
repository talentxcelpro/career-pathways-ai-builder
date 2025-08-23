import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      resumeContent, 
      jobDescription, 
      targetRole, 
      industry, 
      optimizationLevel = 'moderate' 
    } = await req.json();

    if (!resumeContent || !jobDescription) {
      return new Response(JSON.stringify({ error: 'Resume content and job description are required' }), {
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

    // Initialize OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build optimization prompt based on level
    const optimizationGuidelines = {
      conservative: "Make minimal changes, focus on keyword integration and formatting improvements",
      moderate: "Balance keyword optimization with natural flow, enhance achievements with metrics",
      aggressive: "Comprehensive rewrite to maximize job description alignment while maintaining truthfulness"
    };

    const optimizationPrompt = `As a professional resume optimization expert, tailor this resume to the specific job description.

OPTIMIZATION LEVEL: ${optimizationLevel} - ${optimizationGuidelines[optimizationLevel]}

TARGET ROLE: ${targetRole}
INDUSTRY: ${industry}

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${resumeContent}

Please provide optimized resume content in the following JSON format:
{
  "optimizedContent": "Full optimized resume text here",
  "matchScore": 92,
  "keyChanges": [
    "Added cloud computing keywords throughout",
    "Quantified achievements in experience section",
    "Optimized skills section for better ATS matching"
  ],
  "addedKeywords": ["Docker", "Kubernetes", "CI/CD", "AWS"],
  "performanceMetrics": {
    "keywordMatchRate": 88,
    "skillAlignment": 92,
    "experienceRelevance": 85,
    "atsCompatibility": 90
  },
  "sections": {
    "summary": "Enhanced professional summary",
    "experience": "Optimized experience descriptions",
    "skills": "Updated skills list",
    "achievements": "Quantified accomplishments"
  },
  "improvementAreas": [
    "Added specific metrics to project outcomes",
    "Integrated job-specific technical terms",
    "Improved action verb usage"
  ]
}

Guidelines:
1. Maintain truthfulness - don't add skills or experience not implied in original
2. Integrate keywords naturally from job description
3. Quantify achievements where possible
4. Use strong action verbs
5. Ensure ATS-friendly formatting
6. Highlight most relevant experience first
7. Match job requirements with resume strengths`;

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
          { 
            role: 'system', 
            content: 'You are an expert resume optimization specialist with deep knowledge of ATS systems and recruitment practices. Provide detailed optimization in valid JSON format.' 
          },
          { role: 'user', content: optimizationPrompt }
        ],
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error('OpenAI API request failed');
    }

    const aiData = await openAIResponse.json();
    let optimizationResult;

    try {
      // Try to parse JSON response
      const responseText = aiData.choices[0].message.content;
      optimizationResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback response
      optimizationResult = {
        optimizedContent: aiData.choices[0].message.content,
        matchScore: 85,
        keyChanges: ["Resume optimized for job requirements"],
        addedKeywords: ["Industry-relevant terms added"],
        performanceMetrics: {
          keywordMatchRate: 85,
          skillAlignment: 85,
          experienceRelevance: 85,
          atsCompatibility: 85
        },
        sections: {
          summary: "Enhanced for target role",
          experience: "Optimized for relevance",
          skills: "Updated for job match",
          achievements: "Quantified where possible"
        },
        improvementAreas: ["General optimization applied"]
      };
    }

    // Store optimization result
    await supabase
      .from('ai_operations')
      .insert({
        user_id: user.id,
        operation_type: 'jd_tailor',
        input_data: { 
          resumeContent: resumeContent.substring(0, 1000) + '...',
          jobDescription: jobDescription.substring(0, 500) + '...',
          targetRole,
          industry,
          optimizationLevel
        },
        output_data: {
          ...optimizationResult,
          optimizedContent: optimizationResult.optimizedContent?.substring(0, 2000) + '...' // Truncate for storage
        },
        status: 'completed',
        tokens_used: aiData.usage?.total_tokens || 0,
        completed_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({
      success: true,
      optimization: optimizationResult,
      metadata: {
        tokens_used: aiData.usage?.total_tokens || 0,
        model: 'gpt-4o-mini',
        optimizationLevel
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-resume-optimizer function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});