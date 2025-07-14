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
    const { content, targetTone, sectionType, context } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Adjusting tone for:', { targetTone, sectionType, contentLength: content.length });

    const toneInstructions = {
      'professional': 'Use formal, business-appropriate language with sophisticated vocabulary and proper grammar. Emphasize achievements and expertise.',
      'conversational': 'Use approachable, friendly language while maintaining professionalism. Include some personality while keeping it appropriate.',
      'executive': 'Use authoritative, leadership-focused language. Emphasize strategic thinking, team management, and business impact.',
      'technical': 'Use precise, technical language appropriate for the field. Include specific technologies, methodologies, and technical achievements.',
      'creative': 'Use engaging, dynamic language that showcases creativity and innovation. Allow for more expressive descriptions.',
      'academic': 'Use scholarly, research-focused language. Emphasize publications, research, and academic achievements.',
      'sales': 'Use results-driven, persuasive language. Focus on numbers, achievements, and business impact.',
      'startup': 'Use dynamic, growth-oriented language. Emphasize adaptability, innovation, and impact in fast-paced environments.'
    };

    const systemPrompt = `You are an expert resume writer specializing in tone adjustment and professional communication.

TASK: Adjust the provided resume content to match the specified tone while maintaining accuracy and impact.

TONE: ${targetTone}
TONE INSTRUCTIONS: ${toneInstructions[targetTone] || 'Use professional, clear language appropriate for the target audience.'}

SECTION TYPE: ${sectionType}

REQUIREMENTS:
1. Maintain all factual information and achievements
2. Preserve specific numbers, dates, and technical details
3. Enhance readability and impact
4. Use appropriate industry terminology
5. Ensure ATS-friendly formatting
6. Keep the same general length and structure

SECTION-SPECIFIC GUIDELINES:
- Summary: Focus on value proposition and key strengths
- Experience: Emphasize achievements and quantifiable results
- Skills: Organize by relevance and proficiency
- Education: Highlight relevant coursework and honors
- Projects: Showcase technical skills and outcomes

Return a JSON object with this structure:
{
  "adjustedContent": "The tone-adjusted content",
  "changes": [
    {
      "original": "Original phrase",
      "adjusted": "Adjusted phrase",
      "reason": "Why this change improves the tone"
    }
  ],
  "tone": "${targetTone}",
  "impactScore": 85,
  "suggestions": ["Additional improvement suggestion 1", "suggestion 2"]
}`;

    const userPrompt = `Adjust the tone of this ${sectionType} content:

CONTEXT: ${context || 'Standard resume section'}

CONTENT TO ADJUST:
${content}

Transform this content to match the ${targetTone} tone while:
- Keeping all specific achievements and metrics
- Making it more compelling and appropriate for the target audience
- Ensuring it passes ATS systems effectively
- Maintaining professional standards`;

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
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`AI tone adjustment failed: ${response.status}`);
    }

    const data = await response.json();
    const adjustedContent = data.choices[0].message.content;

    let parsedData;
    try {
      parsedData = JSON.parse(adjustedContent);
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
    console.error('Error in AI tone adjustment:', error);
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