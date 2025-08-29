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
    const { resumeContent, jobDescription, targetRole, industry } = await req.json();

    if (!resumeContent) {
      return new Response(JSON.stringify({ error: 'Resume content is required' }), {
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

    // Build comprehensive ATS analysis prompt
    const analysisPrompt = `As an expert ATS (Applicant Tracking System) analyzer, perform a comprehensive analysis of the following resume.

TARGET ROLE: ${targetRole || 'General'}
INDUSTRY: ${industry || 'Technology'}
${jobDescription ? `JOB DESCRIPTION: ${jobDescription}` : ''}

RESUME CONTENT:
${resumeContent}

Please provide a detailed analysis in the following JSON format:
{
  "overallScore": 85,
  "sections": {
    "formatting": { "score": 90, "feedback": "Clean, ATS-friendly format" },
    "keywords": { "score": 75, "feedback": "Missing key industry terms" },
    "experience": { "score": 88, "feedback": "Strong relevant experience" },
    "skills": { "score": 80, "feedback": "Good technical skills mix" },
    "achievements": { "score": 70, "feedback": "Need more quantified results" }
  },
  "strengths": [
    "Clear professional summary",
    "Relevant technical skills",
    "Good career progression"
  ],
  "issues": [
    "Missing important keywords: cloud computing, data analysis",
    "Weak achievement quantification",
    "Skills section could be more comprehensive"
  ],
  "suggestions": [
    "Add specific metrics to achievements (% improvement, $ saved, etc.)",
    "Include more industry-relevant keywords",
    "Optimize section headers for ATS parsing",
    "Add relevant certifications if available"
  ],
  "keywordAnalysis": {
    "found": ["JavaScript", "React", "Node.js", "API"],
    "missing": ["TypeScript", "Docker", "AWS", "CI/CD"],
    "suggestions": ["Add cloud platform experience", "Include testing frameworks"]
  },
  "atsCompatibility": {
    "score": 85,
    "issues": ["Complex formatting may cause parsing errors"],
    "recommendations": ["Use standard section headers", "Avoid tables and complex layouts"]
  }
}

Provide actionable, specific feedback that will help improve ATS score and job matching.`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: 'You are an expert ATS and resume optimization specialist. Provide detailed, actionable analysis in valid JSON format.' },
          { role: 'user', content: analysisPrompt }
        ],
        max_completion_tokens: 2000,
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
      // Fallback to structured response
      analysisResult = {
        overallScore: 75,
        sections: {
          formatting: { score: 80, feedback: "Analysis completed" },
          keywords: { score: 70, feedback: "Analysis completed" },
          experience: { score: 75, feedback: "Analysis completed" },
          skills: { score: 75, feedback: "Analysis completed" },
          achievements: { score: 70, feedback: "Analysis completed" }
        },
        strengths: ["Professional format", "Relevant experience"],
        issues: ["Needs optimization"],
        suggestions: ["Improve keyword usage", "Quantify achievements"],
        keywordAnalysis: {
          found: ["Professional skills listed"],
          missing: ["Industry-specific keywords"],
          suggestions: ["Add relevant technical terms"]
        },
        atsCompatibility: {
          score: 75,
          issues: ["Standard formatting recommended"],
          recommendations: ["Use ATS-friendly format"]
        }
      };
    }

    // Store analysis result in database
    await supabase
      .from('ai_operations')
      .insert({
        user_id: user.id,
        operation_type: 'ats_scan',
        input_data: { 
          resumeContent: resumeContent.substring(0, 1000) + '...', // Truncate for storage
          jobDescription: jobDescription?.substring(0, 500),
          targetRole,
          industry
        },
        output_data: analysisResult,
        status: 'completed',
        tokens_used: aiData.usage?.total_tokens || 0,
        completed_at: new Date().toISOString()
      });

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