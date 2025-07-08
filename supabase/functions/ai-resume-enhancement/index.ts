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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing resume enhancement:', category);

    // Enhanced prompts based on category
    let systemPrompt = '';
    let userPrompt = '';

    switch (category) {
      case 'ats':
        systemPrompt = `You are an ATS optimization expert. Enhance resumes for ATS compatibility with proper keywords, formatting, and structure. Focus on:
        - Industry-specific keywords and phrases
        - Standard section headers
        - Quantifiable achievements
        - Skills matching job requirements
        - Professional formatting
        Return a complete JSON object with the same structure as the input.`;
        break;
      case 'achievements':
        systemPrompt = `You are a career achievements specialist. Transform resume content to highlight quantifiable results and impact. Focus on:
        - Converting responsibilities into achievements
        - Adding specific metrics, percentages, and numbers
        - Highlighting business impact and results
        - Using action verbs and power words
        Return a complete JSON object with the same structure as the input.`;
        break;
      case 'professional':
        systemPrompt = `You are a professional writing expert. Enhance resume content for professional tone and clarity. Focus on:
        - Modern professional language
        - Clear and concise writing
        - Industry-appropriate terminology
        - Consistent formatting and style
        Return a complete JSON object with the same structure as the input.`;
        break;
      case 'general':
        systemPrompt = `You are a resume enhancement expert. Improve the overall quality and impact of resume content. Focus on:
        - Clarity and readability
        - Professional language
        - Stronger action verbs
        - Better structure and flow
        Return a complete JSON object with the same structure as the input.`;
        break;
      default:
        systemPrompt = `You are a resume enhancement expert. Improve the provided resume content based on the specific requirements.`;
    }

    userPrompt = `${prompt}\n\nResume Data:\n${resumeData}\n\nPlease enhance this resume data and return it in the exact same JSON structure. Maintain all existing sections and structure while improving the content quality.`;

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
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`AI enhancement failed: ${response.status}`);
    }

    const data = await response.json();
    const enhancement = data.choices[0].message.content;

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