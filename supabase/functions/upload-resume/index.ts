import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing resume upload request...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    console.log('File received:', file?.name, 'Size:', file?.size, 'User:', userId);

    if (!file || !userId) {
      console.error('Missing file or userId');
      return new Response(JSON.stringify({ error: 'File and userId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create upload status record
    const { data: statusRecord, error: statusError } = await supabase
      .from('resume_upload_status')
      .insert({
        user_id: userId,
        filename: file.name,
        upload_status: 'processing',
        current_step: 'extracting_text',
        progress_percentage: 10
      })
      .select()
      .single();

    if (statusError) throw statusError;

    // Extract text from file
    let extractedText = '';
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    if (file.type === 'application/pdf') {
      // For PDF, we'll use a simple text extraction (in production, use pdf-parse)
      extractedText = await extractPDFText(uint8Array);
    } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
      // For DOCX, we'll use mammoth or similar (simplified for demo)
      extractedText = await extractDOCXText(uint8Array);
    } else {
      throw new Error('Unsupported file type');
    }

    // Update progress
    await supabase
      .from('resume_upload_status')
      .update({ 
        current_step: 'ai_parsing',
        progress_percentage: 40 
      })
      .eq('id', statusRecord.id);

    // Parse with AI
    const parsedData = await parseResumeWithAI(extractedText);

    // Calculate ATS score
    const atsScore = calculateBasicATSScore(parsedData);

    // Update progress
    await supabase
      .from('resume_upload_status')
      .update({ 
        current_step: 'saving_data',
        progress_percentage: 80 
      })
      .eq('id', statusRecord.id);

    // Create resume record
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        title: parsedData.personalInfo?.name ? `${parsedData.personalInfo.name}'s Resume` : 'Uploaded Resume',
        ats_score: atsScore,
        summary: parsedData.summary || null,
        status: 'draft'
      })
      .select()
      .single();

    if (resumeError) throw resumeError;

    // Save sections
    const sections = [
      { section_type: 'personal_info', content: parsedData.personalInfo || {} },
      { section_type: 'summary', content: { content: parsedData.summary || '' } },
      { section_type: 'experience', content: { experiences: parsedData.workExperience || [] } },
      { section_type: 'education', content: { education: parsedData.education || [] } },
      { section_type: 'skills', content: { skills: parsedData.skills || [] } },
      { section_type: 'projects', content: { projects: parsedData.projects || [] } },
      { section_type: 'certifications', content: { certifications: parsedData.certifications || [] } }
    ];

    for (const section of sections) {
      await supabase
        .from('resume_sections')
        .insert({
          resume_id: resume.id,
          ...section,
          order_index: sections.indexOf(section)
        });
    }

    // Create analytics record
    await supabase
      .from('resume_analytics')
      .insert({
        resume_id: resume.id
      });

    // Complete upload
    await supabase
      .from('resume_upload_status')
      .update({
        upload_status: 'completed',
        current_step: 'completed',
        progress_percentage: 100,
        parsed_content: parsedData
      })
      .eq('id', statusRecord.id);

    return new Response(JSON.stringify({
      success: true,
      resumeId: resume.id,
      atsScore,
      parsedData,
      statusId: statusRecord.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing resume:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process resume' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Simplified PDF text extraction (replace with proper pdf-parse in production)
async function extractPDFText(buffer: Uint8Array): Promise<string> {
  // This is a placeholder - in production, use pdf-parse or similar
  const decoder = new TextDecoder();
  let text = decoder.decode(buffer);
  
  // Extract readable text from PDF (very basic approach)
  text = text.replace(/[^\x20-\x7E\n]/g, ' ');
  text = text.replace(/\s+/g, ' ');
  
  return text.substring(0, 10000); // Limit size
}

// Simplified DOCX text extraction (replace with mammoth in production)
async function extractDOCXText(buffer: Uint8Array): Promise<string> {
  // This is a placeholder - in production, use mammoth.js
  const decoder = new TextDecoder();
  let text = decoder.decode(buffer);
  
  // Extract readable text from DOCX (very basic approach)
  text = text.replace(/[^\x20-\x7E\n]/g, ' ');
  text = text.replace(/\s+/g, ' ');
  
  return text.substring(0, 10000); // Limit size
}

// AI-powered resume parsing
async function parseResumeWithAI(text: string) {
  if (!openAIApiKey) {
    // Fallback to basic parsing if no AI available
    return basicResumeParser(text);
  }

  const prompt = `Parse this resume text and extract structured information. Return a JSON object with:
- personalInfo: {name, email, phone, location, linkedin}
- summary: string
- workExperience: [{title, company, location, startDate, endDate, bullets: []}]
- education: [{degree, school, location, startDate, endDate, gpa}]
- skills: [string]
- projects: [{name, description, technologies: [], url}]
- certifications: [{name, issuer, date, url}]

Resume text:
${text.substring(0, 8000)}

Return only valid JSON:`;

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
          { role: 'system', content: 'You are a resume parsing expert. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return parsed;
  } catch (error) {
    console.error('AI parsing failed, using basic parser:', error);
    return basicResumeParser(text);
  }
}

// Basic resume parser as fallback
function basicResumeParser(text: string) {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : null;
  
  // Extract phone
  const phoneMatch = text.match(/(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;
  
  // Extract name (assume first meaningful line)
  const name = lines.find(line => line.length > 5 && line.length < 50 && !line.includes('@')) || 'Unknown';
  
  return {
    personalInfo: { name, email, phone, location: null, linkedin: null },
    summary: '',
    workExperience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  };
}

// Calculate basic ATS score
function calculateBasicATSScore(data: any): number {
  let score = 0;
  
  if (data.personalInfo?.name) score += 15;
  if (data.personalInfo?.email) score += 10;
  if (data.summary && data.summary.length > 50) score += 15;
  if (data.workExperience?.length > 0) score += 25;
  if (data.education?.length > 0) score += 15;
  if (data.skills?.length > 0) score += 20;
  
  return Math.min(score, 100);
}