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
    const { summary, experience, skills, education, sectionType } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Enhancing resume sections:', { sectionType, hasSummary: !!summary, hasExperience: !!experience, hasSkills: !!skills, hasEducation: !!education });

    // Enhanced prompts for each section
    const createSectionPrompt = (section: string, content: string) => {
      switch (section) {
        case 'summary':
          return `Rewrite the following professional summary to be compelling, ATS-optimized, and highlight leadership, strategy, and global impact. Keep it concise (2-3 sentences) and professional:

Content: "${content}"

Make it power-packed with achievements and value proposition.`;

        case 'experience':
          return `Enhance this work experience section with quantifiable achievements, action verbs, and measurable results. Transform responsibilities into accomplishments:

Content: "${content}"

Focus on:
- Adding specific metrics and percentages where logical
- Using strong action verbs (Led, Achieved, Optimized, Implemented)
- Highlighting business impact and results
- Making it ATS-friendly with relevant keywords`;

        case 'skills':
          return `Format and enhance this skills section professionally. Group technical and soft skills appropriately:

Content: "${content}"

Organize into:
- Technical Skills (programming, tools, frameworks)
- Soft Skills (leadership, communication, etc.)
- Certifications (if any)
Keep it clean and keyword-rich for ATS systems.`;

        case 'education':
          return `Polish this education section to be professional and comprehensive:

Content: "${content}"

Include:
- Degree type and field of study
- Institution name
- Graduation year (if available)
- Academic honors, GPA (if notable)
- Relevant coursework (if applicable)
Keep it concise and professional.`;

        default:
          return `Enhance the following resume content professionally: "${content}"`;
      }
    };

    // If specific section type is provided, enhance just that section
    if (sectionType && (sectionType === 'summary' || sectionType === 'experience' || sectionType === 'skills' || sectionType === 'education')) {
      const content = { summary, experience, skills, education }[sectionType];
      const prompt = createSectionPrompt(sectionType, content || '');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: 'You are a professional resume writer. Return only the enhanced content, no explanations or additional text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const enhancedContent = data.choices[0].message.content.trim();

      return new Response(
        JSON.stringify({ [sectionType]: enhancedContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhanced comprehensive prompt for all sections
    const comprehensivePrompt = `You're a professional resume writing assistant. Enhance the following resume sections to be compelling, ATS-optimized, and achievement-focused.

Transform each section as follows:

SUMMARY (make it a powerful 2-3 sentence value proposition):
${summary || 'Professional with experience in their field'}

EXPERIENCE (convert to achievement-focused bullet points with metrics):
${experience || 'Various professional roles and responsibilities'}

SKILLS (organize technical and soft skills professionally):
${skills || 'Various professional skills and competencies'}

EDUCATION (format professionally with degrees and institutions):
${education || 'Educational background and qualifications'}

Return a JSON object with this exact structure:
{
  "summary": "Enhanced professional summary...",
  "experience": "Enhanced experience with achievements...",
  "skills": "Organized technical and soft skills...",
  "education": "Professional education formatting..."
}

Focus on:
- Quantifiable achievements and metrics
- Action verbs and power words
- ATS optimization with relevant keywords
- Professional tone and clarity
- Industry-specific terminology`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert resume writer. Return only valid JSON with the enhanced resume sections. No additional text or explanations.'
          },
          {
            role: 'user',
            content: comprehensivePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(enhancedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      console.error('Raw response:', enhancedContent);
      throw new Error('Invalid JSON response from AI');
    }

    console.log('Successfully enhanced resume sections');

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhance-resume function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Enhancement failed',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});