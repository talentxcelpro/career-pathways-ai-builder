import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SkillEnrichmentRequest {
  job_title: string;
  industry?: string;
  description?: string;
  experience_level?: string;
  employment_type?: string;
}

interface SkillEnrichmentResponse {
  success: boolean;
  skills: string[];
  rationale?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const requestData: SkillEnrichmentRequest = await req.json();
    const { job_title, industry, description, experience_level, employment_type } = requestData;

    console.log('🔄 Processing skill enrichment for:', { job_title, industry, experience_level });

    if (!job_title) {
      return new Response(JSON.stringify({ 
        error: 'job_title is required',
        success: false,
        skills: []
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build context for AI prompt
    const contextParts = [job_title];
    if (industry) contextParts.push(`in ${industry}`);
    if (experience_level) contextParts.push(`(${experience_level} level)`);
    if (employment_type) contextParts.push(`(${employment_type})`);
    
    const jobContext = contextParts.join(' ');
    
    const prompt = `Generate 6-8 highly relevant, specific technical and professional skills for a "${jobContext}" role.

Requirements:
- Focus on technical skills, tools, and technologies specific to this role
- Include relevant soft skills only if they're crucial for the role
- Avoid generic terms like "Communication", "Teamwork", "Problem Solving"
- Use industry-standard skill names and technologies
- Consider the experience level when suggesting skills
- Return skills that would actually be listed in job requirements

Examples:
- Sales Executive: CRM Software, Cold Calling, Lead Generation, Salesforce, Negotiation, Pipeline Management
- React Developer: React.js, JavaScript, TypeScript, Redux, Node.js, REST APIs, Git
- Financial Analyst: Excel, SQL, Python, Tableau, Financial Modeling, Bloomberg Terminal
- UI/UX Designer: Figma, Adobe XD, Sketch, Prototyping, User Research, Wireframing

Job Context: ${jobContext}
${description ? `\nJob Description Context: ${description.slice(0, 500)}...` : ''}

Return ONLY a comma-separated list of 6-8 skills, no explanations:`;

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
            content: 'You are a skills expert that generates highly relevant, specific skills for job roles. Always return exactly 6-8 skills as a comma-separated list with no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const skillsText = aiResponse.choices[0]?.message?.content?.trim() || '';
    
    // Parse and clean skills
    const skills = skillsText
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0 && skill.length < 50)
      .slice(0, 8); // Ensure max 8 skills

    console.log('✅ Generated skills:', skills);

    if (skills.length === 0) {
      throw new Error('No valid skills generated');
    }

    const result: SkillEnrichmentResponse = {
      success: true,
      skills,
      rationale: `Generated ${skills.length} relevant skills for ${jobContext}`
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Skill enrichment error:', error);
    
    const errorResponse: SkillEnrichmentResponse = {
      success: false,
      skills: [],
      error: error.message || 'Failed to generate skills'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});