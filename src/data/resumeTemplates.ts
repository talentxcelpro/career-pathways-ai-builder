import { TemplateMetadata } from '@/types/resume-templates';

export type ResumeTemplate = TemplateMetadata & {
  preview: string;
  atsOptimized?: boolean;
  isRecommended?: boolean;
  layout?: any;
};

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean, ATS-friendly design perfect for corporate roles',
    category: 'modern-stylish',
    format: 'reverse-chronological',
    designStyle: 'single-column',
    bestForRoles: ['Software Engineer', 'Product Manager', 'Business Analyst'],
    experienceLevel: ['mid-level', 'senior'] as any,
    atsScore: 95,
    isPremium: false,
    isNewTemplate: true,
    tags: ['ATS-optimized', 'Clean', 'Professional'],
    colorSchemes: [
      {
        id: 'blue',
        name: 'Professional Blue',
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['ats-optimized', 'single-column', 'modern-design', 'clean-layout'] as any,
    industry: ['technology', 'finance', 'consulting'] as any,
    usageCount: 0,
    rating: 4.8,
    preview: '/templates/modern-professional.png',
    atsOptimized: true,
    isRecommended: true
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'Sophisticated design for senior leadership positions',
    category: 'executive-leadership',
    format: 'executive',
    designStyle: 'sidebar-left',
    bestForRoles: ['CEO', 'VP', 'Director', 'Senior Manager'],
    experienceLevel: ['senior', 'executive'],
    atsScore: 90,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Executive', 'Leadership', 'Premium'],
    colorSchemes: [
      {
        id: 'charcoal',
        name: 'Executive Charcoal',
        primary: '#1f2937',
        secondary: '#374151',
        accent: '#6b7280',
        text: '#111827',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['executive-summary', 'achievement-focus', 'leadership-metrics', 'sophisticated-design'],
    industry: ['corporate', 'consulting', 'finance'],
    usageCount: 0,
    rating: 4.9,
    preview: '/templates/executive-premium.png',
    atsOptimized: true
  },
  {
    id: 'tech-specialist',
    name: 'Tech Specialist',
    description: 'Optimized for software engineers and tech professionals',
    category: 'industry-specific',
    format: 'reverse-chronological',
    designStyle: 'two-column',
    bestForRoles: ['Software Engineer', 'DevOps Engineer', 'Data Scientist'],
    experienceLevel: ['junior', 'mid-level', 'senior'],
    atsScore: 98,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Tech', 'Engineering', 'ATS-optimized'],
    colorSchemes: [
      {
        id: 'teal',
        name: 'Tech Teal',
        primary: '#0d9488',
        secondary: '#0f766e',
        accent: '#14b8a6',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['technical-skills', 'github-integration', 'projects-showcase', 'ats-optimized'],
    industry: ['technology', 'startup'],
    usageCount: 0,
    rating: 4.9,
    preview: '/templates/tech-specialist.png',
    atsOptimized: true,
    isRecommended: true
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    description: 'Visual design for creatives and designers',
    category: 'creative-portfolio',
    format: 'creative',
    designStyle: 'visual-heavy',
    bestForRoles: ['Designer', 'Creative Director', 'Artist', 'Photographer'],
    experienceLevel: ['junior', 'mid-level', 'senior'],
    atsScore: 75,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Creative', 'Visual', 'Portfolio'],
    colorSchemes: [
      {
        id: 'purple',
        name: 'Creative Purple',
        primary: '#7c3aed',
        secondary: '#6d28d9',
        accent: '#8b5cf6',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['portfolio-showcase', 'creative-layout', 'visual-elements', 'color-accents'],
    industry: ['creative', 'marketing'],
    usageCount: 0,
    rating: 4.7,
    preview: '/templates/creative-portfolio.png',
    atsOptimized: false
  },
  {
    id: 'minimalist-ats',
    name: 'Minimalist ATS',
    description: 'Ultra-clean design maximized for ATS parsing',
    category: 'classic-ats',
    format: 'reverse-chronological',
    designStyle: 'minimal',
    bestForRoles: ['All Roles'],
    experienceLevel: ['entry-level', 'junior', 'mid-level', 'senior'],
    atsScore: 100,
    isPremium: false,
    isNewTemplate: true,
    tags: ['ATS-100', 'Minimal', 'Universal'],
    colorSchemes: [
      {
        id: 'black',
        name: 'Classic Black',
        primary: '#000000',
        secondary: '#374151',
        accent: '#6b7280',
        text: '#111827',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['ats-optimized', 'minimal-design', 'universal-format', 'keyword-placement'],
    industry: ['technology', 'finance', 'healthcare', 'education', 'consulting'],
    usageCount: 0,
    rating: 4.9,
    preview: '/templates/minimalist-ats.png',
    atsOptimized: true,
    isRecommended: true
  },
  {
    id: 'entry-level-fresh',
    name: 'Entry Level Fresh',
    description: 'Perfect for recent graduates and career starters',
    category: 'experience-based',
    format: 'functional',
    designStyle: 'single-column',
    bestForRoles: ['Graduate', 'Intern', 'Junior'],
    experienceLevel: ['entry-level'],
    atsScore: 92,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Entry-Level', 'Graduate', 'Skills-Focus'],
    colorSchemes: [
      {
        id: 'green',
        name: 'Fresh Green',
        primary: '#059669',
        secondary: '#047857',
        accent: '#10b981',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['education-focus', 'skill-focus', 'internship-highlight', 'potential-based'],
    industry: ['technology', 'education', 'startup'],
    usageCount: 0,
    rating: 4.6,
    preview: '/templates/entry-level-fresh.png',
    atsOptimized: true
  },
  {
    id: 'career-switcher',
    name: 'Career Switcher',
    description: 'Emphasizes transferable skills for career changes',
    category: 'experience-based',
    format: 'hybrid',
    designStyle: 'two-column',
    bestForRoles: ['Career Changer', 'Transitioning Professional'],
    experienceLevel: ['career-switcher', 'mid-level'],
    atsScore: 88,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Career-Change', 'Transferable-Skills', 'Hybrid'],
    colorSchemes: [
      {
        id: 'orange',
        name: 'Transition Orange',
        primary: '#ea580c',
        secondary: '#c2410c',
        accent: '#f97316',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['transferable-skills', 'skill-translation', 'career-narrative', 'achievement-focus'],
    industry: ['technology', 'consulting', 'sales', 'marketing'],
    usageCount: 0,
    rating: 4.7,
    preview: '/templates/career-switcher.png',
    atsOptimized: true
  },
  {
    id: 'academic-research',
    name: 'Academic Research',
    description: 'Designed for researchers and academic positions',
    category: 'academic-research',
    format: 'academic',
    designStyle: 'text-heavy',
    bestForRoles: ['Researcher', 'Professor', 'PhD Candidate'],
    experienceLevel: ['mid-level', 'senior', 'executive'],
    atsScore: 85,
    isPremium: false,
    isNewTemplate: false,
    tags: ['Academic', 'Research', 'Publications'],
    colorSchemes: [
      {
        id: 'navy',
        name: 'Academic Navy',
        primary: '#1e3a8a',
        secondary: '#1e40af',
        accent: '#3b82f6',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['publications', 'research-focus', 'academic-format', 'references'],
    industry: ['education', 'research'],
    usageCount: 0,
    rating: 4.8,
    preview: '/templates/academic-research.png',
    atsOptimized: true
  },
  {
    id: 'sales-marketing',
    name: 'Sales & Marketing Pro',
    description: 'Results-focused design for sales and marketing professionals',
    category: 'industry-specific',
    format: 'reverse-chronological',
    designStyle: 'sidebar-right',
    bestForRoles: ['Sales Manager', 'Marketing Manager', 'Business Development'],
    experienceLevel: ['mid-level', 'senior'],
    atsScore: 91,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Sales', 'Marketing', 'Results-Driven'],
    colorSchemes: [
      {
        id: 'red',
        name: 'Impact Red',
        primary: '#dc2626',
        secondary: '#b91c1c',
        accent: '#ef4444',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['achievement-focus', 'financial-metrics', 'skill-highlights', 'visual-hierarchy'],
    industry: ['sales', 'marketing', 'startup'],
    usageCount: 0,
    rating: 4.8,
    preview: '/templates/sales-marketing.png',
    atsOptimized: true
  },
  {
    id: 'healthcare-medical',
    name: 'Healthcare Professional',
    description: 'Specialized for medical and healthcare professionals',
    category: 'industry-specific',
    format: 'reverse-chronological',
    designStyle: 'single-column',
    bestForRoles: ['Doctor', 'Nurse', 'Healthcare Administrator'],
    experienceLevel: ['mid-level', 'senior'],
    atsScore: 93,
    isPremium: false,
    isNewTemplate: false,
    tags: ['Healthcare', 'Medical', 'Professional'],
    colorSchemes: [
      {
        id: 'medicalblue',
        name: 'Medical Blue',
        primary: '#0369a1',
        secondary: '#075985',
        accent: '#0284c7',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['clinical-experience', 'certifications', 'medical-format', 'conservative-style'],
    industry: ['healthcare'],
    usageCount: 0,
    rating: 4.7,
    preview: '/templates/healthcare-medical.png',
    atsOptimized: true
  }
];

export const getTemplatesByCategory = (category: string): ResumeTemplate[] => {
  return resumeTemplates.filter(t => t.category === category as any);
};

export const getTemplateById = (id: string): ResumeTemplate | undefined => {
  return resumeTemplates.find(t => t.id === id);
};
