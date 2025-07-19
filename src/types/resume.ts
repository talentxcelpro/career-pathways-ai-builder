
// Clean, focused resume data types
export interface ResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
}

export interface ResumeExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface ResumeSkill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Resume {
  id?: string;
  personalInfo: ResumePersonalInfo;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  selectedTemplate: string;
  atsScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'modern' | 'classic' | 'creative' | 'technical';
  atsOptimized: boolean;
}

export interface ExtractionResult {
  success: boolean;
  resume?: Resume;
  confidence: number;
  errors?: string[];
  suggestions?: string[];
}
