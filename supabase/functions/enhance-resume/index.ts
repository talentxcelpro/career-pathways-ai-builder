
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface ResumeData {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
  };
  experience?: Array<{
    company?: string;
    position?: string;
    duration?: string;
    description?: string;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    year?: string;
    description?: string;
  }>;
  skills?: string[];
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
  }>;
}

serve(async (req) => {
  console.log('🚀 Enhanced Resume Function Starting...');
  console.log('📋 Request details:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    console.log('🏥 Health check requested');
    return new Response(
      JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'enhance-resume'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }

  // Only allow POST requests for enhancement
  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use POST for enhancement or GET for health check.',
        enhancedResume: null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    );
  }

  try {
    console.log('📝 Processing resume enhancement request...');
    
    // Parse request body with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    let requestBody;
    try {
      requestBody = await req.json();
      clearTimeout(timeoutId);
    } catch (parseError) {
      clearTimeout(timeoutId);
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body',
          enhancedResume: null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    const { resumeData, enhancementType = 'comprehensive' } = requestBody;
    console.log('📊 Input data received:', { 
      resumeData: !!resumeData, 
      enhancementType,
      dataKeys: resumeData ? Object.keys(resumeData) : []
    });

    if (!resumeData) {
      console.log('❌ No resume data provided');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No resume data provided',
          enhancedResume: null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate resume data structure
    if (typeof resumeData !== 'object') {
      console.log('❌ Invalid resume data structure');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Resume data must be an object',
          enhancedResume: null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('🔧 Starting AI enhancement processing...');
    
    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('⚠️ OpenAI API key not found, falling back to rule-based enhancement');
      return await fallbackEnhancement(resumeData, enhancementType);
    }

    // Convert resume data to string for OpenAI
    const resumeString = JSON.stringify(resumeData, null, 2);
    console.log('📝 Sending to OpenAI for enhancement...');

    const prompt = `
You are a professional resume writer and career expert.

Enhance the following resume content to:
- Use a professional, achievement-focused tone
- Improve clarity and impact of each section
- Highlight measurable accomplishments, leadership, and technical skills
- Ensure ATS optimization with strong action verbs and keywords
- Correct grammar, structure, and flow

Input Resume:
---
${resumeString}
---

Output:
Return ONLY a valid JSON object with the improved resume data, maintaining the same structure as the input. Do not include any markdown formatting or additional text.

The JSON should have these sections:
- personalInfo (with name, email, phone, location, summary)
- experience (array with company, position, duration, description)
- education (array with institution, degree, year, description)
- skills (array of strings)
- projects (array with name, description, technologies)

Ensure the enhanced version is ready for export to a Word or PDF resume format.
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a professional resume writer. Return only valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const enhancedContent = data.choices[0]?.message?.content;
      
      if (!enhancedContent) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the enhanced resume
      let enhancedResume: ResumeData;
      try {
        enhancedResume = JSON.parse(enhancedContent);
      } catch (parseError) {
        console.error('❌ Failed to parse OpenAI response:', parseError);
        throw new Error('Invalid JSON response from OpenAI');
      }

      console.log('✅ AI enhancement completed successfully');
      console.log('📊 Enhanced data structure:', {
        hasPersonalInfo: !!enhancedResume.personalInfo,
        experienceCount: enhancedResume.experience?.length || 0,
        educationCount: enhancedResume.education?.length || 0,
        skillsCount: enhancedResume.skills?.length || 0,
        projectsCount: enhancedResume.projects?.length || 0
      });
      
      const responseData = {
        success: true,
        enhancedResume,
        enhancements: {
          summary: 'AI-enhanced for professional impact and ATS compatibility',
          experience: 'Optimized with strong action verbs and quantifiable achievements',
          skills: 'Prioritized and organized for industry relevance',
          overall: 'Enhanced readability, grammar, and professional presentation'
        },
        metadata: {
          processedAt: new Date().toISOString(),
          enhancementType,
          version: '2.0.0',
          aiEnhanced: true
        }
      };

      return new Response(
        JSON.stringify(responseData),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );

    } catch (aiError) {
      console.error('❌ AI enhancement failed:', aiError);
      console.log('🔄 Falling back to rule-based enhancement...');
      return await fallbackEnhancement(resumeData, enhancementType);
    }

  } catch (error) {
    console.error('❌ Enhancement error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Create a fallback response even on error
    const fallbackResponse = {
      success: false,
      error: 'Enhancement processing failed',
      details: error.message,
      enhancedResume: null,
      fallback: true,
      timestamp: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify(fallbackResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function fallbackEnhancement(resumeData: ResumeData, enhancementType: string): Promise<Response> {
  console.log('🔄 Using fallback rule-based enhancement...');
  
  // Enhanced resume processing with professional improvements
  const enhancedResume: ResumeData = {
    personalInfo: {
      ...resumeData.personalInfo,
      summary: enhancePersonalSummary(resumeData.personalInfo?.summary || '')
    },
    experience: enhanceExperience(resumeData.experience || []),
    education: enhanceEducation(resumeData.education || []),
    skills: enhanceSkills(resumeData.skills || []),
    projects: enhanceProjects(resumeData.projects || [])
  };

  console.log('✅ Fallback enhancement completed successfully');
  
  const response = {
    success: true,
    enhancedResume,
    enhancements: {
      summary: 'Enhanced with professional language and ATS optimization',
      experience: 'Improved with action verbs and professional formatting',
      skills: 'Organized and prioritized for industry relevance',
      overall: 'Optimized readability and professional presentation'
    },
    metadata: {
      processedAt: new Date().toISOString(),
      enhancementType,
      version: '1.0.0',
      aiEnhanced: false,
      fallbackUsed: true
    }
  };
  
  return new Response(
    JSON.stringify(response),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  );
}

function enhancePersonalSummary(summary: string): string {
  if (!summary || summary.trim().length === 0) {
    return 'Results-driven professional with proven expertise in delivering high-quality solutions and driving organizational success through innovative approaches and collaborative leadership.';
  }
  
  // Add professional enhancement while preserving original content
  const enhanced = summary.includes('professional') ? summary : 
    `${summary} Committed professional focused on excellence and continuous improvement.`;
  
  return enhanced;
}

function enhanceExperience(experience: any[]): any[] {
  return experience.map(exp => ({
    ...exp,
    description: enhanceJobDescription(exp.description || ''),
    position: exp.position || 'Professional',
    company: exp.company || 'Organization'
  }));
}

function enhanceJobDescription(description: string): string {
  if (!description || description.trim().length === 0) {
    return 'Contributed to organizational objectives through dedicated performance, collaborative teamwork, and commitment to quality deliverables.';
  }
  
  // Enhance with action verbs and professional language
  const actionVerbs = ['Developed', 'Implemented', 'Managed', 'Led', 'Optimized', 'Collaborated'];
  const hasActionVerb = actionVerbs.some(verb => description.includes(verb));
  
  if (!hasActionVerb) {
    return `Developed and ${description.toLowerCase()}`;
  }
  
  return description;
}

function enhanceEducation(education: any[]): any[] {
  return education.map(edu => ({
    ...edu,
    description: edu.description || 'Completed comprehensive academic program with focus on practical application and professional development.'
  }));
}

function enhanceSkills(skills: string[]): string[] {
  if (!skills || skills.length === 0) {
    return ['Professional Communication', 'Problem Solving', 'Team Collaboration', 'Project Management'];
  }
  
  // Ensure core professional skills are included
  const coreSkills = ['Communication', 'Leadership', 'Problem Solving'];
  const enhancedSkills = [...skills];
  
  coreSkills.forEach(skill => {
    if (!enhancedSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
      enhancedSkills.push(skill);
    }
  });
  
  return enhancedSkills;
}

function enhanceProjects(projects: any[]): any[] {
  return projects.map(project => ({
    ...project,
    description: project.description || 'Successfully completed project demonstrating technical expertise and problem-solving capabilities.',
    technologies: project.technologies || ['Professional Tools', 'Industry Standards']
  }));
}
