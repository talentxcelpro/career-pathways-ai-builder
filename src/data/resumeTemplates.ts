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
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23ffffff" width="400" height="500"/%3E%3Crect fill="%232563eb" width="400" height="60"/%3E%3Ctext x="20" y="38" font-size="22" fill="white" font-weight="bold"%3EModern Professional%3C/text%3E%3Crect fill="%23f3f4f6" width="360" height="40" x="20" y="80" rx="4"/%3E%3Crect fill="%23f3f4f6" width="360" height="120" x="20" y="135" rx="4"/%3E%3Crect fill="%23f3f4f6" width="360" height="100" x="20" y="270" rx="4"/%3E%3C/svg%3E',
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
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23f8f9fa" width="400" height="500"/%3E%3Crect fill="%231f2937" width="120" height="500"/%3E%3Ctext x="140" y="50" font-size="24" fill="%231f2937" font-weight="bold"%3EExecutive%3C/text%3E%3Ctext x="140" y="75" font-size="12" fill="%236b7280"%3ELeadership Focus%3C/text%3E%3Crect fill="white" width="240" height="60" x="140" y="100" rx="4"/%3E%3Crect fill="white" width="240" height="100" x="140" y="175" rx="4"/%3E%3Crect fill="%23374151" width="100" height="80" x="10" y="20" rx="4"/%3E%3C/svg%3E',
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
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23ffffff" width="400" height="500"/%3E%3Crect fill="%230d9488" width="150" height="500"/%3E%3Ctext x="165" y="35" font-size="24" fill="%231f2937" font-weight="bold"%3ETech Specialist%3C/text%3E%3Ctext x="165" y="58" font-size="11" fill="%236b7280"%3EEngineering Focus%3C/text%3E%3Crect fill="%23f0fdfa" width="220" height="70" x="165" y="80" rx="4"/%3E%3Crect fill="%23f0fdfa" width="220" height="110" x="165" y="165" rx="4"/%3E%3Crect fill="%2314b8a6" width="130" height="90" x="10" y="10" rx="4"/%3E%3C/svg%3E',
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
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Cdefs%3E%3ClinearGradient id="g2" x1="0" y1="0" x2="1" y2="1"%3E%3Cstop offset="0%25" stop-color="%23ec4899"/%3E%3Cstop offset="100%25" stop-color="%23a855f7"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="%23fef2f2" width="400" height="500"/%3E%3Crect fill="url(%23g2)" width="400" height="100"/%3E%3Ctext x="20" y="55" font-size="26" fill="white" font-weight="bold"%3ECreative Portfolio%3C/text%3E%3Crect fill="white" width="180" height="90" x="20" y="130" rx="8"/%3E%3Crect fill="white" width="180" height="90" x="210" y="130" rx="8"/%3E%3C/svg%3E',
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
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23ffffff" width="400" height="500"/%3E%3Ctext x="20" y="40" font-size="24" fill="%23111827" font-weight="bold"%3EMinimalist ATS%3C/text%3E%3Crect fill="%23f3f4f6" width="360" height="30" x="20" y="60" rx="2"/%3E%3Crect fill="%23f3f4f6" width="360" height="80" x="20" y="105" rx="2"/%3E%3Crect fill="%23f3f4f6" width="360" height="140" x="20" y="200" rx="2"/%3E%3C/svg%3E',
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
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23f0f9ff" width="400" height="500"/%3E%3Crect fill="%230ea5e9" width="400" height="70"/%3E%3Ctext x="20" y="42" font-size="24" fill="white" font-weight="bold"%3EEntry Level%3C/text%3E%3Crect fill="white" width="360" height="50" x="20" y="90" rx="4"/%3E%3Crect fill="white" width="360" height="100" x="20" y="155" rx="4"/%3E%3C/svg%3E',
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
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23fefce8" width="400" height="500"/%3E%3Crect fill="%23eab308" width="400" height="65"/%3E%3Ctext x="20" y="40" font-size="22" fill="white" font-weight="bold"%3ECareer Switcher%3C/text%3E%3Crect fill="white" width="360" height="90" x="20" y="85" rx="4"/%3E%3Crect fill="white" width="360" height="110" x="20" y="190" rx="4"/%3E%3C/svg%3E',
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
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23f9fafb" width="400" height="500"/%3E%3Ctext x="20" y="35" font-size="22" fill="%23111827" font-weight="600"%3EAcademic Research%3C/text%3E%3Crect fill="%23e5e7eb" width="360" height="35" x="20" y="55" rx="2"/%3E%3Crect fill="%23e5e7eb" width="360" height="85" x="20" y="105" rx="2"/%3E%3Crect fill="%23e5e7eb" width="360" height="120" x="20" y="205" rx="2"/%3E%3C/svg%3E',
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
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23fff7ed" width="400" height="500"/%3E%3Crect fill="%23f97316" width="400" height="75"/%3E%3Ctext x="20" y="45" font-size="24" fill="white" font-weight="bold"%3ESales%26Marketing%3C/text%3E%3Crect fill="white" width="360" height="60" x="20" y="95" rx="4"/%3E%3Crect fill="white" width="360" height="95" x="20" y="170" rx="4"/%3E%3C/svg%3E',
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
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23ecfdf5" width="400" height="500"/%3E%3Crect fill="%2310b981" width="400" height="70"/%3E%3Ctext x="20" y="42" font-size="23" fill="white" font-weight="bold"%3EHealthcare Medical%3C/text%3E%3Crect fill="white" width="360" height="55" x="20" y="90" rx="4"/%3E%3Crect fill="white" width="360" height="100" x="20" y="160" rx="4"/%3E%3C/svg%3E',
    atsOptimized: true
  },
  // Regional & Cultural Styles
  {
    id: 'european-elegant',
    name: 'European Elegant',
    description: 'Sophisticated European-style with photo header, popular in EU markets',
    category: 'modern-stylish',
    format: 'reverse-chronological',
    designStyle: 'sidebar-left',
    bestForRoles: ['All Professional Roles', 'Management', 'Consultant'],
    experienceLevel: ['mid-level', 'senior'],
    atsScore: 82,
    isPremium: false,
    isNewTemplate: true,
    tags: ['European', 'Photo-Header', 'Elegant'],
    colorSchemes: [
      {
        id: 'slate',
        name: 'European Slate',
        primary: '#475569',
        secondary: '#334155',
        accent: '#64748b',
        text: '#0f172a',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['photo-header', 'sidebar-layout', 'sophisticated-design', 'language-proficiency'],
    industry: ['consulting', 'corporate', 'finance'],
    usageCount: 0,
    rating: 4.7,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23fefce8" width="400" height="500"/%3E%3Ctext x="150" y="35" font-size="22" fill="%23854d0e" text-anchor="middle" font-weight="600"%3EEuropean Elegant%3C/text%3E%3Crect fill="white" width="300" height="50" x="50" y="60" rx="3"/%3E%3Crect fill="white" width="300" height="100" x="50" y="125" rx="3"/%3E%3C/svg%3E',
    atsOptimized: false
  },
  {
    id: 'asian-professional',
    name: 'Asian Professional',
    description: 'Compact, detailed format optimized for Asia-Pacific job markets',
    category: 'modern-stylish',
    format: 'reverse-chronological',
    designStyle: 'two-column',
    bestForRoles: ['All Roles', 'Engineer', 'Analyst'],
    experienceLevel: ['entry-level', 'junior', 'mid-level'],
    atsScore: 94,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Asian', 'Compact', 'Detailed'],
    colorSchemes: [
      {
        id: 'indigo',
        name: 'Professional Indigo',
        primary: '#4f46e5',
        secondary: '#4338ca',
        accent: '#6366f1',
        text: '#1e1b4b',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['photo-header', 'two-column', 'skill-bars', 'language-proficiency', 'ats-optimized'],
    industry: ['technology', 'finance', 'engineering'],
    usageCount: 0,
    rating: 4.8,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23fef2f2" width="400" height="500"/%3E%3Crect fill="%23dc2626" width="400" height="65"/%3E%3Ctext x="20" y="40" font-size="22" fill="white" font-weight="bold"%3EAsian Professional%3C/text%3E%3Crect fill="white" width="360" height="50" x="20" y="85" rx="3"/%3E%3Crect fill="white" width="360" height="90" x="20" y="150" rx="3"/%3E%3C/svg%3E',
    atsOptimized: true
  },
  {
    id: 'latin-american-vibrant',
    name: 'Latin American Vibrant',
    description: 'Colorful, personality-focused design reflecting Latin American business culture',
    category: 'modern-stylish',
    format: 'hybrid',
    designStyle: 'sidebar-right',
    bestForRoles: ['Sales', 'Marketing', 'Creative', 'Customer Success'],
    experienceLevel: ['junior', 'mid-level', 'senior'],
    atsScore: 80,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Vibrant', 'Colorful', 'Personality'],
    colorSchemes: [
      {
        id: 'warm',
        name: 'Warm Coral',
        primary: '#f97316',
        secondary: '#ea580c',
        accent: '#fb923c',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['color-accents', 'photo-header', 'social-media', 'skill-highlights'],
    industry: ['sales', 'marketing', 'creative'],
    usageCount: 0,
    rating: 4.6,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23fff1f2" width="400" height="500"/%3E%3Crect fill="%23fb923c" width="400" height="80"/%3E%3Ctext x="20" y="48" font-size="24" fill="white" font-weight="bold"%3ELatin American%3C/text%3E%3Crect fill="white" width="360" height="60" x="20" y="100" rx="4"/%3E%3Crect fill="white" width="360" height="95" x="20" y="175" rx="4"/%3E%3C/svg%3E',
    atsOptimized: false
  },
  {
    id: 'middle-eastern-conservative',
    name: 'Middle Eastern Conservative',
    description: 'Traditional, text-heavy format respecting Middle Eastern business preferences',
    category: 'classic-ats',
    format: 'reverse-chronological',
    designStyle: 'single-column',
    bestForRoles: ['All Professional Roles', 'Management', 'Finance'],
    experienceLevel: ['mid-level', 'senior', 'executive'],
    atsScore: 96,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Conservative', 'Traditional', 'Professional'],
    colorSchemes: [
      {
        id: 'darkblue',
        name: 'Conservative Navy',
        primary: '#1e3a8a',
        secondary: '#1e40af',
        accent: '#2563eb',
        text: '#0f172a',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['traditional-layout', 'ats-optimized', 'conservative-style', 'references'],
    industry: ['finance', 'legal', 'corporate', 'consulting'],
    usageCount: 0,
    rating: 4.8,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23faf5ff" width="400" height="500"/%3E%3Crect fill="%235b21b6" width="400" height="70"/%3E%3Ctext x="20" y="42" font-size="21" fill="white" font-weight="bold"%3EMiddle Eastern%3C/text%3E%3Crect fill="white" width="360" height="50" x="20" y="90" rx="3"/%3E%3Crect fill="white" width="360" height="100" x="20" y="155" rx="3"/%3E%3C/svg%3E',
    atsOptimized: true
  },
  {
    id: 'scandinavian-minimal',
    name: 'Scandinavian Minimal',
    description: 'Ultra-clean Nordic design philosophy with maximum white space',
    category: 'modern-stylish',
    format: 'one-page',
    designStyle: 'minimal',
    bestForRoles: ['Designer', 'Developer', 'Product Manager'],
    experienceLevel: ['junior', 'mid-level', 'senior'],
    atsScore: 88,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Minimal', 'Scandinavian', 'Clean'],
    colorSchemes: [
      {
        id: 'cool',
        name: 'Nordic Gray',
        primary: '#64748b',
        secondary: '#475569',
        accent: '#94a3b8',
        text: '#1e293b',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['minimal-design', 'clean-layout', 'modern-typography', 'visual-hierarchy'],
    industry: ['technology', 'creative', 'startup'],
    usageCount: 0,
    rating: 4.9,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23f8fafc" width="400" height="500"/%3E%3Ctext x="20" y="40" font-size="24" fill="%23111827" font-weight="300"%3EScandinavian%3C/text%3E%3Crect fill="%23e2e8f0" width="360" height="30" x="20" y="60" rx="2"/%3E%3Crect fill="%23e2e8f0" width="360" height="80" x="20" y="105" rx="2"/%3E%3Crect fill="%23e2e8f0" width="360" height="120" x="20" y="200" rx="2"/%3E%3C/svg%3E',
    atsOptimized: true
  },
  // Industry-Specific Templates
  {
    id: 'legal-professional',
    name: 'Legal Professional',
    description: 'Conservative design for lawyers with bar admission and case focus',
    category: 'industry-specific',
    format: 'reverse-chronological',
    designStyle: 'text-heavy',
    bestForRoles: ['Lawyer', 'Legal Counsel', 'Attorney', 'Paralegal'],
    experienceLevel: ['mid-level', 'senior', 'executive'],
    atsScore: 94,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Legal', 'Conservative', 'Professional'],
    colorSchemes: [
      {
        id: 'legal',
        name: 'Legal Burgundy',
        primary: '#881337',
        secondary: '#9f1239',
        accent: '#be123c',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['legal-format', 'bar-admissions', 'case-experience', 'conservative-style', 'ats-optimized'],
    industry: ['legal'],
    usageCount: 0,
    rating: 4.8,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23f9fafb" width="400" height="500"/%3E%3Crect fill="%231f2937" width="400" height="65"/%3E%3Ctext x="20" y="40" font-size="22" fill="white" font-weight="bold"%3ELegal Professional%3C/text%3E%3Crect fill="white" width="360" height="50" x="20" y="85" rx="2"/%3E%3Crect fill="white" width="360" height="100" x="20" y="150" rx="2"/%3E%3C/svg%3E',
    atsOptimized: true
  },
  {
    id: 'finance-banking',
    name: 'Finance & Banking',
    description: 'Trust-building conservative design for financial sector professionals',
    category: 'industry-specific',
    format: 'reverse-chronological',
    designStyle: 'single-column',
    bestForRoles: ['Financial Analyst', 'Investment Banker', 'Accountant', 'Finance Manager'],
    experienceLevel: ['junior', 'mid-level', 'senior'],
    atsScore: 97,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Finance', 'Banking', 'Conservative'],
    colorSchemes: [
      {
        id: 'finance',
        name: 'Finance Green',
        primary: '#065f46',
        secondary: '#047857',
        accent: '#059669',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['financial-metrics', 'conservative-design', 'ats-optimized', 'achievement-focus'],
    industry: ['finance', 'corporate'],
    usageCount: 0,
    rating: 4.9,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23eff6ff" width="400" height="500"/%3E%3Crect fill="%231e40af" width="400" height="70"/%3E%3Ctext x="20" y="42" font-size="23" fill="white" font-weight="bold"%3EFinance%26Banking%3C/text%3E%3Crect fill="white" width="360" height="55" x="20" y="90" rx="3"/%3E%3Crect fill="white" width="360" height="100" x="20" y="160" rx="3"/%3E%3C/svg%3E',
    atsOptimized: true
  },
  {
    id: 'engineering-blueprint',
    name: 'Engineering Blueprint',
    description: 'Technical, project-focused layout for engineering professionals',
    category: 'industry-specific',
    format: 'hybrid',
    designStyle: 'two-column',
    bestForRoles: ['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Project Engineer'],
    experienceLevel: ['junior', 'mid-level', 'senior'],
    atsScore: 92,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Engineering', 'Technical', 'Project-Focus'],
    colorSchemes: [
      {
        id: 'engineering',
        name: 'Blueprint Steel',
        primary: '#475569',
        secondary: '#334155',
        accent: '#64748b',
        text: '#0f172a',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['technical-focus', 'projects-showcase', 'certifications', 'ats-optimized'],
    industry: ['engineering', 'technology'],
    usageCount: 0,
    rating: 4.7,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23dbeafe" width="400" height="500"/%3E%3Crect fill="%230369a1" width="400" height="70"/%3E%3Ctext x="20" y="42" font-size="22" fill="white" font-weight="bold"%3EEngineering%3C/text%3E%3Crect fill="white" width="360" height="55" x="20" y="90" rx="3"/%3E%3Crect fill="white" width="360" height="105" x="20" y="160" rx="3"/%3E%3C/svg%3E',
    atsOptimized: true
  },
  {
    id: 'nonprofit-impact',
    name: 'Nonprofit Impact',
    description: 'Mission-driven design highlighting social impact and community work',
    category: 'industry-specific',
    format: 'hybrid',
    designStyle: 'sidebar-left',
    bestForRoles: ['Program Manager', 'Nonprofit Director', 'Social Worker', 'Community Organizer'],
    experienceLevel: ['mid-level', 'senior'],
    atsScore: 86,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Nonprofit', 'Impact', 'Mission-Driven'],
    colorSchemes: [
      {
        id: 'impact',
        name: 'Impact Teal',
        primary: '#0d9488',
        secondary: '#0f766e',
        accent: '#14b8a6',
        text: '#134e4a',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['achievement-focus', 'skill-highlights', 'social-media', 'references'],
    industry: ['nonprofit', 'education'],
    usageCount: 0,
    rating: 4.6,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23f0fdf4" width="400" height="500"/%3E%3Crect fill="%2316a34a" width="400" height="70"/%3E%3Ctext x="20" y="42" font-size="22" fill="white" font-weight="bold"%3ENonprofit Impact%3C/text%3E%3Crect fill="white" width="360" height="55" x="20" y="90" rx="4"/%3E%3Crect fill="white" width="360" height="100" x="20" y="160" rx="4"/%3E%3C/svg%3E',
    atsOptimized: true
  },
  {
    id: 'freelancer-portfolio',
    name: 'Freelancer Portfolio',
    description: 'Showcases client work with rate display and testimonials',
    category: 'creative-portfolio',
    format: 'creative',
    designStyle: 'visual-heavy',
    bestForRoles: ['Freelancer', 'Consultant', 'Independent Contractor'],
    experienceLevel: ['freelancer', 'mid-level', 'senior'],
    atsScore: 75,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Freelancer', 'Portfolio', 'Client-Work'],
    colorSchemes: [
      {
        id: 'freelance',
        name: 'Freelance Purple',
        primary: '#7c3aed',
        secondary: '#6d28d9',
        accent: '#8b5cf6',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['portfolio-showcase', 'client-testimonials', 'rate-display', 'social-media'],
    industry: ['creative', 'consulting', 'technology'],
    usageCount: 0,
    rating: 4.7,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23fef3c7" width="400" height="500"/%3E%3Crect fill="%23f59e0b" width="400" height="75"/%3E%3Ctext x="20" y="45" font-size="23" fill="white" font-weight="bold"%3EFreelancer%3C/text%3E%3Crect fill="white" width="170" height="90" x="20" y="95" rx="6"/%3E%3Crect fill="white" width="170" height="90" x="210" y="95" rx="6"/%3E%3C/svg%3E',
    atsOptimized: false
  },
  // Experience-Based Templates
  {
    id: 'senior-executive',
    name: 'Senior Executive',
    description: 'Board experience and leadership metrics focused for C-suite roles',
    category: 'executive-leadership',
    format: 'executive',
    designStyle: 'header-footer',
    bestForRoles: ['C-Suite', 'VP', 'SVP', 'Managing Director'],
    experienceLevel: ['executive'],
    atsScore: 89,
    isPremium: true,
    isNewTemplate: true,
    tags: ['Executive', 'C-Suite', 'Leadership'],
    colorSchemes: [
      {
        id: 'executive',
        name: 'Executive Charcoal',
        primary: '#18181b',
        secondary: '#27272a',
        accent: '#3f3f46',
        text: '#09090b',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['board-experience', 'leadership-metrics', 'executive-summary', 'sophisticated-design'],
    industry: ['corporate', 'finance', 'consulting'],
    usageCount: 0,
    rating: 4.9,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23f3f4f6" width="400" height="500"/%3E%3Crect fill="%23374151" width="130" height="500"/%3E%3Ctext x="145" y="45" font-size="24" fill="%23111827" font-weight="bold"%3ESenior Executive%3C/text%3E%3Crect fill="white" width="240" height="60" x="145" y="70" rx="3"/%3E%3Crect fill="white" width="240" height="100" x="145" y="145" rx="3"/%3E%3C/svg%3E',
    atsOptimized: true
  },
  {
    id: 'mid-career-professional',
    name: 'Mid-Career Professional',
    description: 'Balanced design showing experience and growth potential',
    category: 'experience-based',
    format: 'reverse-chronological',
    designStyle: 'two-column',
    bestForRoles: ['Manager', 'Senior Analyst', 'Team Lead'],
    experienceLevel: ['mid-level'],
    atsScore: 93,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Mid-Career', 'Balanced', 'Growth'],
    colorSchemes: [
      {
        id: 'balanced',
        name: 'Balanced Blue',
        primary: '#0284c7',
        secondary: '#0369a1',
        accent: '#0ea5e9',
        text: '#0c4a6e',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['achievement-focus', 'skill-highlights', 'ats-optimized', 'modern-design'],
    industry: ['technology', 'consulting', 'corporate', 'startup'],
    usageCount: 0,
    rating: 4.8,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23ffffff" width="400" height="500"/%3E%3Crect fill="%233b82f6" width="400" height="65"/%3E%3Ctext x="20" y="40" font-size="22" fill="white" font-weight="bold"%3EMid-Career Pro%3C/text%3E%3Crect fill="%23eff6ff" width="360" height="50" x="20" y="85" rx="3"/%3E%3Crect fill="%23eff6ff" width="360" height="100" x="20" y="150" rx="3"/%3E%3C/svg%3E',
    atsOptimized: true
  },
  {
    id: 'international-professional',
    name: 'International Professional',
    description: 'Multi-language support and global experience showcase',
    category: 'modern-stylish',
    format: 'hybrid',
    designStyle: 'two-column',
    bestForRoles: ['Global Manager', 'International Consultant', 'Expat Professional'],
    experienceLevel: ['mid-level', 'senior'],
    atsScore: 90,
    isPremium: false,
    isNewTemplate: true,
    tags: ['International', 'Global', 'Multi-Language'],
    colorSchemes: [
      {
        id: 'global',
        name: 'Global Navy',
        primary: '#1e40af',
        secondary: '#1e3a8a',
        accent: '#3b82f6',
        text: '#1e3a8a',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['language-proficiency', 'ats-optimized', 'skill-highlights', 'modern-design'],
    industry: ['consulting', 'corporate', 'technology'],
    usageCount: 0,
    rating: 4.8,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23fafaf9" width="400" height="500"/%3E%3Crect fill="%236366f1" width="400" height="70"/%3E%3Ctext x="20" y="42" font-size="21" fill="white" font-weight="bold"%3EInternational Pro%3C/text%3E%3Crect fill="white" width="360" height="55" x="20" y="90" rx="3"/%3E%3Crect fill="white" width="360" height="100" x="20" y="160" rx="3"/%3E%3C/svg%3E',
    atsOptimized: true
  },
  // Modern Styles
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Bold, innovative design for fast-paced startup environments',
    category: 'modern-stylish',
    format: 'one-page',
    designStyle: 'visual-heavy',
    bestForRoles: ['Startup Founder', 'Product Manager', 'Growth Hacker', 'Full Stack Developer'],
    experienceLevel: ['junior', 'mid-level', 'senior'],
    atsScore: 84,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Startup', 'Tech', 'Innovative'],
    colorSchemes: [
      {
        id: 'startup',
        name: 'Startup Violet',
        primary: '#7c3aed',
        secondary: '#6d28d9',
        accent: '#a78bfa',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['modern-design', 'visual-elements', 'github-integration', 'projects-showcase'],
    industry: ['startup', 'technology'],
    usageCount: 0,
    rating: 4.7,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23fef2f2" width="400" height="500"/%3E%3Crect fill="%23ef4444" width="400" height="75"/%3E%3Ctext x="20" y="45" font-size="24" fill="white" font-weight="bold"%3ETech Startup%3C/text%3E%3Crect fill="white" width="360" height="60" x="20" y="95" rx="5"/%3E%3Crect fill="white" width="360" height="95" x="20" y="170" rx="5"/%3E%3C/svg%3E',
    atsOptimized: false
  },
  {
    id: 'creative-agency',
    name: 'Creative Agency',
    description: 'Visual-heavy portfolio-integrated design for creative professionals',
    category: 'creative-portfolio',
    format: 'creative',
    designStyle: 'visual-heavy',
    bestForRoles: ['Art Director', 'Brand Designer', 'Creative Director', 'UX Designer'],
    experienceLevel: ['mid-level', 'senior'],
    atsScore: 72,
    isPremium: false,
    isNewTemplate: true,
    tags: ['Creative', 'Agency', 'Visual'],
    colorSchemes: [
      {
        id: 'agency',
        name: 'Agency Fuchsia',
        primary: '#c026d3',
        secondary: '#a21caf',
        accent: '#d946ef',
        text: '#1f2937',
        background: '#ffffff',
        isDefault: true
      }
    ],
    features: ['portfolio-showcase', 'creative-layout', 'color-accents', 'visual-elements'],
    industry: ['creative', 'marketing'],
    usageCount: 0,
    rating: 4.8,
    preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Cdefs%3E%3ClinearGradient id="g3" x1="0" y1="0" x2="1" y2="1"%3E%3Cstop offset="0%25" stop-color="%23f472b6"/%3E%3Cstop offset="100%25" stop-color="%23c026d3"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="%23fdf4ff" width="400" height="500"/%3E%3Crect fill="url(%23g3)" width="400" height="90"/%3E%3Ctext x="20" y="52" font-size="25" fill="white" font-weight="bold"%3ECreative Agency%3C/text%3E%3Crect fill="white" width="180" height="85" x="20" y="110" rx="7"/%3E%3Crect fill="white" width="180" height="85" x="210" y="110" rx="7"/%3E%3C/svg%3E',
    atsOptimized: false
  }
];

export const getTemplatesByCategory = (category: string): ResumeTemplate[] => {
  return resumeTemplates.filter(t => t.category === category as any);
};

export const getTemplateById = (id: string): ResumeTemplate | undefined => {
  return resumeTemplates.find(t => t.id === id);
};
