import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const openai_api_key = Deno.env.get("OPENAI_API_KEY")
const supabase_url = Deno.env.get("SUPABASE_URL")
const supabase_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(supabase_url!, supabase_key!)

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { resumeText, userId } = await req.json()

    if (!resumeText || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt = `You are an advanced resume parsing engine. Extract structured resume data from the provided text and return ONLY valid JSON.

Required output format:
{
  "personal_info": {
    "name": "string",
    "email": "string", 
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "website": "string"
  },
  "summary": "string",
  "experience": [
    {
      "title": "string",
      "company": "string", 
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "achievements": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string", 
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "grade": "string"
    }
  ],
  "skills": ["string"],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "YYYY-MM",
      "url": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string"
    }
  ],
  "languages": [
    {
      "language": "string",
      "proficiency": "string"
    }
  ],
  "awards": [
    {
      "name": "string",
      "issuer": "string", 
      "date": "YYYY-MM"
    }
  ],
  "hobbies": ["string"]
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openai_api_key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract structured data from this resume:\n\n${resumeText}` }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    })

    const result = await response.json()
    const extractedData = result.choices?.[0]?.message?.content

    if (!extractedData) {
      throw new Error('Failed to extract resume data')
    }

    // Parse the JSON response
    let parsedData
    try {
      parsedData = JSON.parse(extractedData)
    } catch (error) {
      console.error('Failed to parse JSON:', extractedData)
      throw new Error('Invalid JSON response from AI')
    }

    return new Response(JSON.stringify({
      success: true,
      data: parsedData
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('Error in extract-resume function:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})