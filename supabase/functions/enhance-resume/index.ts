
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

    console.log('📊 Input validation:');
    console.log('- Text type:', typeof text);
    console.log('- Text length:', text ? text.length : 0);
    console.log('- Text preview:', text ? text.substring(0, 100) + '...' : 'null');
    console.log('- Provider:', provider);

    if (!text || text === 'null' || text.trim() === '' || text === '{}') {
      console.log('⚠️ No valid resume text provided');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No resume content provided. Please upload or enter your resume content first.',
        enhancedContent: 'Please upload your resume or enter your resume content to get AI-powered enhancements and suggestions.'
      }), {
        status: 200,
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
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the text if it's JSON
    let resumeContent = text;
    try {
      if (typeof text === 'string' && (text.startsWith('{') || text.startsWith('['))) {
        console.log('🔄 Parsing JSON resume data...');
        const parsed = JSON.parse(text);
        // Convert parsed resume data to readable text
        resumeContent = convertResumeDataToText(parsed);
        console.log('✅ Converted to readable text, length:', resumeContent.length);
      }
    } catch (e) {
      console.log('ℹ️ Text is not JSON, using as-is');
    }

    if (!resumeContent || resumeContent.trim() === '') {
      console.log('⚠️ Resume content is empty after processing');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Resume content appears to be empty after processing.',
        enhancedContent: 'Please ensure your resume has content before enhancement.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
    console.log('📏 Prompt length:', prompt.length);
    
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

    console.log('📡 OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `AI service error (${response.status}). Please try again in a moment.`,
        enhancedContent: 'Enhancement temporarily unavailable due to AI service issues. Please try again.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure:', data);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid response from AI service.',
        enhancedContent: 'AI service returned an invalid response. Please try again.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const enhancedContent = data.choices[0].message.content;

    if (!enhancedContent || enhancedContent.trim() === '') {
      console.error('❌ Empty enhanced content from AI');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'AI returned empty content.',
        enhancedContent: 'AI enhancement resulted in empty content. Please try again with different content.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Resume enhancement completed successfully');
    console.log('📊 Results:', {
      originalLength: resumeContent.length,
      enhancedLength: enhancedContent.length,
      improvement: `${((enhancedContent.length / resumeContent.length - 1) * 100).toFixed(1)}%`
    });

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
    console.error('❌ Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: `Enhancement failed: ${error.message}`,
      enhancedContent: `Enhancement failed due to: ${error.message}. Please check your internet connection and try again.`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function convertResumeDataToText(resumeData: any): string {
  console.log('🔄 Converting resume data to text, type:', typeof resumeData);
  console.log('🔄 Resume data keys:', resumeData ? Object.keys(resumeData) : 'null');
  
  let text = '';
  
  try {
    // Add personal info
    if (resumeData.personalInfo) {
      const info = resumeData.personalInfo;
      if (info.fullName) text += `${info.fullName}\n`;
      if (info.email) text += `${info.email}`;
      if (info.phone) text += ` | ${info.phone}`;
      if (info.location) text += ` | ${info.location}`;
      if (info.email || info.phone || info.location) text += '\n';
      if (info.linkedin) text += `LinkedIn: ${info.linkedin}\n`;
      if (info.website) text += `Website: ${info.website}\n`;
      text += '\n';
    }
    
    // Add summary
    if (resumeData.summary) {
      text += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;
    } else if (resumeData.personalInfo && resumeData.personalInfo.summary) {
      text += `PROFESSIONAL SUMMARY\n${resumeData.personalInfo.summary}\n\n`;
    }
    
    // Add experience
    if (resumeData.workExperience && Array.isArray(resumeData.workExperience)) {
      text += `WORK EXPERIENCE\n`;
      resumeData.workExperience.forEach((exp: any) => {
        if (exp.title) text += `${exp.title}`;
        if (exp.company) text += ` at ${exp.company}`;
        text += '\n';
        if (exp.startDate || exp.endDate) {
          text += `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}\n`;
        }
        if (exp.description) text += `${exp.description}\n`;
        if (exp.achievements && Array.isArray(exp.achievements)) {
          exp.achievements.forEach((achievement: string) => {
            text += `• ${achievement}\n`;
          });
        }
        text += '\n';
      });
    } else if (resumeData.experience && Array.isArray(resumeData.experience)) {
      text += `WORK EXPERIENCE\n`;
      resumeData.experience.forEach((exp: any) => {
        if (exp.title) text += `${exp.title}`;
        if (exp.company) text += ` at ${exp.company}`;
        text += '\n';
        if (exp.startDate || exp.endDate) {
          text += `${exp.startDate || ''} - ${exp.endDate || ''}\n`;
        }
        if (exp.description) text += `${exp.description}\n`;
        text += '\n';
      });
    }
    
    // Add education
    if (resumeData.education && Array.isArray(resumeData.education)) {
      text += `EDUCATION\n`;
      resumeData.education.forEach((edu: any) => {
        if (edu.degree) text += `${edu.degree}`;
        if (edu.field) text += ` in ${edu.field}`;
        text += '\n';
        if (edu.school) text += `${edu.school}`;
        if (edu.graduationDate || edu.endDate) text += `, ${edu.graduationDate || edu.endDate}`;
        text += '\n';
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        text += '\n';
      });
    }
    
    // Add skills
    if (resumeData.skills) {
      text += `SKILLS\n`;
      if (Array.isArray(resumeData.skills)) {
        const skillNames = resumeData.skills.map((skill: any) => {
          if (typeof skill === 'string') return skill;
          if (skill && typeof skill === 'object') {
            return skill.skill || skill.name || skill.title || String(skill);
          }
          return String(skill);
        }).filter(Boolean);
        text += skillNames.join(', ') + '\n\n';
      } else if (resumeData.skills.technical || resumeData.skills.soft) {
        if (resumeData.skills.technical) {
          const techSkills = Array.isArray(resumeData.skills.technical) 
            ? resumeData.skills.technical.join(', ') 
            : resumeData.skills.technical;
          text += `Technical: ${techSkills}\n`;
        }
        if (resumeData.skills.soft) {
          const softSkills = Array.isArray(resumeData.skills.soft) 
            ? resumeData.skills.soft.join(', ') 
            : resumeData.skills.soft;
          text += `Soft Skills: ${softSkills}\n`;
        }
        text += '\n';
      }
    }
    
    // Add projects
    if (resumeData.projects && Array.isArray(resumeData.projects)) {
      text += `PROJECTS\n`;
      resumeData.projects.forEach((project: any) => {
        if (project.title) text += `${project.title}\n`;
        if (project.description) text += `${project.description}\n`;
        if (project.technologies && Array.isArray(project.technologies)) {
          text += `Technologies: ${project.technologies.join(', ')}\n`;
        }
        text += '\n';
      });
    }
    
  } catch (error) {
    console.error('❌ Error converting resume data:', error);
    // Fallback to JSON stringify if conversion fails
    text = JSON.stringify(resumeData, null, 2);
  }
  
  const finalText = text.trim();
  console.log('✅ Conversion complete, final length:', finalText.length);
  console.log('📄 Preview:', finalText.substring(0, 200) + '...');
  
  return finalText;
}
