import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    return new Response(
      JSON.stringify({ 
        status: 'healthy',
        hasOpenAIKey: !!openAIApiKey,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { file, options } = await req.json();
    
    if (!file || !file.data) {
      throw new Error('No file data provided');
    }

    console.log('Processing file:', file.name, 'Size:', file.size);

    // Decode base64 file data
    const fileBuffer = Uint8Array.from(atob(file.data), c => c.charCodeAt(0));
    
    // For now, let's extract text content based on file type
    let textContent = '';
    
    if (file.type === 'application/pdf') {
      // For PDF files, we'll use a simple text extraction approach
      // In production, you'd want to use a proper PDF parsing library
      textContent = 'PDF content extraction - please implement proper PDF parsing';
    } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
      // For Word documents
      textContent = 'Word document content - please implement proper DOCX parsing';
    } else if (file.type === 'text/plain') {
      textContent = new TextDecoder().decode(fileBuffer);
    } else {
      throw new Error('Unsupported file type: ' + file.type);
    }

    // Use OpenAI to extract structured data from the text
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a resume parser. Extract structured data from the resume text and return it as JSON with the following structure:
            {
              "personalInfo": {
                "name": "Full Name",
                "email": "email@example.com",
                "phone": "phone number",
                "location": "city, state",
                "linkedin": "linkedin url",
                "website": "website url"
              },
              "summary": "Professional summary text",
              "experience": [
                {
                  "title": "Job Title",
                  "company": "Company Name",
                  "location": "Location",
                  "startDate": "Start Date",
                  "endDate": "End Date or Present",
                  "description": "Job description and achievements"
                }
              ],
              "education": [
                {
                  "degree": "Degree",
                  "institution": "School Name",
                  "location": "Location",
                  "graduationDate": "Graduation Date",
                  "gpa": "GPA if mentioned"
                }
              ],
              "skills": ["skill1", "skill2", "skill3"],
              "projects": [
                {
                  "name": "Project Name",
                  "description": "Project description",
                  "technologies": "Technologies used",
                  "link": "Project link if available"
                }
              ],
              "certifications": [
                {
                  "name": "Certification Name",
                  "issuer": "Issuing Organization",
                  "date": "Date obtained"
                }
              ]
            }
            
            Return only valid JSON, no additional text.`
          },
          {
            role: 'user',
            content: `Parse this resume text: ${textContent}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const extractedContent = aiResponse.choices[0].message.content;

    try {
      const parsedData = JSON.parse(extractedContent);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: parsedData,
          confidence: 0.8,
          message: 'Resume processed successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', extractedContent);
      throw new Error('Failed to parse AI response');
    }

  } catch (error) {
    console.error('Error in ai-resume-extraction:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Processing failed',
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});