import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, options = {} } = await req.json();
    
    console.log('Starting AI resume extraction for file:', file.name);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Decode base64 file data
    const fileData = atob(file.data);
    let extractedText = '';

    // Extract text based on file type
    if (file.type === 'application/pdf') {
      extractedText = await extractPDFText(fileData);
    } else if (file.type.includes('word') || file.type.includes('document')) {
      extractedText = await extractWordText(fileData);
    } else if (file.type === 'text/plain') {
      extractedText = fileData;
    } else if (file.type.startsWith('image/')) {
      extractedText = await extractImageText(fileData, file.type);
    } else {
      throw new Error('Unsupported file format');
    }

    console.log('Text extracted, length:', extractedText.length);

    // Use OpenAI to structure the extracted data
    const structuredData = await processWithAI(extractedText, options, openAIApiKey);

    // Log usage
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          await supabase.from('ai_usage_logs').insert({
            user_id: user.id,
            feature_type: 'resume_extraction',
            request_type: 'file_processing',
            tokens_used: Math.ceil(extractedText.length / 4), // Rough token estimate
            success: true,
            request_data: { fileName: file.name, fileType: file.type },
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
    console.error('Error in ai-resume-extraction function:', error);
    
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

async function extractPDFText(fileData: string): Promise<string> {
  // For now, return a basic text extraction
  // In production, you'd use a proper PDF parsing library
  console.log('PDF text extraction - using basic method');
  return fileData.slice(0, 5000); // Simplified for demo
}

async function extractWordText(fileData: string): Promise<string> {
  // For now, return a basic text extraction
  // In production, you'd use mammoth.js or similar
  console.log('Word document text extraction - using basic method');
  return fileData.slice(0, 5000); // Simplified for demo
}

async function extractImageText(fileData: string, mimeType: string): Promise<string> {
  // For now, return a placeholder
  // In production, you'd use OCR like Tesseract or Google Vision API
  console.log('Image OCR extraction - using placeholder');
  return 'OCR text extraction would be implemented here';
}

async function processWithAI(text: string, options: any, apiKey: string): Promise<any> {
  const prompt = `
Extract and structure the following resume information into a JSON format. 
Please be thorough and accurate in extracting all relevant information.

${options.enhanceDescriptions ? 'Also enhance job descriptions to be more impactful and quantified where possible.' : ''}

Resume Text:
${text}

Please return a JSON object with the following structure:
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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume parser that extracts structured information from resume text. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', content);
    // Return a basic structure if parsing fails
    return {
      personalInfo: {},
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      confidence: 0.3,
      error: 'Failed to parse resume structure'
    };
  }
}