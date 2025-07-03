import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { 
      type, 
      job_title, 
      industry_domain, 
      employment_type, 
      work_mode, 
      location_city, 
      experience_level, 
      required_skills = [], 
      company_name = '',
      existing_content = ''
    } = await req.json();

    let prompt = '';
    
    if (type === 'job_summary') {
      prompt = `Write a professional job summary for the role of ${job_title} in the ${industry_domain || 'technology'} industry. 
The role is ${employment_type} and ${work_mode} based in ${location_city}. 
Mention the team structure, main focus of the role, and how it contributes to the company's goals.
Use 2–4 sentences. Keep it engaging and clear.`;
    } 
    else if (type === 'job_description') {
      prompt = `Write a comprehensive job description for a ${job_title} at ${company_name || 'a leading company'} in the ${industry_domain || 'technology'} domain.
Include:
- A brief intro to the company and its culture
- The role's objectives and day-to-day tasks
- Tools/technologies used (${required_skills.join(', ') || 'relevant industry tools'})
- Collaboration (team, stakeholders)
- Career growth, learning opportunities, and reporting structure

Keep it professional, engaging, and under 300 words.`;
    }
    else if (type === 'key_responsibilities') {
      prompt = `List the key responsibilities for a ${job_title} in ${industry_domain || 'technology'} domain with ${experience_level} experience.
Use bullet points and include specifics related to the role, such as managing projects, technical tasks, customer interactions, reporting, etc.
Return exactly 6-8 clear, actionable items as a JSON array of strings.`;
    }
    else if (type === 'regenerate') {
      prompt = `Rewrite and improve the following content for a ${job_title} position:

"${existing_content}"

Make it more engaging, professional, and comprehensive while maintaining the same format and structure.`;
    }

    console.log('Generating AI content for:', type, 'with prompt:', prompt);

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
            content: 'You are a professional HR assistant that creates compelling job content. Always return clear, professional content that attracts qualified candidates.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content:', generatedContent);

    // If generating key responsibilities, try to parse as JSON array
    if (type === 'key_responsibilities') {
      try {
        const responsibilities = JSON.parse(generatedContent);
        if (Array.isArray(responsibilities)) {
          return new Response(JSON.stringify({ content: responsibilities, type }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (e) {
        // If JSON parsing fails, split by bullet points or newlines
        const responsibilities = generatedContent
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => line.length > 0)
          .slice(0, 8);
        
        return new Response(JSON.stringify({ content: responsibilities, type }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ content: generatedContent.trim(), type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-job-generator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});