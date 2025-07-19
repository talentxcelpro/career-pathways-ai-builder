
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface ProfessionalSummary {
  content: string;
  keyHighlights?: string[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentRole: boolean;
  current?: boolean; // Alias for isCurrentRole
  description: string;
  achievements: string[];
  skills: string[];
  technologies?: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
  relevantCoursework?: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  years?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  githubUrl?: string;
  teamSize?: number;
  role?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expirationDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Award {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

// Additional interfaces for missing types
export interface Language {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'native';
  proficiency?: string;
  certifications?: string[];
}

export interface CareerObjectives {
  content: string;
  statement?: string;
  keyGoals?: string[];
  goals?: string[];
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  venue?: string;
  type?: string;
  date: string;
  publicationDate?: string;
  abstract?: string;
  url?: string;
  doi?: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
  available?: boolean;
}

export interface Training {
  id: string;
  name: string;
  title?: string;
  provider: string;
  date: string;
  completionDate?: string;
  duration?: string;
  description?: string;
  type?: string;
  certificateUrl?: string;
  skills?: string[];
}

export interface VolunteerWork {
  id: string;
  organization: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  description: string;
  impact?: string;
  achievements?: string[];
  skills?: string[];
}

export interface ToolsSection {
  id: string;
  category: string;
  tools: string[];
  development?: string[];
  design?: string[];
  analytics?: string[];
  productivity?: string[];
  other?: string[];
}

// Section management types
export type ResumeSectionType = 
  | 'personalInfo'
  | 'professionalSummary' 
  | 'experience'
  | 'workExperience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'languages'
  | 'careerObjectives'
  | 'publications'
  | 'references'
  | 'trainings'
  | 'volunteerWork'
  | 'tools';

// Alias for backward compatibility
export type WorkExperience = Experience;

export interface ResumeSection {
  id: ResumeSectionType;
  title: string;
  icon: string;
  enabled: boolean;
  order: number;
  required?: boolean;
  type?: string;
  group?: string;
}

export interface SectionGroup {
  id: string;
  title: string;
  color: string;
  description: string;
  sections: ResumeSectionType[];
}

export const SECTION_GROUPS: SectionGroup[] = [
  {
    id: 'core',
    title: 'Core Information',
    color: 'blue',
    description: 'Essential resume sections',
    sections: ['personalInfo', 'professionalSummary', 'experience', 'workExperience', 'education']
  },
  {
    id: 'skills',
    title: 'Skills & Expertise',
    color: 'green', 
    description: 'Technical and soft skills',
    sections: ['skills', 'tools', 'languages']
  },
  {
    id: 'achievements',
    title: 'Achievements & Projects',
    color: 'purple',
    description: 'Projects, certifications, and awards',
    sections: ['projects', 'certifications', 'awards']
  },
  {
    id: 'additional',
    title: 'Additional Sections',
    color: 'orange',
    description: 'Optional supplementary information',
    sections: ['publications', 'volunteerWork', 'trainings', 'references', 'careerObjectives']
  }
];

export const SECTION_METADATA: Record<ResumeSectionType, { title: string; icon: string; description: string }> = {
  personalInfo: { title: 'Personal Info', icon: 'User', description: 'Contact information and basic details' },
  professionalSummary: { title: 'Professional Summary', icon: 'FileText', description: 'Brief overview of your career' },
  experience: { title: 'Work Experience', icon: 'Briefcase', description: 'Professional work history' },
  workExperience: { title: 'Work Experience', icon: 'Briefcase', description: 'Professional work history' },
  education: { title: 'Education', icon: 'GraduationCap', description: 'Academic background' },
  skills: { title: 'Skills', icon: 'Zap', description: 'Technical and soft skills' },
  projects: { title: 'Projects', icon: 'Folder', description: 'Personal and professional projects' },
  certifications: { title: 'Certifications', icon: 'Award', description: 'Professional certifications' },
  awards: { title: 'Awards', icon: 'Trophy', description: 'Recognition and achievements' },
  languages: { title: 'Languages', icon: 'Globe', description: 'Language proficiencies' },
  careerObjectives: { title: 'Career Objectives', icon: 'Target', description: 'Career goals and aspirations' },
  publications: { title: 'Publications', icon: 'BookOpen', description: 'Research papers and articles' },
  references: { title: 'References', icon: 'Users', description: 'Professional references' },
  trainings: { title: 'Training', icon: 'Book', description: 'Professional development courses' },
  volunteerWork: { title: 'Volunteer Work', icon: 'Heart', description: 'Community service and volunteering' },
  tools: { title: 'Tools & Technologies', icon: 'Settings', description: 'Software and tools expertise' }
};

export const DEFAULT_SECTION_CONFIG: ResumeSection[] = [
  { id: 'personalInfo', title: 'Personal Info', icon: 'User', enabled: true, order: 1, required: true, type: 'core', group: 'core' },
  { id: 'professionalSummary', title: 'Professional Summary', icon: 'FileText', enabled: true, order: 2, type: 'core', group: 'core' },
  { id: 'workExperience', title: 'Work Experience', icon: 'Briefcase', enabled: true, order: 3, type: 'core', group: 'core' },
  { id: 'education', title: 'Education', icon: 'GraduationCap', enabled: true, order: 4, type: 'core', group: 'core' },
  { id: 'skills', title: 'Skills', icon: 'Zap', enabled: true, order: 5, type: 'skills', group: 'skills' },
  { id: 'projects', title: 'Projects', icon: 'Folder', enabled: false, order: 6, type: 'achievements', group: 'achievements' },
  { id: 'certifications', title: 'Certifications', icon: 'Award', enabled: false, order: 7, type: 'achievements', group: 'achievements' },
  { id: 'awards', title: 'Awards', icon: 'Trophy', enabled: false, order: 8, type: 'achievements', group: 'achievements' },
  { id: 'languages', title: 'Languages', icon: 'Globe', enabled: false, order: 9, type: 'skills', group: 'skills' },
  { id: 'careerObjectives', title: 'Career Objectives', icon: 'Target', enabled: false, order: 10, type: 'additional', group: 'additional' },
  { id: 'publications', title: 'Publications', icon: 'BookOpen', enabled: false, order: 11, type: 'additional', group: 'additional' },
  { id: 'references', title: 'References', icon: 'Users', enabled: false, order: 12, type: 'additional', group: 'additional' },
  { id: 'trainings', title: 'Training', icon: 'Book', enabled: false, order: 13, type: 'additional', group: 'additional' },
  { id: 'volunteerWork', title: 'Volunteer Work', icon: 'Heart', enabled: false, order: 14, type: 'additional', group: 'additional' },
  { id: 'tools', title: 'Tools & Technologies', icon: 'Settings', enabled: false, order: 15, type: 'skills', group: 'skills' }
];

export interface EnhancedResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: ProfessionalSummary;
  experience: Experience[];
  workExperience?: Experience[]; // Alias for backward compatibility
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  languages?: Language[];
  careerObjectives?: CareerObjectives;
  publications?: Publication[];
  references?: Reference[];
  trainings?: Training[];
  volunteerWork?: VolunteerWork[];
  tools?: ToolsSection[];
  sectionOrder: string[];
  selectedTemplate: string;
  sectionConfig: ResumeSection[];
  customization: {
    colorScheme: string;
    fontFamily: string;
    fontSize: number;
    spacing: 'compact' | 'normal' | 'spacious';
  };
}
