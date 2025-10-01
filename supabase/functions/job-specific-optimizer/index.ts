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
    const { resumeData, jobDescription, optimizationLevel } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Optimizing resume for specific job (level: ${optimizationLevel || 'moderate'})`);

    const level = optimizationLevel || 'moderate';
    const intensity = {
      conservative: 'minimal changes while maintaining factual accuracy',
      moderate: 'balanced optimization with strategic keyword integration',
      aggressive: 'comprehensive optimization while preserving truthfulness'
    }[level];

    const systemPrompt = `You are an expert resume optimizer specializing in job-specific tailoring. Optimize the resume for the target job while:

**OPTIMIZATION PRINCIPLES:**
1. **Factual Accuracy**: Never fabricate experience, skills, or achievements
2. **Strategic Emphasis**: Highlight relevant experience and de-emphasize less relevant details
3. **Keyword Integration**: Naturally integrate job description keywords
4. **Achievement Reframing**: Reframe achievements to align with job requirements
5. **Skills Prioritization**: Reorder and emphasize relevant skills

**OPTIMIZATION LEVEL: ${intensity}**

**PROCESS:**

1. **Keyword Extraction**
   - Identify critical keywords from job description (hard skills, soft skills, technologies, methodologies)
   - Categorize by importance (must-have vs. nice-to-have)

2. **Content Mapping**
   - Match resume experience to job requirements
   - Identify transferable skills
   - Find natural keyword integration points

3. **Strategic Rewriting**
   - Reframe bullet points to emphasize relevant achievements
   - Integrate keywords naturally without stuffing
   - Strengthen alignment with job description language
   - Prioritize most relevant experience

4. **Skills Optimization**
   - Reorder skills by relevance to job
   - Add skill categories matching job requirements
   - Emphasize proficiency in required technologies

5. **Summary Tailoring**
   - Rewrite professional summary to mirror job description
   - Highlight matching experience and skills
   - Use similar language and terminology

**OUTPUT:**
Return optimized resume with:
- Changed sections clearly marked
- Reason for each change
- Keyword match percentage improvement
- Overall match score (before/after)

Return as structured JSON with the optimized resume data and change tracking.`;

    const resumeText = JSON.stringify(resumeData, null, 2);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nOptimize the resume for this specific job. Return complete optimized resume data with change tracking.`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429 || response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const optimizationText = data.choices[0].message.content;
    
    let result;
    try {
      const jsonMatch = optimizationText.match(/```json\n([\s\S]*?)\n```/) || 
                        optimizationText.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : optimizationText;
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse optimization result:', optimizationText);
      // Return original with note
      result = {
        optimizedResume: resumeData,
        changes: [],
        matchScore: { before: 50, after: 50 },
        keywordImprovement: 0,
        note: 'Optimization parsing failed, returning original'
      };
    }

    console.log(`✅ Resume optimized for job`);

    return new Response(
      JSON.stringify({ 
        success: true,
        ...result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in job-specific-optimizer:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
