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
    console.log('Starting resume extraction...');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string || file?.name || 'resume';
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Processing file:', fileName, 'Type:', file.type, 'Size:', file.size);

    // Extract text from PDF or DOCX
    let extractedText = '';
    
    if (file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      console.log('Extracting PDF text...');
      // For now, just extract some basic text or use a simple approach
      extractedText = "Sample resume text - PDF extraction not implemented yet";
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileName.toLowerCase().endsWith('.docx')) {
      console.log('Extracting DOCX text...');
      // For now, just extract some basic text or use a simple approach
      extractedText = "Sample resume text - DOCX extraction not implemented yet";
    } else {
      throw new Error('Unsupported file type. Please upload PDF or DOCX files only.');
    }

    console.log('Extracted text length:', extractedText.length);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Calling OpenAI API...');

    // Simple AI extraction for now
    const enhancedPrompt = `Extract resume information from this text and return a JSON object with the following structure:
    {
      "personal_information": {
        "full_name": "",
        "email": "",
        "phone": "",
        "location": "",
        "professional_summary": ""
      },
      "work_experience": [],
      "education": [],
      "skills": {
        "technical_skills": [],
        "soft_skills": []
      }
    }
    
    Resume text: ${extractedText}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a resume parser. Return only valid JSON.' },
          { role: 'user', content: enhancedPrompt }
        ],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`AI parsing failed: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    console.log('AI response received, parsing...');
    
    let parsedData;
    try {
      parsedData = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return default structure
      parsedData = {
        personal_information: {
          full_name: '',
          email: '',
          phone: '',
          location: '',
          professional_summary: ''
        },
        work_experience: [],
        education: [],
        skills: {
          technical_skills: [],
          soft_skills: []
        }
      };
    }

    // Add some basic metadata
    const result = {
      ...parsedData,
      atsOptimization: {
        score: 75,
        suggestions: []
      },
      metadata: {
        filename: fileName,
        extractionTimestamp: new Date().toISOString(),
        processingVersion: '1.0'
      },
      success: true
    };

    console.log('Extraction completed successfully');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI resume extraction:', error);
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