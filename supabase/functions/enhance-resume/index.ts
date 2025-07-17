
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EnhancementRequest {
  text: string;
  provider?: string;
  options?: {
    tone?: string;
    focus?: string;
    targetRole?: string;
    industry?: string;
  };
}

serve(async (req) => {
  console.log('🚀 Enhanced Resume Function Starting...');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📍 Request received:', req.method, 'from', req.headers.get('origin'));
    
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    let requestData: EnhancementRequest;
    try {
      const body = await req.text();
      console.log('📦 Raw request body length:', body.length);
      
      if (!body || body.trim() === '') {
        throw new Error('Empty request body');
      }
      
      requestData = JSON.parse(body);
      console.log('✅ Request data parsed successfully');
    } catch (parseError) {
      console.error('❌ Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate required fields
    if (!requestData.text) {
      console.error('❌ Missing required field: text');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required field: text'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📝 Processing resume text of length:', requestData.text.length);

    // Convert resume data to readable text
    const resumeText = convertResumeDataToText(requestData.text);
    console.log('📋 Converted resume text length:', resumeText.length);

    if (!resumeText || resumeText.trim() === '') {
      console.error('❌ Empty resume text after conversion');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Resume content is empty after processing'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not found');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OpenAI API key not configured'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare enhancement prompt
    const enhancementPrompt = createEnhancementPrompt(resumeText, requestData.options);
    console.log('🎯 Enhancement prompt prepared');

    // Call OpenAI API with retry logic
    let enhancedContent: string;
    try {
      enhancedContent = await callOpenAIWithRetry(openaiApiKey, enhancementPrompt);
      console.log('✅ OpenAI API call successful, response length:', enhancedContent.length);
    } catch (openaiError) {
      console.error('❌ OpenAI API error:', openaiError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `AI enhancement failed: ${openaiError.message}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate enhanced content
    if (!enhancedContent || enhancedContent.trim() === '') {
      console.error('❌ Empty enhanced content received');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No enhanced content generated'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Return successful response
    const response = {
      success: true,
      enhancedContent: enhancedContent.trim(),
      metadata: {
        originalLength: resumeText.length,
        enhancedLength: enhancedContent.length,
        provider: requestData.provider || 'openai',
        timestamp: new Date().toISOString()
      }
    };

    console.log('✅ Enhancement completed successfully');
    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in enhance-resume function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function convertResumeDataToText(input: string): string {
  console.log('🔄 Converting resume data to text...');
  
  try {
    // Try to parse as JSON first
    const data = JSON.parse(input);
    console.log('📋 Parsed JSON data, extracting text...');
    
    let text = '';
    
    // Extract personal information
    if (data.personalInfo) {
      text += `Name: ${data.personalInfo.fullName || 'N/A'}\n`;
      text += `Email: ${data.personalInfo.email || 'N/A'}\n`;
      text += `Phone: ${data.personalInfo.phone || 'N/A'}\n`;
      text += `Location: ${data.personalInfo.location || 'N/A'}\n`;
      if (data.personalInfo.summary) {
        text += `Summary: ${data.personalInfo.summary}\n`;
      }
      text += '\n';
    }
    
    // Extract experience
    if (data.experience && Array.isArray(data.experience)) {
      text += 'EXPERIENCE:\n';
      data.experience.forEach((exp: any, index: number) => {
        text += `${index + 1}. ${exp.title || 'N/A'} at ${exp.company || 'N/A'}\n`;
        text += `   Duration: ${exp.startDate || 'N/A'} - ${exp.endDate || 'N/A'}\n`;
        text += `   Location: ${exp.location || 'N/A'}\n`;
        if (exp.description) {
          text += `   Description: ${exp.description}\n`;
        }
        if (exp.achievements && Array.isArray(exp.achievements)) {
          text += '   Achievements:\n';
          exp.achievements.forEach((achievement: string) => {
            text += `   - ${achievement}\n`;
          });
        }
        text += '\n';
      });
    }
    
    // Extract education
    if (data.education && Array.isArray(data.education)) {
      text += 'EDUCATION:\n';
      data.education.forEach((edu: any, index: number) => {
        text += `${index + 1}. ${edu.degree || 'N/A'} from ${edu.school || 'N/A'}\n`;
        text += `   Duration: ${edu.startDate || 'N/A'} - ${edu.endDate || 'N/A'}\n`;
        text += `   Location: ${edu.location || 'N/A'}\n`;
        if (edu.gpa) {
          text += `   GPA: ${edu.gpa}\n`;
        }
        text += '\n';
      });
    }
    
    // Extract skills
    if (data.skills) {
      text += 'SKILLS:\n';
      if (Array.isArray(data.skills)) {
        data.skills.forEach((skill: string) => {
          text += `- ${skill}\n`;
        });
      } else if (typeof data.skills === 'object') {
        // Handle structured skills object
        Object.entries(data.skills).forEach(([category, skills]) => {
          if (Array.isArray(skills)) {
            text += `${category.toUpperCase()}:\n`;
            skills.forEach((skill: any) => {
              const skillName = typeof skill === 'string' ? skill : skill.skill || skill.name;
              text += `- ${skillName}\n`;
            });
          }
        });
      }
      text += '\n';
    }
    
    // Extract projects
    if (data.projects && Array.isArray(data.projects)) {
      text += 'PROJECTS:\n';
      data.projects.forEach((project: any, index: number) => {
        text += `${index + 1}. ${project.title || 'N/A'}\n`;
        if (project.description) {
          text += `   Description: ${project.description}\n`;
        }
        if (project.technologies && Array.isArray(project.technologies)) {
          text += `   Technologies: ${project.technologies.join(', ')}\n`;
        }
        text += '\n';
      });
    }
    
    // Extract certifications
    if (data.certifications && Array.isArray(data.certifications)) {
      text += 'CERTIFICATIONS:\n';
      data.certifications.forEach((cert: any, index: number) => {
        text += `${index + 1}. ${cert.name || 'N/A'} from ${cert.issuer || 'N/A'}\n`;
        text += `   Date: ${cert.date || 'N/A'}\n`;
        text += '\n';
      });
    }
    
    console.log('✅ JSON data converted to text successfully');
    return text.trim();
    
  } catch (jsonError) {
    console.log('📝 Input is not JSON, treating as plain text');
    // If it's not JSON, treat as plain text
    return input.trim();
  }
}

function createEnhancementPrompt(resumeText: string, options?: any): string {
  const tone = options?.tone || 'professional';
  const focus = options?.focus || 'general improvement';
  const targetRole = options?.targetRole || '';
  const industry = options?.industry || '';
  
  return `You are an expert resume writer and career coach. Please enhance the following resume content to make it more professional, impactful, and ATS-friendly.

Focus areas:
- ${focus}
- Tone: ${tone}
${targetRole ? `- Target Role: ${targetRole}` : ''}
${industry ? `- Industry: ${industry}` : ''}

Please improve the resume by:
1. Enhancing the language to be more professional and impactful
2. Adding quantifiable achievements where appropriate
3. Improving the overall structure and flow
4. Making it more ATS-friendly with relevant keywords
5. Ensuring consistency in formatting and style

Here is the resume content to enhance:

${resumeText}

Please provide the enhanced resume content:`;
}

async function callOpenAIWithRetry(apiKey: string, prompt: string, maxRetries = 3): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 OpenAI API attempt ${attempt}/${maxRetries}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI API');
      }

      const enhancedContent = data.choices[0].message.content;
      
      if (!enhancedContent || enhancedContent.trim() === '') {
        throw new Error('Empty content received from OpenAI API');
      }

      console.log('✅ OpenAI API call successful');
      return enhancedContent;

    } catch (error) {
      console.error(`❌ OpenAI API attempt ${attempt} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}
