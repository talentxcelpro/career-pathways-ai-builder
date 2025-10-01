import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { section, content, targetRole, industry, style } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Enhancing ${section} section for role: ${targetRole || 'general'}`);

    const systemPrompts: Record<string, string> = {
      summary: `You are a professional resume writer specializing in impactful professional summaries. Create compelling summaries that:
- Start with a strong professional identity statement
- Highlight 3-5 key achievements with metrics
- Include relevant technical skills and expertise areas
- Align with ${targetRole || 'target role'} requirements
- Use action-oriented language
- Keep it 3-4 sentences, 50-80 words
- Optimize for ATS with industry keywords for ${industry || 'the field'}

Style: ${style || 'professional and confident'}`,

      experience: `You are an expert at crafting achievement-focused work experience descriptions. Transform each job entry to:
- Start each bullet with strong action verbs (Led, Developed, Achieved, Increased, Reduced)
- Quantify achievements with specific metrics and percentages
- Highlight business impact and outcomes
- Include relevant technologies and methodologies
- Use the STAR method (Situation, Task, Action, Result)
- Optimize for ${targetRole || 'target role'} in ${industry || 'the industry'}
- Ensure ATS compatibility with natural keyword integration
- Keep each bullet point concise (1-2 lines)

Style: ${style || 'results-oriented and measurable'}`,

      skills: `You are a skills optimization expert. Enhance the skills section by:
- Categorizing skills (Technical, Tools, Soft Skills, Languages)
- Prioritizing high-demand skills for ${targetRole || 'the role'} in ${industry || 'the industry'}
- Adding proficiency levels where appropriate
- Including relevant certifications
- Removing outdated or irrelevant skills
- Ensuring ATS keyword optimization
- Ordering by relevance to target role

Return as categorized JSON structure`,

      education: `You are an education section optimizer. Enhance education entries by:
- Highlighting relevant coursework for ${targetRole || 'the role'}
- Including academic achievements (GPA if >3.5, honors, awards)
- Adding relevant projects or thesis work
- Emphasizing technical or specialized training
- Including certifications in chronological order
- Optimizing for ${industry || 'the industry'} requirements

Keep format clean and ATS-friendly`
    };

    const userPrompt = section === 'skills' 
      ? `Enhance and categorize these skills optimally for ${targetRole || 'a professional role'}:\n\n${content}\n\nReturn as JSON: {"technical": [], "tools": [], "soft": [], "languages": []}`
      : `Enhance this ${section} section for a ${targetRole || 'professional'} role in ${industry || 'the field'}:\n\n${content}\n\nProvide enhanced, ATS-optimized version maintaining factual accuracy.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompts[section] || systemPrompts.experience },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;

    console.log(`✅ Enhanced ${section} section successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        original: content,
        enhanced: enhancedContent,
        section
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhance-section function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
