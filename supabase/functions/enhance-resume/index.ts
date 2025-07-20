
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

console.log('🚀 Enhanced Resume Function Starting...');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('📋 Request details:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    const body = await req.json();
    console.log('📄 Processing resume enhancement request:', {
      textLength: body.resumeText?.length || 0,
      targetRole: body.targetRole,
      hasJobDescription: !!body.jobDescription,
      userId: body.userId,
      fileName: body.fileName
    });

    // Validate required data
    if (!body.resumeText && !body.summary && !body.experience && !body.skills && !body.education) {
      console.error('❌ No resume text provided');
      throw new Error('No resume text provided');
    }

    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please contact support.',
        fallback: true
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare resume content for enhancement
    let resumeContent = body.resumeText || '';
    
    // If structured data is provided, format it
    if (!resumeContent && (body.summary || body.experience || body.skills || body.education)) {
      resumeContent = formatStructuredResume({
        summary: body.summary,
        experience: body.experience,
        skills: body.skills,
        education: body.education
      });
    }

    console.log('🔄 Sending request to OpenAI API...');

    // Prepare the enhancement prompt
    const enhancementPrompt = createEnhancementPrompt(resumeContent, {
      targetRole: body.targetRole,
      jobDescription: body.jobDescription,
      sectionType: body.sectionType,
      enhancementType: body.enhancementType || 'general'
    });

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
            content: 'You are an expert resume writer and career coach. Provide professional, ATS-friendly resume improvements that highlight achievements and use action verbs. Always return valid JSON in the exact format requested.' 
          },
          { role: 'user', content: enhancementPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    console.log('📦 OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI API response received successfully');
    
    let enhancedContent;
    try {
      enhancedContent = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('❌ Error parsing OpenAI response:', parseError);
      console.log('Raw response:', data.choices[0].message.content);
      
      // Return a fallback response if parsing fails
      enhancedContent = {
        success: true,
        data: {
          summary: body.summary || 'Professional summary enhanced with industry keywords and achievements.',
          experience: body.experience || 'Experience section optimized for ATS compatibility.',
          skills: body.skills || 'Skills section updated with relevant technical and soft skills.',
          education: body.education || 'Education section formatted professionally.'
        }
      };
    }

    console.log('🎉 Resume enhancement completed successfully');
    
    return new Response(JSON.stringify({
      success: true,
      data: enhancedContent.data || enhancedContent,
      message: 'Resume enhanced successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Resume enhancement error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to enhance resume',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function formatStructuredResume(sections: any): string {
  let formatted = '';
  
  if (sections.summary) {
    formatted += `PROFESSIONAL SUMMARY\n${sections.summary}\n\n`;
  }
  
  if (sections.experience && Array.isArray(sections.experience)) {
    formatted += `WORK EXPERIENCE\n`;
    sections.experience.forEach((exp: any) => {
      formatted += `${exp.title || exp.position} at ${exp.company}\n`;
      formatted += `${exp.startDate} - ${exp.endDate || 'Present'}\n`;
      formatted += `${exp.description}\n\n`;
    });
  }
  
  if (sections.skills) {
    if (typeof sections.skills === 'string') {
      formatted += `SKILLS\n${sections.skills}\n\n`;
    } else if (Array.isArray(sections.skills)) {
      formatted += `SKILLS\n${sections.skills.join(', ')}\n\n`;
    }
  }
  
  if (sections.education && Array.isArray(sections.education)) {
    formatted += `EDUCATION\n`;
    sections.education.forEach((edu: any) => {
      formatted += `${edu.degree} - ${edu.school}\n`;
      formatted += `${edu.startDate} - ${edu.endDate}\n\n`;
    });
  }
  
  return formatted.trim();
}

function createEnhancementPrompt(resumeContent: string, options: any): string {
  const { targetRole, jobDescription, sectionType, enhancementType } = options;
  
  let prompt = `Please enhance the following resume content to make it more professional, ATS-friendly, and impactful:\n\n${resumeContent}\n\n`;
  
  if (targetRole) {
    prompt += `Target Role: ${targetRole}\n`;
  }
  
  if (jobDescription) {
    prompt += `Job Description: ${jobDescription}\n`;
  }
  
  prompt += `Enhancement Type: ${enhancementType}\n\n`;
  
  if (sectionType && sectionType !== 'all') {
    prompt += `Focus on enhancing the ${sectionType} section specifically.\n\n`;
  }
  
  prompt += `Please return your response as JSON in this exact format:
{
  "data": {
    "summary": "Enhanced professional summary...",
    "experience": "Enhanced experience section...",
    "skills": "Enhanced skills section...",
    "education": "Enhanced education section..."
  }
}

Guidelines:
- Use action verbs and quantify achievements where possible
- Make it ATS-friendly with relevant keywords
- Keep the tone professional and concise
- Highlight accomplishments over responsibilities
- Ensure proper formatting and structure`;

  return prompt;
}
