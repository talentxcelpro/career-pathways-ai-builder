
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

console.log('🚀 Enhanced Resume Function Starting...');

serve(async (req) => {
  console.log(`📍 Request received: ${req.method} from ${req.headers.get('Origin')}`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('📝 Processing resume enhancement request:', Object.keys(body));

    const { text, provider } = body;

    if (!text || text === 'null' || text.trim() === '') {
      console.log('⚠️ No valid resume text provided');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No resume content provided. Please upload or enter your resume content first.',
        enhancedContent: 'Please upload your resume or enter your resume content to get AI-powered enhancements and suggestions.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'AI enhancement service is currently unavailable. Please try again later.',
        enhancedContent: 'AI enhancement service is temporarily unavailable. Please contact support.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the text if it's JSON
    let resumeContent = text;
    try {
      if (typeof text === 'string' && text.startsWith('{')) {
        const parsed = JSON.parse(text);
        // Convert parsed resume data to readable text
        resumeContent = convertResumeDataToText(parsed);
      }
    } catch (e) {
      console.log('Text is not JSON, using as-is');
    }

    const prompt = `Please enhance the following resume content by improving clarity, impact, and professional presentation. Focus on:

1. Strengthening action verbs and quantifying achievements
2. Improving overall structure and flow
3. Enhancing professional language and tone
4. Ensuring ATS compatibility
5. Adding relevant keywords for better visibility

Resume content to enhance:
${resumeContent}

Provide an enhanced version that maintains all original information while improving presentation and impact. Return only the enhanced resume text without any additional formatting or explanations.`;

    console.log('🤖 Sending request to OpenAI...');
    
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
            content: 'You are a professional resume writer and career counselor. Your job is to enhance resume content while maintaining accuracy and truthfulness. Focus on improving clarity, impact, and professional presentation. Return only the enhanced resume content without additional formatting or explanations.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;

    console.log('✅ Resume enhancement completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      enhancedContent,
      originalLength: resumeContent.length,
      enhancedLength: enhancedContent.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in enhance-resume function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to enhance resume. Please try again.',
      enhancedContent: 'Enhancement failed. Please check your internet connection and try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function convertResumeDataToText(resumeData: any): string {
  let text = '';
  
  // Add personal info
  if (resumeData.personalInfo) {
    const info = resumeData.personalInfo;
    text += `${info.fullName || ''}\n`;
    text += `${info.email || ''} | ${info.phone || ''}\n`;
    text += `${info.location || ''}\n\n`;
  }
  
  // Add summary
  if (resumeData.summary) {
    text += `SUMMARY\n${resumeData.summary}\n\n`;
  }
  
  // Add experience
  if (resumeData.workExperience && Array.isArray(resumeData.workExperience)) {
    text += `WORK EXPERIENCE\n`;
    resumeData.workExperience.forEach((exp: any) => {
      text += `${exp.title || ''} at ${exp.company || ''}\n`;
      text += `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}\n`;
      text += `${exp.description || ''}\n`;
      if (exp.achievements && Array.isArray(exp.achievements)) {
        exp.achievements.forEach((achievement: string) => {
          text += `• ${achievement}\n`;
        });
      }
      text += '\n';
    });
  }
  
  // Add education
  if (resumeData.education && Array.isArray(resumeData.education)) {
    text += `EDUCATION\n`;
    resumeData.education.forEach((edu: any) => {
      text += `${edu.degree || ''} in ${edu.field || ''}\n`;
      text += `${edu.school || ''}, ${edu.graduationDate || ''}\n\n`;
    });
  }
  
  // Add skills
  if (resumeData.skills) {
    text += `SKILLS\n`;
    if (Array.isArray(resumeData.skills)) {
      text += resumeData.skills.join(', ') + '\n\n';
    } else if (resumeData.skills.technical || resumeData.skills.soft) {
      if (resumeData.skills.technical) {
        text += `Technical: ${Array.isArray(resumeData.skills.technical) ? resumeData.skills.technical.join(', ') : resumeData.skills.technical}\n`;
      }
      if (resumeData.skills.soft) {
        text += `Soft Skills: ${Array.isArray(resumeData.skills.soft) ? resumeData.skills.soft.join(', ') : resumeData.skills.soft}\n`;
      }
      text += '\n';
    }
  }
  
  return text.trim();
}
