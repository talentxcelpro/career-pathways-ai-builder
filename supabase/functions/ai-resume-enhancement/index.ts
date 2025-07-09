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
        systemPrompt = `You are an ATS optimization expert specializing in making resumes machine-readable and keyword-rich.

FOCUS AREAS:
- Add industry-specific keywords and action verbs
- Use standard section headers (Summary, Experience, Education, Skills)
- Convert passive descriptions to active achievement statements
- Include measurable results (percentages, numbers, dollar amounts)
- Optimize skill keywords for job matching algorithms
- Ensure proper formatting and structure

TRANSFORMATION RULES:
- "Responsible for managing" → "Managed and optimized"
- Add metrics: "team" → "team of 8 members"
- Include impact: "improved processes" → "improved processes resulting in 25% efficiency gain"
- Use power verbs: Achieved, Optimized, Implemented, Streamlined, Delivered

Return enhanced JSON with improved ATS compatibility.`;
        break;
      case 'achievements':
        systemPrompt = `You are a results-focused career strategist. Transform all job responsibilities into quantified achievements.

TRANSFORMATION APPROACH:
- Convert every responsibility into a measurable outcome
- Add specific numbers, percentages, and timeframes
- Highlight business impact and cost savings
- Use action verbs that demonstrate leadership and results
- Show progression and growth in responsibilities

EXAMPLES:
- "Handled customer service" → "Resolved 95% of customer inquiries within 24 hours, achieving 4.8/5 satisfaction rating"
- "Managed projects" → "Led 12+ cross-functional projects worth $2M+, delivering 100% on-time completion"
- "Worked with team" → "Collaborated with 15-member team to increase productivity by 30%"

Focus on ROI, efficiency gains, growth metrics, and business outcomes.`;
        break;
      case 'professional':
        systemPrompt = `You are a professional writing expert specializing in executive-level resume language.

ENHANCEMENT FOCUS:
- Elevate language to C-suite/executive level
- Remove casual or weak language
- Use industry-specific terminology appropriately
- Ensure consistent professional tone throughout
- Improve sentence structure and flow
- Remove redundancy and filler words

LANGUAGE IMPROVEMENTS:
- "Good at" → "Expertise in"
- "Helped with" → "Instrumental in driving"
- "Did work on" → "Spearheaded initiatives for"
- Simple past tense → Dynamic action statements

Create polished, executive-ready content with sophisticated vocabulary.`;
        break;
      case 'general':
        systemPrompt = `You are a comprehensive resume enhancement specialist. Improve all aspects of the resume content.

MULTI-FACETED ENHANCEMENT:
- Professional language and tone
- Quantified achievements and metrics
- ATS-optimized keywords
- Clear, impactful formatting
- Stronger action verbs and power words
- Industry-relevant terminology
- Logical flow and structure

COMPREHENSIVE IMPROVEMENTS:
- Enhance weak bullet points with specific accomplishments
- Add missing metrics and quantifiable results
- Improve professional summary with key value propositions
- Optimize skills section with relevant keywords
- Ensure consistency in formatting and style

Transform the entire resume into a compelling, professional document.`;
        break;
      default:
        systemPrompt = `You are a comprehensive resume enhancement expert. Analyze the provided content and improve it for maximum impact, ATS compatibility, and professional presentation. Focus on quantified achievements, professional language, and keyword optimization.`;
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