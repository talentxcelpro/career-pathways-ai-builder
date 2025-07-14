export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  format: ResumeFormat;
  designStyle: DesignStyle;
  bestForRoles: string[];
  experienceLevel: ExperienceLevel[];
  atsScore: number;
  isPremium: boolean;
  isNewTemplate: boolean;
  tags: string[];
  colorSchemes: ColorScheme[];
  features: TemplateFeature[];
  industry: Industry[];
  usageCount: number;
  rating: number;
  previewImage?: string;
  thumbnailImage?: string;
}

export type TemplateCategory = 
  | 'classic-ats'
  | 'modern-stylish'
  | 'industry-specific'
  | 'experience-based'
  | 'creative-portfolio'
  | 'academic-research'
  | 'executive-leadership';

export type ResumeFormat = 
  | 'reverse-chronological'
  | 'functional'
  | 'hybrid'
  | 'executive'
  | 'one-page'
  | 'creative'
  | 'academic';

export type DesignStyle = 
  | 'single-column'
  | 'two-column'
  | 'three-column'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'header-footer'
  | 'minimal'
  | 'visual-heavy'
  | 'text-heavy';

export type ExperienceLevel = 
  | 'entry-level'
  | 'junior'
  | 'mid-level'
  | 'senior'
  | 'executive'
  | 'career-switcher'
  | 'freelancer';

export type Industry = 
  | 'technology'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'creative'
  | 'consulting'
  | 'sales'
  | 'marketing'
  | 'legal'
  | 'engineering'
  | 'research'
  | 'startup'
  | 'corporate'
  | 'nonprofit';

export type TemplateFeature = 
  | 'qr-code'
  | 'photo-header'
  | 'skill-bars'
  | 'infographics'
  | 'color-accents'
  | 'icons'
  | 'charts'
  | 'portfolio-links'
  | 'social-media'
  | 'references'
  | 'publications'
  | 'certifications'
  | 'projects-showcase'
  | 'language-proficiency'
  | 'ats-optimized'
  | 'single-column'
  | 'two-column'
  | 'chronological'
  | 'skill-focus'
  | 'minimal-design'
  | 'executive-summary'
  | 'achievement-focus'
  | 'corporate-style'
  | 'technical-focus'
  | 'traditional-layout'
  | 'section-headers'
  | 'conservative-style'
  | 'keyword-placement'
  | 'universal-format'
  | 'modern-design'
  | 'sidebar-layout'
  | 'bold-headers'
  | 'visual-elements'
  | 'colored-headers'
  | 'clean-design'
  | 'boxed-sections'
  | 'skill-highlights'
  | 'gradient-accents'
  | 'modern-typography'
  | 'clean-layout'
  | 'visual-hierarchy'
  | 'sophisticated-design'
  | 'technical-skills'
  | 'github-integration'
  | 'clinical-experience'
  | 'medical-format'
  | 'financial-metrics'
  | 'conservative-design'
  | 'portfolio-showcase'
  | 'creative-layout'
  | 'research-focus'
  | 'academic-format'
  | 'legal-format'
  | 'bar-admissions'
  | 'case-experience'
  | 'education-focus'
  | 'internship-highlight'
  | 'potential-based'
  | 'transferable-skills'
  | 'career-narrative'
  | 'skill-translation'
  | 'board-experience'
  | 'leadership-metrics'
  | 'client-testimonials'
  | 'rate-display';

export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  isDefault: boolean;
}

export interface TemplateCustomization {
  colorScheme: ColorScheme;
  fontFamily: string;
  fontSize: number;
  spacing: 'compact' | 'normal' | 'spacious';
  sections: SectionCustomization[];
  layout: LayoutCustomization;
}

export interface SectionCustomization {
  id: string;
  name: string;
  isVisible: boolean;
  order: number;
  style: 'default' | 'minimal' | 'detailed' | 'compact';
}

export interface LayoutCustomization {
  headerStyle: 'centered' | 'left-aligned' | 'split';
  sectionSpacing: 'tight' | 'normal' | 'loose';
  borderStyle: 'none' | 'subtle' | 'prominent';
  iconStyle: 'none' | 'minimal' | 'colorful';
}

export interface TemplateRecommendation {
  template: TemplateMetadata;
  score: number;
  reasons: string[];
  category: 'perfect-match' | 'good-fit' | 'alternative';
}

export interface RecommendationRequest {
  jobTitle?: string;
  industry?: Industry;
  experienceLevel?: ExperienceLevel;
  careerGoals?: string[];
  designPreference?: 'conservative' | 'modern' | 'creative';
  atsRequirement?: 'critical' | 'important' | 'flexible';
  customization?: 'minimal' | 'moderate' | 'extensive';
}

export interface TemplateAnalytics {
  templateId: string;
  usageCount: number;
  completionRate: number;
  downloadCount: number;
  userRating: number;
  atsSuccessRate?: number;
  industryAdoption: Record<Industry, number>;
  experienceLevelUsage: Record<ExperienceLevel, number>;
  conversionMetrics: {
    viewToDownload: number;
    downloadToShare: number;
    shareToHire: number;
  };
}