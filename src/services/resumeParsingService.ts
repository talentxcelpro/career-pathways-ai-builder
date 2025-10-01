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
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    // Call the AI resume parser edge function
    const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
      body: formData
    });

    if (error) {
      console.error('Resume parsing error:', error);
      throw new Error(error.message || 'Failed to parse resume');
    }

    if (!data.success) {
      throw new Error(data.error || 'Parsing failed');
    }

    // Return parsed resume data
    return data.parsed as ParsedResume;

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
