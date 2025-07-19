
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { resumeContent, targetRole, industry } = await req.json();

    console.log('Analyzing resume with AI...');

    const analysisPrompt = `
You are an expert resume analyst. Analyze the following resume content and provide a comprehensive assessment.

Resume Content: ${JSON.stringify(resumeContent)}
Target Role: ${targetRole || 'General'}
Industry: ${industry || 'General'}

Provide analysis in the following JSON format:
{
  "overallScore": number (0-100),
  "categories": {
    "content": { "score": number, "feedback": string, "improvements": [string] },
    "structure": { "score": number, "feedback": string, "improvements": [string] },
    "atsCompatibility": { "score": number, "feedback": string, "improvements": [string] },
    "keywords": { "score": number, "feedback": string, "improvements": [string] },
    "formatting": { "score": number, "feedback": string, "improvements": [string] }
  },
  "strengths": [string],
  "criticalIssues": [{ "issue": string, "severity": "high|medium|low", "suggestion": string }],
  "atsOptimization": {
    "matchedKeywords": [string],
    "missingKeywords": [string],
    "recommendations": [string]
  },
  "contentSuggestions": [{ "section": string, "current": string, "improved": string, "reason": string }]
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
          { role: 'system', content: 'You are an expert resume analyst with deep knowledge of ATS systems, hiring practices, and resume optimization.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI resume analysis error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      fallback: {
        overallScore: 75,
        categories: {
          content: { score: 80, feedback: "Good content structure", improvements: ["Add more quantified achievements"] },
          structure: { score: 70, feedback: "Well organized", improvements: ["Consider reordering sections"] },
          atsCompatibility: { score: 75, feedback: "ATS friendly", improvements: ["Add more relevant keywords"] },
          keywords: { score: 70, feedback: "Good keyword usage", improvements: ["Include industry-specific terms"] },
          formatting: { score: 85, feedback: "Clean formatting", improvements: ["Consistent bullet points"] }
        },
        strengths: ["Clear professional summary", "Relevant experience"],
        criticalIssues: [],
        atsOptimization: { matchedKeywords: [], missingKeywords: [], recommendations: [] },
        contentSuggestions: []
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
