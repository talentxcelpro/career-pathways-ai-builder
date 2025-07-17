
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

console.log('🚀 Enhanced Resume Function Starting...');

serve(async (req) => {
  console.log(`📍 Request received: ${req.method} from ${req.headers.get('Origin')}`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('📝 Processing resume enhancement request...');
    
    const body = await req.json();
    console.log('📋 Request body keys:', Object.keys(body));
    
    const { text, provider = 'openai' } = body;

    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'OpenAI API key not configured. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate input
    if (!text || typeof text !== 'string') {
      console.error('❌ Invalid input: text is required and must be a string');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Resume text is required and must be a string' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check for empty content
    const trimmedText = text.trim();
    if (!trimmedText || trimmedText === '{}' || trimmedText === 'null') {
      console.error('❌ Resume content is empty or invalid');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Resume content is empty. Please add some content to your resume first.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Processing ${trimmedText.length} characters of resume content`);

    // Convert structured data to readable text if needed
    let resumeText = trimmedText;
    
    // Try to parse as JSON and convert to readable format
    try {
      const parsed = JSON.parse(trimmedText);
      if (typeof parsed === 'object' && parsed !== null) {
        resumeText = convertResumeDataToText(parsed);
        console.log('✅ Successfully converted structured data to readable text');
      }
    } catch (e) {
      // Not JSON, treat as plain text
      console.log('📝 Processing as plain text (not JSON)');
    }

    // Prepare the prompt for OpenAI
    const prompt = `
    You are an expert resume writer and ATS optimization specialist. Please enhance the following resume content to make it more professional, impactful, and ATS-friendly.

    Focus on:
    1. **ATS Optimization**: Use relevant keywords and industry-standard terms
    2. **Achievement Focus**: Transform responsibilities into quantifiable achievements
    3. **Professional Tone**: Ensure consistent, professional language throughout
    4. **Action Verbs**: Use strong, specific action verbs
    5. **Impact Metrics**: Add or enhance quantifiable results where possible
    6. **Clarity**: Improve readability and structure

    Resume Content:
    ${resumeText}

    Please return the enhanced resume content in a clear, professional format. Keep the overall structure but improve the language, add impact metrics where appropriate, and optimize for ATS systems.
    `;

    console.log('🤖 Sending request to OpenAI API...');
    
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
            content: 'You are an expert resume writer and ATS optimization specialist. Provide enhanced resume content that is professional, impactful, and optimized for applicant tracking systems.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    console.log(`📡 OpenAI API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `OpenAI API error: ${response.status} - ${errorText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    console.log('✅ OpenAI API response received successfully');
    
    const enhancedContent = data.choices[0].message.content;
    
    if (!enhancedContent) {
      console.error('❌ No enhanced content returned from OpenAI');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No enhanced content returned from AI service' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Enhancement completed successfully, ${enhancedContent.length} characters generated`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      enhancedContent,
      originalLength: trimmedText.length,
      enhancedLength: enhancedContent.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in enhance-resume function:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Enhancement failed: ${errorMessage}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

/**
 * Convert structured resume data to readable text format
 */
function convertResumeDataToText(data: any): string {
  const sections: string[] = [];
  
  // Handle different data structures
  if (data.personalInfo || data.personal_info) {
    const personal = data.personalInfo || data.personal_info;
    sections.push('PERSONAL INFORMATION');
    if (personal.name) sections.push(`Name: ${personal.name}`);
    if (personal.email) sections.push(`Email: ${personal.email}`);
    if (personal.phone) sections.push(`Phone: ${personal.phone}`);
    if (personal.location) sections.push(`Location: ${personal.location}`);
    sections.push('');
  }

  if (data.summary || data.professionalSummary) {
    const summary = data.summary || data.professionalSummary;
    sections.push('PROFESSIONAL SUMMARY');
    sections.push(typeof summary === 'string' ? summary : JSON.stringify(summary));
    sections.push('');
  }

  if (data.experience || data.workExperience) {
    const experience = data.experience || data.workExperience;
    sections.push('WORK EXPERIENCE');
    if (Array.isArray(experience)) {
      experience.forEach((job: any, index: number) => {
        sections.push(`${index + 1}. ${job.title || job.position || 'Position'} at ${job.company || 'Company'}`);
        if (job.duration || job.dates) sections.push(`Duration: ${job.duration || job.dates}`);
        if (job.description) sections.push(`Description: ${job.description}`);
        if (job.responsibilities) sections.push(`Responsibilities: ${Array.isArray(job.responsibilities) ? job.responsibilities.join('; ') : job.responsibilities}`);
        if (job.achievements) sections.push(`Achievements: ${Array.isArray(job.achievements) ? job.achievements.join('; ') : job.achievements}`);
        sections.push('');
      });
    } else if (typeof experience === 'string') {
      sections.push(experience);
      sections.push('');
    }
  }

  if (data.education) {
    sections.push('EDUCATION');
    if (Array.isArray(data.education)) {
      data.education.forEach((edu: any, index: number) => {
        sections.push(`${index + 1}. ${edu.degree || edu.qualification || 'Degree'} from ${edu.institution || edu.school || 'Institution'}`);
        if (edu.year || edu.graduation) sections.push(`Year: ${edu.year || edu.graduation}`);
        if (edu.gpa) sections.push(`GPA: ${edu.gpa}`);
        sections.push('');
      });
    } else if (typeof data.education === 'string') {
      sections.push(data.education);
      sections.push('');
    }
  }

  if (data.skills) {
    sections.push('SKILLS');
    if (Array.isArray(data.skills)) {
      const skillsList = data.skills.map((skill: any) => {
        if (typeof skill === 'string') return skill;
        if (skill.name) return `${skill.name}${skill.level ? ` (${skill.level})` : ''}`;
        if (skill.skill) return `${skill.skill}${skill.proficiency ? ` (${skill.proficiency})` : ''}`;
        return JSON.stringify(skill);
      });
      sections.push(skillsList.join(', '));
    } else if (typeof data.skills === 'string') {
      sections.push(data.skills);
    }
    sections.push('');
  }

  // Handle any other sections
  Object.keys(data).forEach(key => {
    if (!['personalInfo', 'personal_info', 'summary', 'professionalSummary', 'experience', 'workExperience', 'education', 'skills'].includes(key)) {
      sections.push(key.toUpperCase().replace(/([A-Z])/g, ' $1').trim());
      sections.push(typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]));
      sections.push('');
    }
  });

  return sections.join('\n');
}
