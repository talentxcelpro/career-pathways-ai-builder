import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, type, options = {} } = await req.json();
    
    console.log('Starting AI text parsing for content type:', type);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process content with AI
    const structuredData = await parseTextWithAI(content, type, options, openAIApiKey);

    // Log usage
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          await supabase.from('ai_usage_logs').insert({
            user_id: user.id,
            feature_type: 'text_parsing',
            request_type: 'content_processing',
            tokens_used: Math.ceil(content.length / 4), // Rough token estimate
            success: true,
            request_data: { contentType: type, options },
            response_data: { extracted: true, confidence: structuredData.confidence }
          });
        }
      } catch (error) {
        console.error('Failed to log usage:', error);
      }
    }

    return new Response(
      JSON.stringify(structuredData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-resume-parser function:', error);
    
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

async function parseTextWithAI(content: string, type: string, options: any, apiKey: string): Promise<any> {
  let systemMessage = 'You are an expert resume parser that extracts structured information from career-related text. Always return valid JSON.';
  let userPrompt = '';

  if (type === 'linkedin') {
    systemMessage = 'You are an expert at parsing LinkedIn profiles and converting them into structured resume data.';
    userPrompt = `
Parse the following LinkedIn profile content and convert it into a structured resume format.
Extract all relevant information and enhance descriptions to be more resume-appropriate.

LinkedIn Content:
${content}

Return a JSON object with this structure:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email if found",
    "phone": "phone if found",
    "location": "location",
    "linkedin": "linkedin profile url",
    "website": "personal website if found"
  },
  "summary": "Professional summary based on LinkedIn headline and about section",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name", 
      "location": "City, State",
      "startDate": "Start Date",
      "endDate": "End Date or Present",
      "current": false,
      "description": "Enhanced job description with achievements"
    }
  ],
  "education": [...],
  "skills": [...],
  "projects": [...],
  "certifications": [...],
  "confidence": 0.8
}`;
  } else {
    userPrompt = `
Extract and structure the following career content into a resume JSON format.
Be thorough and accurate in extracting all relevant information.

${options.enhanceContent ? 'Also enhance descriptions to be more impactful and professional.' : ''}

Content:
${content}

Return a JSON object with this structure:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "city, state/country",
    "linkedin": "linkedin profile url",
    "website": "personal website or portfolio"
  },
  "summary": "Professional summary or objective statement",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State", 
      "startDate": "Start Date",
      "endDate": "End Date or Present",
      "current": false,
      "description": "Enhanced job description with achievements and impact"
    }
  ],
  "education": [
    {
      "degree": "Degree Type and Major",
      "institution": "School/University Name",
      "location": "City, State",
      "graduationDate": "Graduation Date",
      "gpa": "GPA if mentioned"
    }
  ],
  "skills": [
    {
      "name": "Skill Name",
      "level": "Beginner|Intermediate|Advanced|Expert"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["tech1", "tech2"],
      "link": "project url if available"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization", 
      "date": "Issue Date"
    }
  ],
  "confidence": 0.85
}

Return only the JSON object, no additional text.`;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const responseContent = data.choices[0].message.content;

  try {
    return JSON.parse(responseContent);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', responseContent);
    return {
      personalInfo: {},
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      confidence: 0.3,
      error: 'Failed to parse content structure'
    };
  }
}