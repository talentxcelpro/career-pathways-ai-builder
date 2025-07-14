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
    const { resumeData, targetRole, industry, experience } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating smart resume title for:', { targetRole, industry, experience });

    const systemPrompt = `You are an expert resume title generator with deep knowledge of ATS optimization and professional branding.

TASK: Generate 5 compelling, ATS-optimized resume titles based on the provided resume data.

REQUIREMENTS:
1. Include target role, key skills, and years of experience
2. Use industry-standard keywords for ATS optimization
3. Keep titles under 60 characters for optimal display
4. Make titles action-oriented and achievement-focused
5. Ensure professional tone and formatting

TITLE FORMATS TO USE:
- "[Role] | [Years] Years Experience | [Key Skills]"
- "[Adjective] [Role] Specializing in [Domain] | [Achievement]"
- "[Role] with [Specialization] Experience | [Key Strength]"
- "[Years]+ Years [Role] | Expert in [Technologies/Skills]"
- "[Achievement-focused descriptor] [Role] | [Industry] Professional"

Return a JSON object with this structure:
{
  "titles": [
    {
      "title": "Professional resume title",
      "reasoning": "Why this title works well",
      "atsScore": 85,
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "recommendations": {
    "bestTitle": "The recommended primary title",
    "alternatives": ["Alternative 1", "Alternative 2"],
    "tips": ["Tip 1", "Tip 2"]
  }
}`;

    const userPrompt = `Generate smart resume titles for this candidate:

TARGET ROLE: ${targetRole || 'Not specified'}
INDUSTRY: ${industry || 'Not specified'}
EXPERIENCE LEVEL: ${experience || 'Not specified'}

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

Focus on:
- Most relevant skills and technologies from their experience
- Quantifiable achievements and impact
- Industry-specific keywords for ATS optimization
- Professional branding that stands out to recruiters

Generate 5 diverse, compelling titles with ATS scores and explanations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`AI title generation failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    let parsedData;
    try {
      parsedData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('AI returned invalid JSON format');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        ...parsedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI resume title generation:', error);
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