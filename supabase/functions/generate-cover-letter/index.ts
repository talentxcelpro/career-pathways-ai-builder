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
    const { resumeData, jobTitle, companyName, jobDescription = null, tone = 'professional', userId } = await req.json()

    if (!resumeData || !jobTitle || !companyName || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt = `You are a professional cover letter writer. Create compelling, personalized cover letters that highlight relevant experience and skills from the provided resume data.

Guidelines:
- Keep it concise (300-350 words maximum)
- Use a ${tone} tone
- Highlight 2-3 most relevant experiences or achievements
- Show genuine interest in the company and role
- Include a strong opening and closing
- Make it ATS-friendly with relevant keywords
- Avoid generic phrases and clichés`

    const userPrompt = `Create a cover letter for this application:

Position: ${jobTitle}
Company: ${companyName}
${jobDescription ? `Job Description: ${jobDescription}` : ''}

Resume Data:
Name: ${resumeData.personal_info?.name || 'Candidate'}
Professional Summary: ${resumeData.summary || 'Not provided'}

Recent Experience:
${JSON.stringify(resumeData.experience?.slice(0, 3) || [])}

Key Skills: ${JSON.stringify(resumeData.skills?.slice(0, 10) || [])}

Education: ${JSON.stringify(resumeData.education?.slice(0, 2) || [])}

Create a compelling cover letter that connects the candidate's experience to the job requirements. Return only the cover letter text, no additional formatting or explanation.`

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
        max_tokens: 1500,
      }),
    })

    const result = await response.json()
    const coverLetter = result.choices?.[0]?.message?.content

    if (!coverLetter) {
      throw new Error('Failed to generate cover letter')
    }

    return new Response(JSON.stringify({
      success: true,
      coverLetter: coverLetter.trim(),
      jobTitle,
      companyName,
      tone,
      wordCount: coverLetter.trim().split(/\s+/).length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('Error in generate-cover-letter function:', error)
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