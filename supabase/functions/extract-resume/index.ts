
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

// Simple PDF text extraction helper
function extractPdfText(uint8Array: Uint8Array): string {
  try {
    const decoder = new TextDecoder();
    const pdfString = decoder.decode(uint8Array);
    
    // Look for text objects in PDF
    const textMatches = pdfString.match(/\(([^)]+)\)/g);
    if (textMatches) {
      const extractedText = textMatches
        .map(match => match.slice(1, -1))
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text))
        .join(' ');
      
      if (extractedText.length > 50) {
        return extractedText;
      }
    }
    
    // Fallback: look for readable text patterns
    const readableText = pdfString.match(/[A-Za-z][A-Za-z\s.,;:!?-]{10,}/g);
    if (readableText && readableText.length > 0) {
      return readableText.join(' ').substring(0, 2000);
    }
    
    return '';
  } catch (error) {
    console.log('PDF text extraction failed:', error);
    return '';
  }
}

// DOC/DOCX text extraction helper
function extractDocText(uint8Array: Uint8Array): string {
  try {
    const decoder = new TextDecoder();
    const docString = decoder.decode(uint8Array);
    
    // For .doc files, try to extract readable text
    const textPattern = /[A-Za-z][A-Za-z\s.,;:!?-]{20,}/g;
    const matches = docString.match(textPattern);
    
    if (matches && matches.length > 0) {
      return matches.join(' ').substring(0, 3000);
    }
    
    return '';
  } catch (error) {
    console.log('DOC text extraction failed:', error);
    return '';
  }
}

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

    // Convert file to array buffer for processing
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log('File downloaded, attempting text extraction...');

    // Extract text content from file based on file type
    let textContent = '';
    let extractionMethod = '';
    
    if (fileType === 'application/pdf') {
      textContent = extractPdfText(uint8Array);
      extractionMethod = 'PDF parsing';
    } else if (fileType === 'application/msword' || 
               fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      textContent = extractDocText(uint8Array);
      extractionMethod = 'DOC parsing';
    } else {
      // Try as plain text
      const decoder = new TextDecoder();
      textContent = decoder.decode(uint8Array);
      extractionMethod = 'Plain text';
    }

    console.log(`Text extraction completed using ${extractionMethod}. Length: ${textContent.length}`);

    // If no meaningful text was extracted, return an error
    if (!textContent || textContent.length < 50) {
      return new Response(JSON.stringify({
        success: false,
        confidence: 0,
        errors: [`Could not extract readable text from ${fileType} file. The file may be corrupted, password-protected, or in an unsupported format. Please try uploading a different file or create your resume manually.`],
        resume: null,
        extractionMethod
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use OpenAI to extract resume content
    const extractionPrompt = `You are a professional resume parser. Extract ALL information from the provided resume text and return it as a structured JSON object.

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

Parse this resume thoroughly and extract all information.`;

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
            content: `Please extract all information from this resume. File name: ${fileName}\n\nResume content:\n${textContent.substring(0, 8000)}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
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
      
      return new Response(JSON.stringify({
        success: false,
        confidence: 0,
        errors: ['Failed to parse the extracted resume data. The file content may be too complex or corrupted. Please try uploading a cleaner version or create your resume manually.'],
        resume: null,
        extractionMethod,
        rawResponse: extractedContent.substring(0, 500)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      extractionNotes: parsedResume.extractionNotes || [],
      extractionMethod
    };

    console.log('Resume extraction successful');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-resume function:', error);
    
    const errorMessage = error.message || 'Unknown error occurred';
    let userFriendlyMessage = errorMessage;
    
    // Provide more helpful error messages
    if (errorMessage.includes('OpenAI API')) {
      userFriendlyMessage = 'AI service temporarily unavailable. Please try again in a moment.';
    } else if (errorMessage.includes('Failed to download')) {
      userFriendlyMessage = 'Could not access the uploaded file. Please try uploading again.';
    } else if (errorMessage.includes('API key')) {
      userFriendlyMessage = 'Resume extraction service is not configured. Please contact support.';
    }
    
    return new Response(JSON.stringify({
      success: false,
      confidence: 0,
      errors: [userFriendlyMessage],
      resume: null,
      originalError: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
