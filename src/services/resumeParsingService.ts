import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ParsedResume {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

/**
 * Parse a resume file using AI
 * Extracts structured data from PDF, DOCX, DOC, or TXT files
 */
export const parseResumeFile = async (file: File): Promise<ParsedResume> => {
  try {
    console.log('📄 Parsing:', file.name);
    
    // Extract text
    let text = '';
    
    if (file.type.includes('word') || file.name.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      text = result.value;
    } else if (file.type.includes('pdf')) {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
    }
    
    console.log('✅ Extracted:', text.length, 'chars');
    if (text.length < 50) {
      console.warn('⚠️ Not enough text extracted');
      throw new Error('Could not extract enough text from the file. Please ensure your resume has readable text.');
    }

    // Send to AI with fallback
    try {
      console.log('🤖 Sending to AI parser...');
      const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
        body: { extractedText: text, fileName: file.name }
      });

      console.log('📡 Edge function response:', { success: data?.success, hasData: !!data?.data });
      
      if (error) {
        console.error('❌ Edge function error:', error);
        console.log('🔄 Using enhanced fallback parsing...');
        toast.info('Using basic text extraction - AI service unavailable');
        return parseFallback(text);
      }
      
      if (!data?.success) {
        console.error('❌ AI parsing unsuccessful');
        console.log('🔄 Using enhanced fallback parsing...');
        toast.info('Using basic text extraction - AI parsing failed');
        return parseFallback(text);
      }
      
      const aiResume = data.data?.structured_resume;
      if (!aiResume || !aiResume.name) {
        console.log('🔄 No AI resume data or missing name, using fallback...');
        toast.info('Using basic text extraction - incomplete AI response');
        return parseFallback(text);
      }

      console.log('✅ AI Resume parsed successfully:', { 
        name: aiResume.name, 
        email: aiResume.email,
        experienceCount: aiResume.work_experience?.length || 0 
      });
      toast.success('Resume parsed successfully with AI!');
      return transformAIResponse(aiResume);
    } catch (aiError) {
      console.error('❌ AI parsing failed:', aiError);
      console.log('🔄 Using enhanced fallback parsing...');
      toast.info('Using basic text extraction - AI service error');
      return parseFallback(text);
    }

  } catch (error) {
    console.error('❌ Parse error:', error);
    throw error;
  }
};

/**
 * Basic fallback parser when AI is unavailable
 */
const parseFallback = (text: string): ParsedResume => {
  console.log('🔄 Using fallback parsing...');
  
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract name - look for proper name patterns at the start
  let fullName = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Skip if line is too long or has non-name patterns
    if (line.length > 50) continue;
    if (/\d{4}|\d+\s*(years?|months?)|experience|summary|objective|profile|resume/i.test(line)) continue;
    if (emailMatch && line.includes(emailMatch[0])) continue;
    if (phoneMatch && line.includes(phoneMatch[0])) continue;
    // Check if it looks like a name (2-4 words, mostly letters)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && /^[A-Za-z\s\-']+$/.test(line)) {
      fullName = line;
      break;
    }
  }
  
  // Extract location (look for city, state patterns)
  const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*[A-Z]{2,})/);
  const location = locationMatch?.[0] || '';
  
  // Extract summary (first substantial paragraph)
  let summary = '';
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    if (line.length > 100 && line.length < 500 && !line.includes('@') && !/^\d/.test(line)) {
      summary = line;
      break;
    }
  }
  
  console.log('📋 Fallback extracted:', { fullName, email: emailMatch?.[0], phone: phoneMatch?.[0], location, summaryLength: summary.length });
  
  return {
    personalInfo: {
      fullName: fullName || 'Please edit your name',
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0] || '',
      location: location,
    },
    summary: summary || text.substring(0, 200),
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      languages: []
    },
    certifications: [],
    projects: []
  };
};

/**
 * Transform AI response to ParsedResume format
 */
const transformAIResponse = (aiResume: any): ParsedResume => {
  return {
    personalInfo: {
      fullName: aiResume.name || '',
      email: aiResume.email || '',
      phone: aiResume.phone || '',
      location: aiResume.location || '',
      linkedin: aiResume.linkedin,
      website: aiResume.portfolio || aiResume.github
    },
    summary: aiResume.summary,
    experience: (aiResume.work_experience || []).map((exp: any, index: number) => ({
      id: `exp-${index}`,
      title: exp.title || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.duration?.split('-')[0]?.trim() || '',
      endDate: exp.duration?.split('-')[1]?.trim() || 'Present',
      current: exp.duration?.toLowerCase().includes('present') || false,
      description: exp.description || '',
      achievements: exp.achievements || []
    })),
    education: (aiResume.education || []).map((edu: any, index: number) => ({
      id: `edu-${index}`,
      degree: edu.degree || '',
      school: edu.institution || '',
      location: edu.location || '',
      startDate: edu.duration?.split('-')[0]?.trim() || '',
      endDate: edu.duration?.split('-')[1]?.trim() || '',
      gpa: edu.gpa
    })),
    skills: {
      technical: Array.isArray(aiResume.skills?.technical) 
        ? aiResume.skills.technical 
        : Object.values(aiResume.skills || {}).flat(),
      soft: aiResume.skills?.soft || [],
      languages: (aiResume.languages || []).map((lang: any) => 
        typeof lang === 'string' ? lang : lang.language
      )
    },
    certifications: aiResume.certifications || [],
    projects: aiResume.projects || []
  };
};

/**
 * Validate parsed resume data
 */
export const validateParsedResume = (data: ParsedResume): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!data.personalInfo?.fullName) {
    errors.push('Full name is required');
  }
  if (!data.personalInfo?.email) {
    warnings.push('Email is missing - highly recommended');
  }
  if (!data.personalInfo?.phone) {
    warnings.push('Phone number is missing');
  }

  // Check for content
  if (data.experience.length === 0) {
    warnings.push('No work experience found');
  }
  if (data.education.length === 0) {
    warnings.push('No education found');
  }
  if (data.skills.technical.length === 0 && data.skills.soft.length === 0) {
    warnings.push('No skills found');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};
