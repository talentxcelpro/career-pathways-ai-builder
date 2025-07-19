
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
  current: boolean;
  description: string;
  achievements: string[];
  skills: string[];
  technologies: string[];
}

// Alias for backward compatibility
export type WorkExperience = Experience;

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

export interface Language {
  id: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  certifications?: string[];
}

export interface Publication {
  id: string;
  title: string;
  journal: string;
  authors: string | string[];
  venue: string;
  date: string;
  publicationDate: string;
  type: 'journal' | 'conference' | 'book' | 'other';
  url?: string;
  doi?: string;
  abstract?: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
  available: boolean;
}

export interface VolunteerWork {
  id: string;
  role: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  impact: string;
  skills?: string[];
}

export interface Training {
  id: string;
  title: string;
  provider: string;
  completionDate: string;
  duration: string;
  type: 'online' | 'offline' | 'workshop' | 'bootcamp';
  certificateUrl?: string;
  skills?: string[];
}

export interface ToolsSection {
  development: string[];
  design: string[];
  analytics: string[];
  productivity: string[];
  other: string[];
}

export interface CareerObjectives {
  statement: string;
  goals?: string[];
}

export type ResumeSectionType = 
  | 'personalInfo'
  | 'professionalSummary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'languages'
  | 'publications'
  | 'references'
  | 'volunteerWork'
  | 'trainings'
  | 'tools'
  | 'careerObjectives';

export interface ResumeSection {
  id: ResumeSectionType;
  title: string;
  enabled: boolean;
  order: number;
  required?: boolean;
  description?: string;
  icon?: string;
  color?: string;
}

export interface SectionGroup {
  id: string;
  title: string;
  description: string;
  sections: ResumeSectionType[];
  color: string;
}

export interface SectionMetadata {
  title: string;
  description: string;
  icon: string;
  color: string;
  group: string;
  required?: boolean;
}

export const SECTION_METADATA: Record<ResumeSectionType, SectionMetadata> = {
  personalInfo: {
    title: 'Personal Information',
    description: 'Your basic contact information and details',
    icon: 'User',
    color: 'blue',
    group: 'basic',
    required: true
  },
  professionalSummary: {
    title: 'Professional Summary',
    description: 'A brief overview of your career and key achievements',
    icon: 'FileText',
    color: 'green',
    group: 'basic'
  },
  experience: {
    title: 'Work Experience',
    description: 'Your professional work history and achievements',
    icon: 'Briefcase',
    color: 'purple',
    group: 'basic',
    required: true
  },
  education: {
    title: 'Education',
    description: 'Your educational background and qualifications',
    icon: 'GraduationCap',
    color: 'indigo',
    group: 'basic'
  },
  skills: {
    title: 'Skills',
    description: 'Your technical and soft skills',
    icon: 'Code',
    color: 'orange',
    group: 'basic'
  },
  projects: {
    title: 'Projects',
    description: 'Notable projects you have worked on',
    icon: 'Folder',
    color: 'teal',
    group: 'additional'
  },
  certifications: {
    title: 'Certifications',
    description: 'Professional certifications and licenses',
    icon: 'Award',
    color: 'yellow',
    group: 'additional'
  },
  awards: {
    title: 'Awards',
    description: 'Recognition and awards received',
    icon: 'Trophy',
    color: 'gold',
    group: 'additional'
  },
  languages: {
    title: 'Languages',
    description: 'Languages you speak and your proficiency level',
    icon: 'Globe',
    color: 'cyan',
    group: 'additional'
  },
  publications: {
    title: 'Publications',
    description: 'Research papers, articles, and publications',
    icon: 'BookOpen',
    color: 'pink',
    group: 'academic'
  },
  references: {
    title: 'References',
    description: 'Professional references who can vouch for your work',
    icon: 'Users',
    color: 'gray',
    group: 'additional'
  },
  volunteerWork: {
    title: 'Volunteer Work',
    description: 'Volunteer experiences and community involvement',
    icon: 'Heart',
    color: 'red',
    group: 'additional'
  },
  trainings: {
    title: 'Training & Workshops',
    description: 'Professional development and training programs',
    icon: 'BookOpen',
    color: 'violet',
    group: 'additional'
  },
  tools: {
    title: 'Tools & Technologies',
    description: 'Software, tools, and technologies you use',
    icon: 'Wrench',
    color: 'slate',
    group: 'additional'
  },
  careerObjectives: {
    title: 'Career Objectives',
    description: 'Your career goals and aspirations',
    icon: 'Target',
    color: 'emerald',
    group: 'additional'
  }
};

export const SECTION_GROUPS: SectionGroup[] = [
  {
    id: 'basic',
    title: 'Essential Sections',
    description: 'Core sections that every resume should have',
    sections: ['personalInfo', 'professionalSummary', 'experience', 'education', 'skills'],
    color: 'blue'
  },
  {
    id: 'additional',
    title: 'Additional Sections',
    description: 'Optional sections to enhance your resume',
    sections: ['projects', 'certifications', 'awards', 'languages', 'references', 'volunteerWork', 'trainings', 'tools', 'careerObjectives'],
    color: 'green'
  },
  {
    id: 'academic',
    title: 'Academic Sections',
    description: 'Sections for academic and research positions',
    sections: ['publications'],
    color: 'purple'
  }
];

export const DEFAULT_SECTION_CONFIG: ResumeSection[] = [
  {
    id: 'personalInfo',
    title: 'Personal Information',
    enabled: true,
    order: 1,
    required: true
  },
  {
    id: 'professionalSummary',
    title: 'Professional Summary',
    enabled: true,
    order: 2
  },
  {
    id: 'experience',
    title: 'Work Experience',
    enabled: true,
    order: 3,
    required: true
  },
  {
    id: 'education',
    title: 'Education',
    enabled: true,
    order: 4
  },
  {
    id: 'skills',
    title: 'Skills',
    enabled: true,
    order: 5
  },
  {
    id: 'projects',
    title: 'Projects',
    enabled: false,
    order: 6
  },
  {
    id: 'certifications',
    title: 'Certifications',
    enabled: false,
    order: 7
  },
  {
    id: 'awards',
    title: 'Awards',
    enabled: false,
    order: 8
  },
  {
    id: 'languages',
    title: 'Languages',
    enabled: false,
    order: 9
  },
  {
    id: 'publications',
    title: 'Publications',
    enabled: false,
    order: 10
  },
  {
    id: 'references',
    title: 'References',
    enabled: false,
    order: 11
  },
  {
    id: 'volunteerWork',
    title: 'Volunteer Work',
    enabled: false,
    order: 12
  },
  {
    id: 'trainings',
    title: 'Training & Workshops',
    enabled: false,
    order: 13
  },
  {
    id: 'tools',
    title: 'Tools & Technologies',
    enabled: false,
    order: 14
  },
  {
    id: 'careerObjectives',
    title: 'Career Objectives',
    enabled: false,
    order: 15
  }
];

export interface EnhancedResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: ProfessionalSummary;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  languages?: Language[];
  publications?: Publication[];
  references?: Reference[];
  volunteerWork?: VolunteerWork[];
  trainings?: Training[];
  tools?: ToolsSection;
  careerObjectives?: CareerObjectives;
  sectionOrder: string[];
  sectionConfig?: ResumeSection[];
  selectedTemplate: string;
  customization: {
    colorScheme: string;
    fontFamily: string;
    fontSize: number;
    spacing: 'compact' | 'normal' | 'spacious';
  };
}

// Legacy interface for backward compatibility
export interface ProcessedResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
}
