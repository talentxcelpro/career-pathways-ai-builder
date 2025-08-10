// Canonical Editor Resume schema used for storage and interchange
// This matches the JSON structure provided by product requirements

export interface EditorPersonalInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
}

export interface EditorExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string; // YYYY-MM or ISO
  endDate: string;   // YYYY-MM or ISO, empty means present
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface EditorEducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
}

export interface EditorProjectsItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface EditorCertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
}

export interface EditorAwardItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface EditorVolunteerItem {
  id: string;
  role: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EditorReferenceItem {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
}

export interface EditorBranding {
  logoUrl: string;
  tagline: string;
  colorScheme: string; // hex or theme name
}

export interface EditorHistoryEntry {
  version: number;
  timestamp: string; // ISO datetime
  changesSummary: string;
  dataSnapshot: Record<string, any>;
}

export interface EditorSettings {
  templateId: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  sectionOrder: string[];
}

export interface EditorSkills {
  technical: string[];
  soft: string[];
  languages: string[];
  tools: string[];
}

export interface EditorResume {
  personalInfo: EditorPersonalInfo;
  experience: EditorExperienceItem[];
  education: EditorEducationItem[];
  skills: EditorSkills;
  projects: EditorProjectsItem[];
  certifications: EditorCertificationItem[];
  awards: EditorAwardItem[];
  volunteerExperience: EditorVolunteerItem[];
  interests: string[];
  references: EditorReferenceItem[];
  branding: EditorBranding;
  history: EditorHistoryEntry[];
  settings: EditorSettings;
}

export const createEmptyEditorResume = (): EditorResume => ({
  personalInfo: {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: { technical: [], soft: [], languages: [], tools: [] },
  projects: [],
  certifications: [],
  awards: [],
  volunteerExperience: [],
  interests: [],
  references: [],
  branding: { logoUrl: '', tagline: '', colorScheme: '' },
  history: [],
  settings: {
    templateId: 'default-template',
    fontFamily: 'Arial',
    fontSize: 12,
    lineHeight: 1.5,
    sectionOrder: [
      'personalInfo',
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
      'awards',
      'volunteerExperience',
      'interests',
      'references',
    ],
  },
});
