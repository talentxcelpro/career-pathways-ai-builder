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
    const { resumeData, section, jobTitle = null, userId } = await req.json()

    if (!resumeData || !section || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let systemPrompt = ''
    let userPrompt = ''

    switch (section) {
      case 'summary':
        systemPrompt = `You are a professional resume writer. Enhance the provided summary to be more impactful, keyword-rich, and compelling. Focus on achievements, skills, and value proposition.`
        userPrompt = `Enhance this resume summary${jobTitle ? ` for a ${jobTitle} position` : ''}:

Current summary: ${resumeData.summary || 'No summary provided'}

Professional background: ${JSON.stringify(resumeData.experience || [])}

Return only the enhanced summary text, no additional formatting or explanation.`
        break

      case 'experience':
        systemPrompt = `You are a professional resume writer. Enhance work experience descriptions to be more impactful using action verbs, quantified achievements, and relevant keywords.`
        userPrompt = `Enhance these work experience entries${jobTitle ? ` for a ${jobTitle} position` : ''}:

${JSON.stringify(resumeData.experience || [])}

Return enhanced experience array in the same JSON format with improved achievement descriptions. Focus on metrics, impact, and relevant keywords.`
        break

      case 'skills':
        systemPrompt = `You are a professional resume writer. Enhance and optimize the skills section by categorizing skills, adding relevant keywords, and suggesting additional skills based on the experience.`
        userPrompt = `Enhance this skills section${jobTitle ? ` for a ${jobTitle} position` : ''}:

Current skills: ${JSON.stringify(resumeData.skills || [])}
Experience: ${JSON.stringify(resumeData.experience || [])}

Return an enhanced skills array with categorized, relevant, and keyword-optimized skills.`
        break

      case 'complete':
        systemPrompt = `You are a professional resume writer. Provide comprehensive enhancement suggestions for the entire resume including specific improvements for each section.`
        userPrompt = `Provide enhancement suggestions for this resume${jobTitle ? ` targeting a ${jobTitle} position` : ''}:

${JSON.stringify(resumeData)}

Return suggestions in this format:
{
  "enhanced_summary": "enhanced summary text",
  "enhanced_experience": [enhanced experience array],
  "enhanced_skills": [enhanced skills array],
  "suggestions": [
    {
      "section": "section name",
      "current": "current content",
      "suggested": "suggested improvement",
      "reason": "why this improvement helps"
    }
  ],
  "ats_keywords": ["relevant keywords for ATS optimization"],
  "overall_score": 85
}`
        break

      default:
        throw new Error('Invalid section type')
    }

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
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    const result = await response.json()
    const enhancedContent = result.choices?.[0]?.message?.content

    if (!enhancedContent) {
      throw new Error('Failed to enhance resume content')
    }

    // For complete enhancement, try to parse as JSON
    let enhancedData = enhancedContent
    if (section === 'complete' || section === 'experience' || section === 'skills') {
      try {
        enhancedData = JSON.parse(enhancedContent)
      } catch (error) {
        console.warn('Could not parse as JSON, returning as text')
      }
    }

    return new Response(JSON.stringify({
      success: true,
      section,
      enhanced: enhancedData,
      original: resumeData[section]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('Error in enhance-resume function:', error)
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