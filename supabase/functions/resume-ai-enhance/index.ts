import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData, targetRole, enhanceType } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    switch (enhanceType) {
      case 'ats_optimize':
        systemPrompt = 'You are an ATS optimization expert. Analyze resume content and provide specific suggestions to improve ATS compatibility and keyword optimization.';
        userPrompt = `Analyze this resume for ATS optimization. Target role: ${targetRole || 'general'}\n\nResume: ${JSON.stringify(resumeData)}\n\nProvide: 1) ATS score (0-100), 2) Missing keywords, 3) Formatting suggestions, 4) Content improvements. Return as JSON.`;
        break;
      
      case 'content_improve':
        systemPrompt = 'You are a professional resume writer with expertise in crafting compelling professional summaries and bullet points.';
        userPrompt = `Improve this resume content for a ${targetRole || 'professional'} role:\n\n${JSON.stringify(resumeData)}\n\nEnhance: 1) Professional summary, 2) Experience bullet points, 3) Skills section. Maintain factual accuracy. Return improved content as JSON.`;
        break;
      
      case 'industry_tailor':
        systemPrompt = 'You are a career counselor specializing in industry-specific resume optimization.';
        userPrompt = `Tailor this resume for ${targetRole || 'the target industry'}:\n\n${JSON.stringify(resumeData)}\n\nCustomize: 1) Industry keywords, 2) Relevant skills emphasis, 3) Experience prioritization. Return tailored version as JSON.`;
        break;
      
      default:
        systemPrompt = 'You are a resume enhancement expert providing comprehensive improvement suggestions.';
        userPrompt = `Analyze and enhance this resume:\n\n${JSON.stringify(resumeData)}\n\nProvide specific improvements for better professional presentation.`;
    }

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancement = data.choices[0].message.content;

    // Try to parse as JSON, fallback to text
    let enhancementData;
    try {
      enhancementData = JSON.parse(enhancement);
    } catch {
      enhancementData = { suggestions: enhancement };
    }

    return new Response(JSON.stringify({
      success: true,
      enhancement: enhancementData,
      type: enhanceType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Resume AI enhance error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});