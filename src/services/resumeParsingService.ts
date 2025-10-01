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
    console.log('🚀 Starting resume parsing for:', file.name, 'Type:', file.type);
    
    // Extract text from the file first
    let extractedText = '';
    
    if (file.type.includes('pdf')) {
      // For PDF files, use pdfjs-dist
      console.log('📄 Processing PDF file...');
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      extractedText = fullText;
    } else if (file.type.includes('word') || file.type.includes('document')) {
      // For DOCX files
      console.log('📝 Processing DOCX file...');
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value;
    } else if (file.type === 'text/plain') {
      // For text files
      extractedText = await file.text();
    }

    console.log('📋 Extracted text length:', extractedText.length);
    console.log('📋 First 200 chars:', extractedText.substring(0, 200));

    // Call the AI resume parser edge function with extracted text
    const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
      body: {
        extractedText: extractedText,
        fileName: file.name
      }
    });

    if (error) {
      console.error('Resume parsing error:', error);
      throw new Error(error.message || 'Failed to parse resume');
    }

    if (!data.success) {
      throw new Error(data.error || 'Parsing failed');
    }

    console.log('✅ AI parsing completed successfully');
    console.log('📊 Parsed resume data:', data.data);

    // Transform the AI response to match the expected ParsedResume format
    const aiResume = data.data?.structured_resume;
    
    if (!aiResume) {
      throw new Error('No structured resume data returned from AI');
    }

    // Map AI response to ParsedResume interface
    const parsedResume: ParsedResume = {
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

    console.log('✅ Resume transformation complete:', parsedResume);
    return parsedResume;

  } catch (error) {
    console.error('Error parsing resume:', error);
    
    // Return empty structure as fallback
    return {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: ''
      },
      experience: [],
      education: [],
      skills: {
        technical: [],
        soft: [],
        languages: []
      }
    };
  }
};

/**
 * Extract text from a file for AI processing
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;

  // For text files, read directly
  if (fileType === 'text/plain') {
    return await file.text();
  }

  // For PDF and DOCX, we'll need the edge function to handle extraction
  // Return empty string here and let the edge function handle it
  return '';
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
