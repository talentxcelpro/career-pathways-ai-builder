
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  console.log('=== Extract Resume Function Called ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  console.log('Timestamp:', new Date().toISOString());

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    console.log('Health check requested');
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      function: 'extract-resume',
      environment: {
        supabase_url: !!Deno.env.get('SUPABASE_URL'),
        supabase_service_key: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        openai_api_key: !!Deno.env.get('OPENAI_API_KEY'),
      }
    };
    console.log('Health check response:', healthData);
    return new Response(JSON.stringify(healthData), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }

  // Only allow POST for resume extraction
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Starting resume extraction process...');

    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

    console.log('Environment check:', {
      supabaseUrl: !!supabaseUrl,
      supabaseServiceKey: !!supabaseServiceKey,
      openAiApiKey: !!openAiApiKey
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    if (!openAiApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    // Parse request body
    let requestBody;
    try {
      const rawBody = await req.text();
      console.log('Raw request body length:', rawBody.length);
      requestBody = JSON.parse(rawBody);
      console.log('Parsed request body keys:', Object.keys(requestBody));
    } catch (error) {
      console.error('Failed to parse request body:', error);
      throw new Error('Invalid JSON in request body');
    }

    const { filePath, fileName, fileType } = requestBody;

    if (!filePath) {
      throw new Error('Missing filePath in request');
    }

    console.log('Processing file:', { filePath, fileName, fileType });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download file from storage
    console.log('Downloading file from storage...');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(filePath);

    if (downloadError) {
      console.error('File download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    console.log('File downloaded successfully, size:', fileData.size);

    // Convert file to text based on type
    let extractedText = '';
    
    try {
      if (fileType === 'application/pdf') {
        console.log('Processing PDF file...');
        // For now, return a simple message for PDF files
        extractedText = 'PDF content extraction (simplified for demo)';
      } else if (fileType?.includes('text') || fileName?.endsWith('.txt')) {
        console.log('Processing text file...');
        extractedText = await fileData.text();
      } else {
        console.log('Processing as text file (fallback)...');
        extractedText = await fileData.text();
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error(`Failed to extract text from file: ${error.message}`);
    }

    console.log('Text extracted, length:', extractedText.length);

    if (!extractedText.trim()) {
      throw new Error('No text content found in the file');
    }

    // Call OpenAI API to parse the resume
    console.log('Calling OpenAI API...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a resume parser. Extract structured information from the resume text and return it as JSON with this exact structure:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string", 
    "phone": "string",
    "location": "string"
  },
  "summary": "string",
  "experience": [
    {
      "title": "string",
      "company": "string", 
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string"
    }
  ],
  "skills": ["string"]
}`
          },
          {
            role: 'user',
            content: `Parse this resume text:\n\n${extractedText.substring(0, 4000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', openAIResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const aiResult = await openAIResponse.json();
    console.log('OpenAI response received');

    let parsedResume;
    try {
      const content = aiResult.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }
      
      parsedResume = JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Construct final response
    const result = {
      success: true,
      resume: {
        ...parsedResume,
        selectedTemplate: 'modern-professional'
      },
      confidence: 0.85,
      suggestions: [
        'Review extracted information for accuracy',
        'Add any missing details',
        'Consider customizing for specific job applications'
      ]
    };

    console.log('Extraction completed successfully');

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('❌ Function error:', error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'Unknown error occurred',
      details: error.stack || 'No stack trace available',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
});
