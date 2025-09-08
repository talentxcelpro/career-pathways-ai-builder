// ============================================
// CANONICAL RESUME DATA TYPES - SINGLE SOURCE OF TRUTH
// ============================================
// This file defines the ONE canonical resume format used throughout the app
// All other formats are adapters/views of this core structure

export interface CorePersonalInfo {
  fullName: string;
  professionalTitle?: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary: string;
}

export interface CoreExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string; // YYYY-MM format
  endDate: string;   // YYYY-MM format or empty for current
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface CoreEducation {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
  relevantCoursework?: string[];
  description?: string;
}

export interface CoreSkill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'technical' | 'soft' | 'language' | 'tool';
  years?: number;
}

export interface CoreProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
  role?: string;
}

export interface CoreCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface CoreAward {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface CoreVolunteerWork {
  id: string;
  role: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface CoreReference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface CoreResumeSettings {
  templateId: string;
  colorScheme: string;
  fontFamily: string;
  fontSize: number;
  spacing: 'compact' | 'normal' | 'spacious';
  sectionOrder: string[];
}

export interface CoreResumeMetadata {
  id?: string;
  userId?: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  version: number;
  atsScore?: number;
  isPublic?: boolean;
}

// THE CANONICAL RESUME DATA STRUCTURE
export interface CoreResumeData {
  // Required sections
  personalInfo: CorePersonalInfo;
  experience: CoreExperience[];
  education: CoreEducation[];
  skills: CoreSkill[];
  
  // Optional sections
  projects?: CoreProject[];
  certifications?: CoreCertification[];
  awards?: CoreAward[];
  volunteerWork?: CoreVolunteerWork[];
  references?: CoreReference[];
  interests?: string[];
  
  // Configuration
  settings: CoreResumeSettings;
  metadata: CoreResumeMetadata;
}

// SECTION TYPE DEFINITIONS
export type ResumeSectionType = 
  | 'personalInfo'
  | 'experience' 
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'volunteerWork'
  | 'references'
  | 'interests';

export interface SectionConfiguration {
  id: ResumeSectionType;
  title: string;
  enabled: boolean;
  required: boolean;
  order: number;
}

// UTILITY FUNCTIONS
export function createEmptyResumeData(userId?: string): CoreResumeData {
  return {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    awards: [],
    volunteerWork: [],
    references: [],
    interests: [],
    settings: {
      templateId: 'modern',
      colorScheme: 'blue',
      fontFamily: 'Inter',
      fontSize: 14,
      spacing: 'normal',
      sectionOrder: ['personalInfo', 'experience', 'education', 'skills'],
    },
    metadata: {
      userId,
      title: 'Untitled Resume',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function validateResumeData(data: Partial<CoreResumeData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.personalInfo?.fullName?.trim()) {
    errors.push('Full name is required');
  }
  
  if (!data.personalInfo?.email?.trim()) {
    errors.push('Email is required');
  }
  
  if (data.personalInfo?.email && !/\S+@\S+\.\S+/.test(data.personalInfo.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.personalInfo?.phone?.trim()) {
    errors.push('Phone number is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function generateResumeId(): string {
  return `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// DEFAULT SECTION CONFIGURATIONS
export const DEFAULT_SECTIONS: SectionConfiguration[] = [
  { id: 'personalInfo', title: 'Personal Information', enabled: true, required: true, order: 1 },
  { id: 'experience', title: 'Work Experience', enabled: true, required: true, order: 2 },
  { id: 'education', title: 'Education', enabled: true, required: false, order: 3 },
  { id: 'skills', title: 'Skills', enabled: true, required: false, order: 4 },
  { id: 'projects', title: 'Projects', enabled: false, required: false, order: 5 },
  { id: 'certifications', title: 'Certifications', enabled: false, required: false, order: 6 },
  { id: 'awards', title: 'Awards', enabled: false, required: false, order: 7 },
  { id: 'volunteerWork', title: 'Volunteer Work', enabled: false, required: false, order: 8 },
  { id: 'references', title: 'References', enabled: false, required: false, order: 9 },
  { id: 'interests', title: 'Interests', enabled: false, required: false, order: 10 },
];