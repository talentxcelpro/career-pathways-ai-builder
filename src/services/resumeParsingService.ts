import { supabase } from "@/integrations/supabase/client";

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
    if (text.length < 50) throw new Error('Not enough text extracted');

    // Send to AI
    const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
      body: { extractedText: text, fileName: file.name }
    });

    if (error || !data?.success) throw new Error('AI parsing failed');
    
    const aiResume = data.data?.structured_resume;
    if (!aiResume) throw new Error('No resume data returned');

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

  } catch (error) {
    console.error('❌ Parse error:', error);
    throw error;
  }
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
