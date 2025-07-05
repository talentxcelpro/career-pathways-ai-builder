import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, file_url, file_name, user_id, status_id, parsed_resume_id } = body;
    console.log('Processing AI resume parser request:', action);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    switch (action) {
      case 'extract_content':
        return await extractContent(file_url, file_name, user_id);
      
      case 'optimize_ats':
        return await optimizeATS(parsed_resume_id, user_id);
      
      case 'generate_enhancements':
        return await generateEnhancements(parsed_resume_id, user_id);
      
      case 'create_resume':
        return await createResume(parsed_resume_id, user_id);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error('AI Resume Parser Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function extractContent(fileUrl: string, fileName: string, userId: string) {
  try {
    // Fetch the file content
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to fetch file');
    }

    // For now, we'll use a simplified text extraction
    // In production, you'd use a proper PDF/DOCX parser
    const fileBuffer = await fileResponse.arrayBuffer();
    const fileText = `Sample extracted text from ${fileName}`;

    // Use OpenAI to parse the resume content
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a resume parser. Extract structured information from resume text and return it as JSON with these fields:
            - personal_info: {name, email, phone, location, linkedin}
            - experience: [{title, company, dates, description, achievements}]
            - education: [{degree, institution, year, gpa}]
            - skills: [skill1, skill2, ...]
            - certifications: [{name, issuer, date}]
            - projects: [{name, description, technologies}]
            - languages: [{language, proficiency}]`
          },
          {
            role: 'user',
            content: `Parse this resume text and extract structured information: ${fileText}`
          }
        ],
        temperature: 0.1,
      }),
    });

    const aiResult = await openAIResponse.json();
    const parsedContent = JSON.parse(aiResult.choices[0].message.content);

    // Save to database
    const { data, error } = await supabase
      .from('resume_parsed')
      .insert({
        user_id: userId,
        resume_name: fileName,
        original_file_url: fileUrl,
        full_text: fileText,
        parsed_data: parsedContent,
        personal_info: parsedContent.personal_info || {},
        experience: parsedContent.experience || [],
        education: parsedContent.education || [],
        skills: parsedContent.skills || [],
        certifications: parsedContent.certifications || [],
        projects: parsedContent.projects || [],
        languages: parsedContent.languages || [],
        extraction_status: 'completed'
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      parsed_resume_id: data.id,
      extracted_data: parsedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Content extraction error:', error);
    throw error;
  }
}

async function optimizeATS(parsedResumeId: string, userId: string) {
  try {
    // Get parsed resume data
    const { data: resumeData, error: fetchError } = await supabase
      .from('resume_parsed')
      .select('*')
      .eq('id', parsedResumeId)
      .single();

    if (fetchError) throw fetchError;

    // Use OpenAI to optimize for ATS
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an ATS optimization expert. Analyze resume content and provide optimization suggestions. Return JSON with:
            - optimization_score: number (0-100)
            - keywords_matched: [keywords that are good]
            - missing_keywords: [keywords that should be added]
            - suggestions: [{section, issue, fix}]
            - optimized_content: {improved version of content}`
          },
          {
            role: 'user',
            content: `Optimize this resume for ATS: ${JSON.stringify(resumeData.parsed_data)}`
          }
        ],
        temperature: 0.1,
      }),
    });

    const aiResult = await openAIResponse.json();
    const optimization = JSON.parse(aiResult.choices[0].message.content);

    // Save optimization results
    const { data, error } = await supabase
      .from('resume_ats_optimization')
      .insert({
        parsed_resume_id: parsedResumeId,
        optimization_score: optimization.optimization_score || 75,
        keywords_matched: optimization.keywords_matched || [],
        missing_keywords: optimization.missing_keywords || [],
        suggestions: optimization.suggestions || [],
        optimized_content: optimization.optimized_content || {},
        optimization_status: 'completed'
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      optimization_id: data.id,
      optimization_results: optimization
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('ATS optimization error:', error);
    throw error;
  }
}

async function generateEnhancements(parsedResumeId: string, userId: string) {
  try {
    // Get parsed resume data
    const { data: resumeData, error: fetchError } = await supabase
      .from('resume_parsed')
      .select('*')
      .eq('id', parsedResumeId)
      .single();

    if (fetchError) throw fetchError;

    const sections = ['experience', 'education', 'skills', 'summary'];
    const enhancements = [];

    for (const section of sections) {
      const sectionData = resumeData.parsed_data[section];
      if (!sectionData) continue;

      // Use OpenAI to generate enhancements for each section
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `You are a resume enhancement expert. Improve resume content by using strong action verbs, quantifying achievements, and making it more impactful. Return JSON array with enhancements: [{original, enhanced, reason, confidence_score}]`
            },
            {
              role: 'user',
              content: `Enhance this ${section} section: ${JSON.stringify(sectionData)}`
            }
          ],
          temperature: 0.3,
        }),
      });

      const aiResult = await openAIResponse.json();
      const sectionEnhancements = JSON.parse(aiResult.choices[0].message.content);

      // Save each enhancement
      for (const enhancement of sectionEnhancements) {
        const { data, error } = await supabase
          .from('resume_enhancements')
          .insert({
            parsed_resume_id: parsedResumeId,
            section_type: section,
            original_content: enhancement.original,
            enhanced_content: enhancement.enhanced,
            enhancement_type: 'impact',
            suggestion_reason: enhancement.reason,
            confidence_score: enhancement.confidence_score || 0.8,
            is_applied: false
          })
          .select()
          .single();

        if (!error) {
          enhancements.push(data);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      enhancements_count: enhancements.length,
      enhancements: enhancements
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Enhancement generation error:', error);
    throw error;
  }
}

async function createResume(parsedResumeId: string, userId: string) {
  try {
    // Get all processed data
    const { data: parsedData, error: parsedError } = await supabase
      .from('resume_parsed')
      .select('*')
      .eq('id', parsedResumeId)
      .single();

    if (parsedError) throw parsedError;

    const { data: optimizationData } = await supabase
      .from('resume_ats_optimization')
      .select('*')
      .eq('parsed_resume_id', parsedResumeId)
      .single();

    const { data: enhancements } = await supabase
      .from('resume_enhancements')
      .select('*')
      .eq('parsed_resume_id', parsedResumeId);

    // Create the final resume
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        title: `Enhanced ${parsedData.resume_name}`,
        content: {
          ...parsedData.parsed_data,
          ats_optimized: optimizationData?.optimized_content || {},
          enhancements: enhancements || []
        },
        template_id: null,
        is_primary: false,
        is_public: false,
        completion_percentage: 85
      })
      .select()
      .single();

    if (resumeError) throw resumeError;

    return new Response(JSON.stringify({ 
      success: true, 
      resume_id: resume.id,
      message: 'Resume created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Resume creation error:', error);
    throw error;
  }
}