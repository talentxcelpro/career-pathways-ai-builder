// Enhanced Resume Data Types with all 21 sections

export interface ResumeSection {
  id: string;
  type: ResumeSectionType;
  enabled: boolean;
  order: number;
  group: SectionGroup;
}

export type ResumeSectionType = 
  | 'personalInfo'
  | 'professionalSummary'
  | 'keySkills'
  | 'workExperience'
  | 'education'
  | 'certifications'
  | 'projects'
  | 'languages'
  | 'volunteerWork'
  | 'awards'
  | 'trainings'
  | 'tools'
  | 'publications'
  | 'openSource'
  | 'academicProjects'
  | 'researchInterests'
  | 'patents'
  | 'speakingEngagements'
  | 'portfolioLinks'
  | 'careerObjectives'
  | 'references';

export type SectionGroup = 'basicInfo' | 'professional' | 'credentials' | 'extras';

export interface EnhancedResumeData {
  // Basic Info Group
  personalInfo: PersonalInfo;
  professionalSummary: ProfessionalSummary;
  careerObjectives?: CareerObjectives;

  // Professional Background Group
  workExperience: WorkExperience[];
  projects: Project[];
  keySkills: SkillsSection;
  tools: ToolsSection;

  // Education & Credentials Group
  education: Education[];
  certifications: Certification[];
  trainings: Training[];

  // Extras Group
  awards: Award[];
  volunteerWork: VolunteerWork[];
  languages: Language[];
  publications: Publication[];
  patents: Patent[];
  openSource: OpenSource[];
  academicProjects: AcademicProject[];
  researchInterests: ResearchInterests;
  speakingEngagements: SpeakingEngagement[];
  portfolioLinks: PortfolioLink[];
  references: Reference[];

  // Meta data
  sectionConfig: ResumeSection[];
  templateId?: string;
  versions?: ResumeVersion[];
}

// Section Interfaces
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface ProfessionalSummary {
  content: string;
  keyHighlights?: string[];
}

export interface CareerObjectives {
  statement: string;
  goals?: string[];
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies?: string[];
  teamSize?: number;
  reportingTo?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
  status: 'completed' | 'ongoing' | 'planned';
  url?: string;
  github?: string;
  role: string;
  teamSize?: number;
  impact?: string;
}

export interface SkillsSection {
  technical: Skill[];
  soft: Skill[];
  domain: Skill[];
  frameworks: Skill[];
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  lastUsed?: string;
}

export interface ToolsSection {
  development: string[];
  design: string[];
  analytics: string[];
  productivity: string[];
  other: string[];
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
  relevantCoursework?: string[];
  thesis?: string;
  advisor?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
  skills?: string[];
}

export interface Training {
  id: string;
  title: string;
  provider: string;
  completionDate: string;
  duration?: string;
  type: 'online' | 'offline' | 'workshop' | 'bootcamp';
  certificateUrl?: string;
  skills?: string[];
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  category: 'academic' | 'professional' | 'community' | 'competition';
  level: 'local' | 'regional' | 'national' | 'international';
}

export interface VolunteerWork {
  id: string;
  role: string;
  organization: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  impact?: string;
  skills?: string[];
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
  authors: string[];
  venue: string;
  date: string;
  type: 'journal' | 'conference' | 'workshop' | 'book' | 'blog';
  url?: string;
  doi?: string;
  abstract?: string;
}

export interface Patent {
  id: string;
  title: string;
  patentNumber: string;
  applicationDate: string;
  grantDate?: string;
  inventors: string[];
  description: string;
  status: 'pending' | 'granted' | 'rejected';
}

export interface OpenSource {
  id: string;
  projectName: string;
  description: string;
  role: string;
  technologies: string[];
  url: string;
  contributions: string[];
  startDate: string;
  endDate?: string;
  stars?: number;
  forks?: number;
}

export interface AcademicProject {
  id: string;
  title: string;
  description: string;
  course: string;
  professor?: string;
  collaborators?: string[];
  technologies: string[];
  startDate: string;
  endDate: string;
  grade?: string;
  url?: string;
}

export interface ResearchInterests {
  areas: string[];
  description?: string;
  publications?: string[];
  currentProjects?: string[];
}

export interface SpeakingEngagement {
  id: string;
  title: string;
  event: string;
  location: string;
  date: string;
  type: 'keynote' | 'panel' | 'talk' | 'workshop' | 'podcast' | 'webinar';
  audience?: string;
  url?: string;
  topics: string[];
}

export interface PortfolioLink {
  id: string;
  title: string;
  url: string;
  type: 'website' | 'github' | 'behance' | 'dribbble' | 'linkedin' | 'other';
  description?: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  relationship: string;
  available: boolean;
}

export interface ResumeVersion {
  id: string;
  name: string;
  description?: string;
  targetRole?: string;
  targetCompany?: string;
  createdAt: string;
  data: EnhancedResumeData;
}

// Section Configuration
export const SECTION_GROUPS: Record<SectionGroup, { title: string; description: string; color: string }> = {
  basicInfo: {
    title: 'Basic Information',
    description: 'Essential personal and professional details',
    color: 'bg-blue-50 border-blue-200'
  },
  professional: {
    title: 'Professional Background',
    description: 'Work experience, projects, and skills',
    color: 'bg-green-50 border-green-200'
  },
  credentials: {
    title: 'Education & Credentials',
    description: 'Academic background and certifications',
    color: 'bg-yellow-50 border-yellow-200'
  },
  extras: {
    title: 'Additional Information',
    description: 'Awards, volunteer work, and other achievements',
    color: 'bg-purple-50 border-purple-200'
  }
};

export const DEFAULT_SECTION_CONFIG: ResumeSection[] = [
  // Basic Info Group
  { id: 'personalInfo', type: 'personalInfo', enabled: true, order: 1, group: 'basicInfo' },
  { id: 'professionalSummary', type: 'professionalSummary', enabled: true, order: 2, group: 'basicInfo' },
  { id: 'careerObjectives', type: 'careerObjectives', enabled: false, order: 3, group: 'basicInfo' },

  // Professional Group
  { id: 'workExperience', type: 'workExperience', enabled: true, order: 4, group: 'professional' },
  { id: 'keySkills', type: 'keySkills', enabled: true, order: 5, group: 'professional' },
  { id: 'projects', type: 'projects', enabled: true, order: 6, group: 'professional' },
  { id: 'tools', type: 'tools', enabled: false, order: 7, group: 'professional' },

  // Credentials Group
  { id: 'education', type: 'education', enabled: true, order: 8, group: 'credentials' },
  { id: 'certifications', type: 'certifications', enabled: true, order: 9, group: 'credentials' },
  { id: 'trainings', type: 'trainings', enabled: false, order: 10, group: 'credentials' },

  // Extras Group
  { id: 'awards', type: 'awards', enabled: false, order: 11, group: 'extras' },
  { id: 'volunteerWork', type: 'volunteerWork', enabled: false, order: 12, group: 'extras' },
  { id: 'languages', type: 'languages', enabled: false, order: 13, group: 'extras' },
  { id: 'publications', type: 'publications', enabled: false, order: 14, group: 'extras' },
  { id: 'patents', type: 'patents', enabled: false, order: 15, group: 'extras' },
  { id: 'openSource', type: 'openSource', enabled: false, order: 16, group: 'extras' },
  { id: 'academicProjects', type: 'academicProjects', enabled: false, order: 17, group: 'extras' },
  { id: 'researchInterests', type: 'researchInterests', enabled: false, order: 18, group: 'extras' },
  { id: 'speakingEngagements', type: 'speakingEngagements', enabled: false, order: 19, group: 'extras' },
  { id: 'portfolioLinks', type: 'portfolioLinks', enabled: false, order: 20, group: 'extras' },
  { id: 'references', type: 'references', enabled: false, order: 21, group: 'extras' }
];

export const SECTION_METADATA: Record<ResumeSectionType, {
  title: string;
  description: string;
  icon: string;
  required: boolean;
  maxItems?: number;
  recommendedFor: string[];
}> = {
  personalInfo: {
    title: 'Personal Details',
    description: 'Contact information and basic details',
    icon: 'User',
    required: true,
    recommendedFor: ['all']
  },
  professionalSummary: {
    title: 'Professional Summary',
    description: 'Brief overview of your background and goals',
    icon: 'FileText',
    required: true,
    recommendedFor: ['all']
  },
  careerObjectives: {
    title: 'Career Objectives',
    description: 'Your career goals and aspirations',
    icon: 'Target',
    required: false,
    recommendedFor: ['entry-level', 'career-change']
  },
  workExperience: {
    title: 'Work Experience',
    description: 'Professional work history and achievements',
    icon: 'Briefcase',
    required: true,
    recommendedFor: ['all']
  },
  projects: {
    title: 'Projects',
    description: 'Key projects and case studies',
    icon: 'FolderOpen',
    required: false,
    recommendedFor: ['technical', 'creative', 'student']
  },
  keySkills: {
    title: 'Key Skills',
    description: 'Technical and soft skills',
    icon: 'Zap',
    required: true,
    recommendedFor: ['all']
  },
  tools: {
    title: 'Tools & Technologies',
    description: 'Software, platforms, and tools you use',
    icon: 'Wrench',
    required: false,
    recommendedFor: ['technical', 'design']
  },
  education: {
    title: 'Education',
    description: 'Academic background and qualifications',
    icon: 'GraduationCap',
    required: true,
    recommendedFor: ['all']
  },
  certifications: {
    title: 'Certifications',
    description: 'Professional certifications and licenses',
    icon: 'Award',
    required: false,
    recommendedFor: ['technical', 'professional']
  },
  trainings: {
    title: 'Trainings & Workshops',
    description: 'Additional learning and development',
    icon: 'BookOpen',
    required: false,
    recommendedFor: ['all']
  },
  awards: {
    title: 'Awards & Achievements',
    description: 'Recognition and honors received',
    icon: 'Trophy',
    required: false,
    recommendedFor: ['all']
  },
  volunteerWork: {
    title: 'Volunteer Work',
    description: 'Community service and volunteer experience',
    icon: 'Heart',
    required: false,
    recommendedFor: ['all']
  },
  languages: {
    title: 'Languages',
    description: 'Spoken and written languages',
    icon: 'Globe',
    required: false,
    recommendedFor: ['all']
  },
  publications: {
    title: 'Publications',
    description: 'Research papers, articles, and publications',
    icon: 'Book',
    required: false,
    recommendedFor: ['academic', 'research']
  },
  patents: {
    title: 'Patents',
    description: 'Intellectual property and patents',
    icon: 'Shield',
    required: false,
    recommendedFor: ['technical', 'research']
  },
  openSource: {
    title: 'Open Source',
    description: 'Open source contributions and projects',
    icon: 'Github',
    required: false,
    recommendedFor: ['technical']
  },
  academicProjects: {
    title: 'Academic Projects',
    description: 'University and academic projects',
    icon: 'School',
    required: false,
    recommendedFor: ['student', 'recent-graduate']
  },
  researchInterests: {
    title: 'Research Interests',
    description: 'Areas of research and academic interest',
    icon: 'Search',
    required: false,
    recommendedFor: ['academic', 'research']
  },
  speakingEngagements: {
    title: 'Speaking Engagements',
    description: 'Conferences, talks, and presentations',
    icon: 'Mic',
    required: false,
    recommendedFor: ['senior', 'thought-leader']
  },
  portfolioLinks: {
    title: 'Portfolio Links',
    description: 'Online portfolio and work samples',
    icon: 'ExternalLink',
    required: false,
    recommendedFor: ['creative', 'technical']
  },
  references: {
    title: 'References',
    description: 'Professional references and contacts',
    icon: 'Users',
    required: false,
    recommendedFor: ['all']
  }
};