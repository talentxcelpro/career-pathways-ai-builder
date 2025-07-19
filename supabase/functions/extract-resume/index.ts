
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, fileName, fileType } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Processing resume: ${fileName} (${fileType})`);
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(filePath);
    
    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert file to base64 for processing
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));

    console.log('File downloaded and converted to base64');

    // Use OpenAI to extract resume content
    const extractionPrompt = `
You are a professional resume parser. Extract ALL information from this resume and return it as a structured JSON object.

IMPORTANT INSTRUCTIONS:
1. Extract EVERY piece of information, no matter how small
2. Maintain original formatting and context
3. Be extremely thorough and accurate
4. If information is unclear, make your best interpretation
5. Include confidence scores for each section

Return JSON in this EXACT structure:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string", 
    "phone": "string",
    "location": "string",
    "website": "string",
    "linkedin": "string"
  },
  "summary": "string - professional summary/objective",
  "experience": [
    {
      "id": "unique_id",
      "title": "job title",
      "company": "company name", 
      "location": "work location",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "current": boolean,
      "description": "detailed description",
      "achievements": ["achievement 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "id": "unique_id",
      "degree": "degree type and major",
      "school": "institution name",
      "location": "school location", 
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "gpa": "if available"
    }
  ],
  "skills": [
    {
      "id": "unique_id",
      "name": "skill name",
      "category": "technical|soft|language",
      "level": "beginner|intermediate|advanced|expert"
    }
  ],
  "confidence": {
    "overall": 0.95,
    "personalInfo": 0.98,
    "experience": 0.92,
    "education": 0.90,
    "skills": 0.85
  },
  "extractionNotes": ["any important notes about the extraction"]
}

Parse this resume thoroughly and extract all information:
`;

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
            content: extractionPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please extract all information from this ${fileType} resume file. File name: ${fileName}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${fileType};base64,${base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const extractedContent = aiResponse.choices[0].message.content;

    console.log('AI extraction completed');

    // Parse the JSON response
    let parsedResume;
    try {
      // Clean the response to extract just the JSON
      const jsonMatch = extractedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResume = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', extractedContent);
      throw new Error('Failed to parse extraction results');
    }

    // Add IDs to items that don't have them
    if (parsedResume.experience) {
      parsedResume.experience = parsedResume.experience.map((exp: any, index: number) => ({
        ...exp,
        id: exp.id || `exp_${Date.now()}_${index}`
      }));
    }

    if (parsedResume.education) {
      parsedResume.education = parsedResume.education.map((edu: any, index: number) => ({
        ...edu,
        id: edu.id || `edu_${Date.now()}_${index}`
      }));
    }

    if (parsedResume.skills) {
      parsedResume.skills = parsedResume.skills.map((skill: any, index: number) => ({
        ...skill,
        id: skill.id || `skill_${Date.now()}_${index}`
      }));
    }

    // Set default template
    parsedResume.selectedTemplate = 'modern-professional';

    const result = {
      success: true,
      resume: parsedResume,
      confidence: parsedResume.confidence?.overall || 0.9,
      extractionNotes: parsedResume.extractionNotes || []
    };

    console.log('Resume extraction successful');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-resume function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      confidence: 0,
      errors: [error.message || 'Unknown error occurred'],
      resume: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
