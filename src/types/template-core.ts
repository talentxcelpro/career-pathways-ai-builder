// ============================================
// CANONICAL TEMPLATE SYSTEM - SINGLE SOURCE OF TRUTH
// ============================================
// This file defines the unified template structure used throughout the app

import { CoreResumeData } from './resume-core';

export interface CoreTemplateColorScheme {
  id: string;
  name: string;
  primary: string;    // HSL format
  secondary: string;  // HSL format
  accent: string;     // HSL format
  text: string;       // HSL format
  background: string; // HSL format
  muted: string;      // HSL format
}

export interface CoreTemplateTypography {
  id: string;
  name: string;
  header: string;     // Font family for headers
  body: string;       // Font family for body text
  mono: string;       // Font family for monospace text
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  weights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface CoreTemplateLayout {
  id: string;
  name: string;
  columns: '1' | '2' | '3';
  spacing: 'compact' | 'normal' | 'spacious';
  margins: {
    page: string;
    section: string;
    element: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export interface CoreTemplateStyle {
  borderRadius: string;
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  borders: {
    width: string;
    style: string;
  };
}

export interface CoreTemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  atsScore: number;
  isRecommended: boolean;
  isPremium: boolean;
  author: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  previewImage: string;
  features: string[];
  industries: string[];
  experienceLevels: ('entry' | 'mid' | 'senior' | 'executive')[];
}

export interface CoreTemplateSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  required: boolean;
  customizable: boolean;
  styles?: {
    header?: string;
    content?: string;
    spacing?: string;
  };
}

export interface CoreTemplateCustomization {
  colorScheme: CoreTemplateColorScheme;
  typography: CoreTemplateTypography;
  layout: CoreTemplateLayout;
  style: CoreTemplateStyle;
  sections: CoreTemplateSection[];
  customCss?: string;
}

// THE CANONICAL TEMPLATE STRUCTURE
export interface CoreTemplate {
  metadata: CoreTemplateMetadata;
  customization: CoreTemplateCustomization;
  defaultSettings: {
    colorSchemeId: string;
    typographyId: string;
    layoutId: string;
  };
  renderComponent: string; // Component name for rendering
}

export interface CoreTemplateRenderProps {
  template: CoreTemplate;
  resumeData: CoreResumeData;
  customization?: Partial<CoreTemplateCustomization>;
  className?: string;
  onSectionClick?: (sectionId: string) => void;
}

// Template Categories
export type TemplateCategory = 
  | 'traditional' 
  | 'modern' 
  | 'creative' 
  | 'technical' 
  | 'executive' 
  | 'academic' 
  | 'industry';

export type TemplateSubcategory = 
  | 'professional'
  | 'corporate' 
  | 'startup'
  | 'freelance'
  | 'consulting'
  | 'tech'
  | 'healthcare'
  | 'finance'
  | 'legal'
  | 'education'
  | 'marketing'
  | 'sales'
  | 'design'
  | 'engineering';

// Default Color Schemes
export const DEFAULT_COLOR_SCHEMES: CoreTemplateColorScheme[] = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    primary: '217 91% 60%',    // #3b82f6
    secondary: '214 95% 93%',  // #eff6ff
    accent: '213 93% 68%',     // #60a5fa
    text: '222 84% 5%',        // #0f172a
    background: '0 0% 100%',   // #ffffff
    muted: '210 40% 50%'       // #64748b
  },
  {
    id: 'modern-gray',
    name: 'Modern Gray',
    primary: '220 13% 18%',    // #374151
    secondary: '220 13% 95%',  // #f9fafb
    accent: '217 33% 17%',     // #1f2937
    text: '222 84% 5%',        // #0f172a
    background: '0 0% 100%',   // #ffffff
    muted: '215 16% 47%'       // #6b7280
  },
  {
    id: 'creative-purple',
    name: 'Creative Purple',
    primary: '262 83% 58%',    // #8b5cf6
    secondary: '263 69% 96%',  // #faf5ff
    accent: '258 90% 66%',     // #a78bfa
    text: '222 84% 5%',        // #0f172a
    background: '0 0% 100%',   // #ffffff
    muted: '264 16% 58%'       // #9ca3af
  },
  {
    id: 'elegant-green',
    name: 'Elegant Green',
    primary: '158 64% 52%',    // #10b981
    secondary: '154 44% 96%',  // #f0fdf4
    accent: '160 84% 39%',     // #047857
    text: '222 84% 5%',        // #0f172a
    background: '0 0% 100%',   // #ffffff
    muted: '158 25% 48%'       // #6b7280
  }
];

// Default Typography
export const DEFAULT_TYPOGRAPHY: CoreTemplateTypography[] = [
  {
    id: 'modern-sans',
    name: 'Modern Sans',
    header: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  {
    id: 'classic-serif',
    name: 'Classic Serif',
    header: 'Georgia, Times, serif',
    body: 'Georgia, Times, serif',
    mono: 'Monaco, Consolas, monospace',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  {
    id: 'professional-mixed',
    name: 'Professional Mixed',
    header: 'Roboto, system-ui, sans-serif',
    body: 'Source Sans Pro, system-ui, sans-serif',
    mono: 'Source Code Pro, monospace',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  }
];

// Default Layouts
export const DEFAULT_LAYOUTS: CoreTemplateLayout[] = [
  {
    id: 'single-column',
    name: 'Single Column',
    columns: '1',
    spacing: 'normal',
    margins: {
      page: '2rem',
      section: '1.5rem',
      element: '0.75rem'
    },
    breakpoints: {
      mobile: '640px',
      tablet: '768px',
      desktop: '1024px'
    }
  },
  {
    id: 'two-column',
    name: 'Two Column',
    columns: '2',
    spacing: 'normal',
    margins: {
      page: '2rem',
      section: '1.5rem',
      element: '0.75rem'
    },
    breakpoints: {
      mobile: '640px',
      tablet: '768px',
      desktop: '1024px'
    }
  },
  {
    id: 'compact-layout',
    name: 'Compact Layout',
    columns: '1',
    spacing: 'compact',
    margins: {
      page: '1.5rem',
      section: '1rem',
      element: '0.5rem'
    },
    breakpoints: {
      mobile: '640px',
      tablet: '768px',
      desktop: '1024px'
    }
  }
];

// Utility functions
export function createDefaultTemplate(id: string): CoreTemplate {
  return {
    metadata: {
      id,
      name: 'Untitled Template',
      description: '',
      category: 'modern',
      tags: [],
      atsScore: 85,
      isRecommended: false,
      isPremium: false,
      author: 'TalentXcel',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      previewImage: '',
      features: [],
      industries: [],
      experienceLevels: ['entry', 'mid', 'senior']
    },
    customization: {
      colorScheme: DEFAULT_COLOR_SCHEMES[0],
      typography: DEFAULT_TYPOGRAPHY[0],
      layout: DEFAULT_LAYOUTS[0],
      style: {
        borderRadius: '0.375rem',
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
        },
        borders: {
          width: '1px',
          style: 'solid'
        }
      },
      sections: [],
      customCss: ''
    },
    defaultSettings: {
      colorSchemeId: DEFAULT_COLOR_SCHEMES[0].id,
      typographyId: DEFAULT_TYPOGRAPHY[0].id,
      layoutId: DEFAULT_LAYOUTS[0].id
    },
    renderComponent: 'ModernTemplate'
  };
}

export function validateTemplate(template: Partial<CoreTemplate>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!template.metadata?.id) {
    errors.push('Template ID is required');
  }
  
  if (!template.metadata?.name) {
    errors.push('Template name is required');
  }
  
  if (!template.renderComponent) {
    errors.push('Render component is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function mergeTemplateCustomization(
  base: CoreTemplateCustomization,
  override: Partial<CoreTemplateCustomization>
): CoreTemplateCustomization {
  return {
    ...base,
    ...override,
    colorScheme: override.colorScheme || base.colorScheme,
    typography: override.typography || base.typography,
    layout: override.layout || base.layout,
    style: { ...base.style, ...override.style },
    sections: override.sections || base.sections
  };
}