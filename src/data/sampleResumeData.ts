
import { EnhancedResumeData } from '@/types/enhanced-resume';

export const sampleResumeData: EnhancedResumeData = {
  personalInfo: {
    fullName: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/sarahchen",
    website: "sarahchen.dev",
    summary: "Senior Product Manager with 5+ years of experience leading cross-functional teams to deliver innovative digital products. Proven track record of increasing user engagement by 40% and driving $2M+ in revenue growth."
  },
  professionalSummary: {
    content: "Results-driven Product Manager with expertise in agile development, user experience design, and data-driven decision making. Successfully launched 15+ product features, managed teams of 8-12 professionals, and consistently exceeded KPI targets."
  },
  experience: [
    {
      id: "exp-1",
      title: "Senior Product Manager",
      company: "TechFlow Inc.",
      location: "San Francisco, CA",
      startDate: "Jan 2021",
      endDate: "Present",
      current: true,
      isCurrentRole: true,
      description: "Led product strategy for B2B SaaS platform serving 50K+ users. Collaborated with engineering, design, and marketing teams to deliver features that increased user retention by 35%.",
      achievements: [
        "Launched mobile app that generated $1.2M ARR within 6 months",
        "Reduced customer churn by 25% through data-driven product improvements",
        "Managed product roadmap for 3 engineering teams (12 developers)"
      ],
      skills: ["Product Strategy", "Agile/Scrum", "Team Leadership"],
      technologies: ["Jira", "Figma", "SQL", "Analytics"]
    },
    {
      id: "exp-2",
      title: "Product Manager",
      company: "StartupXYZ",
      location: "Palo Alto, CA",
      startDate: "Jun 2019",
      endDate: "Dec 2020",
      current: false,
      isCurrentRole: false,
      description: "Owned end-to-end product development for consumer mobile app. Conducted user research, defined requirements, and worked closely with UX/UI designers to create intuitive user experiences.",
      achievements: [
        "Grew daily active users from 10K to 50K in 18 months",
        "Implemented A/B testing framework that improved conversion by 22%"
      ],
      skills: ["User Research", "Product Design", "Data Analysis"],
      technologies: ["React Native", "Firebase", "Mixpanel"]
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "Master of Business Administration",
      school: "Stanford Graduate School of Business",
      location: "Stanford, CA",
      startDate: "2017",
      endDate: "2019",
      gpa: "3.8"
    },
    {
      id: "edu-2",
      degree: "Bachelor of Science in Computer Science",
      school: "UC Berkeley",
      location: "Berkeley, CA",
      startDate: "2013",
      endDate: "2017",
      gpa: "3.7"
    }
  ],
  skills: [
    { id: "skill-1", name: "Product Strategy", level: "expert", category: "technical" },
    { id: "skill-2", name: "Agile/Scrum", level: "expert", category: "technical" },
    { id: "skill-3", name: "Data Analysis", level: "advanced", category: "technical" },
    { id: "skill-4", name: "User Research", level: "advanced", category: "technical" },
    { id: "skill-5", name: "Figma/Design", level: "intermediate", category: "technical" },
    { id: "skill-6", name: "SQL", level: "intermediate", category: "technical" },
    { id: "skill-7", name: "Python", level: "beginner", category: "technical" }
  ],
  projects: [
    {
      id: "proj-1",
      title: "AI-Powered Recommendation Engine",
      description: "Led development of machine learning recommendation system that increased user engagement by 45%",
      technologies: ["Python", "TensorFlow", "AWS", "PostgreSQL"],
      startDate: "2022",
      endDate: "2023"
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Certified Scrum Product Owner",
      issuer: "Scrum Alliance",
      date: "2021"
    }
  ],
  awards: [],
  sectionOrder: ['personalInfo', 'professionalSummary', 'experience', 'education', 'skills', 'projects', 'certifications'],
  selectedTemplate: 'modern',
  customization: {
    colorScheme: 'professional-blue',
    fontFamily: 'Inter',
    fontSize: 12,
    spacing: 'normal' as const
  }
};

export const colorSchemes = {
  professionalBlue: {
    id: 'professional-blue',
    name: 'Professional Blue',
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    text: '#1f2937',
    background: '#ffffff',
    isDefault: true
  },
  creativeGreen: {
    id: 'creative-green',
    name: 'Creative Green',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#34d399',
    text: '#1f2937',
    background: '#ffffff',
    isDefault: false
  },
  elegantPurple: {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    primary: '#7c3aed',
    secondary: '#a855f7',
    accent: '#c084fc',
    text: '#1f2937',
    background: '#ffffff',
    isDefault: false
  },
  boldOrange: {
    id: 'bold-orange',
    name: 'Bold Orange',
    primary: '#ea580c',
    secondary: '#f97316',
    accent: '#fb923c',
    text: '#1f2937',
    background: '#ffffff',
    isDefault: false
  },
  modernGray: {
    id: 'modern-gray',
    name: 'Modern Gray',
    primary: '#374151',
    secondary: '#6b7280',
    accent: '#9ca3af',
    text: '#1f2937',
    background: '#ffffff',
    isDefault: false
  }
};
