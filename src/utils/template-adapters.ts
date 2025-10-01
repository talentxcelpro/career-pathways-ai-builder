// ============================================
// TEMPLATE DATA ADAPTERS - CONVERSION UTILITIES
// ============================================
// These utilities convert between different template formats for backward compatibility

import { CoreTemplate, CoreTemplateCustomization, DEFAULT_COLOR_SCHEMES, DEFAULT_TYPOGRAPHY, DEFAULT_LAYOUTS } from '@/types/template-core';
import { ResumeTemplate } from '@/data/resumeTemplates';

// Legacy template format interfaces (for backward compatibility)
export interface LegacyTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
  features: string[];
  atsScore: number;
  isRecommended?: boolean;
  isPremium?: boolean;
  colorSchemes: {
    id: string;
    name: string;
    primary: string;
    accent: string;
  }[];
  layout: {
    columns: string;
    typography: string;
  };
}

export interface LegacyCustomization {
  colorScheme: string;
  fontFamily: string;
  fontSize: number;
  spacing: string;
  sectionOrder: string[];
  showPhoto: boolean;
  showBorder: boolean;
  accentColor: string;
}

// Convert legacy resume template to core template
export function legacyToCore(legacy: ResumeTemplate): CoreTemplate {
  return {
    metadata: {
      id: legacy.id,
      name: legacy.name,
      description: legacy.description,
      category: legacy.category.toLowerCase(),
      tags: legacy.features,
      atsScore: legacy.atsScore,
      isRecommended: legacy.isRecommended || false,
      isPremium: legacy.isPremium || false,
      author: 'TalentXcel',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      previewImage: legacy.preview,
      features: legacy.features,
      industries: [legacy.category.toLowerCase()],
      experienceLevels: determineExperienceLevels(legacy.category)
    },
    customization: {
      colorScheme: convertLegacyColorScheme(legacy.colorSchemes[0]),
      typography: DEFAULT_TYPOGRAPHY[0],
      layout: convertLegacyLayout(legacy.layout),
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
      sections: getDefaultSections(),
      customCss: ''
    },
    defaultSettings: {
      colorSchemeId: 'professional-blue',
      typographyId: 'modern-sans',
      layoutId: legacy.layout.columns === '1' ? 'single-column' : 'two-column'
    },
    renderComponent: mapTemplateToComponent(legacy.id)
  };
}

// Convert core template to legacy format
export function coreToLegacy(core: CoreTemplate): ResumeTemplate {
  return {
    id: core.metadata.id,
    name: core.metadata.name,
    category: core.metadata.category as any,
    description: core.metadata.description,
    preview: core.metadata.previewImage,
    features: core.metadata.features as any,
    atsScore: core.metadata.atsScore,
    isRecommended: core.metadata.isRecommended,
    isPremium: core.metadata.isPremium,
    colorSchemes: [
      {
        id: core.customization.colorScheme.id,
        name: core.customization.colorScheme.name,
        primary: hslToHex(core.customization.colorScheme.primary),
        secondary: hslToHex(core.customization.colorScheme.secondary || core.customization.colorScheme.primary),
        accent: hslToHex(core.customization.colorScheme.accent),
        text: hslToHex(core.customization.colorScheme.text || 'hsl(0, 0%, 0%)'),
        background: hslToHex(core.customization.colorScheme.background || 'hsl(0, 0%, 100%)'),
        isDefault: true
      }
    ],
    layout: {
      columns: core.customization.layout.columns,
      typography: capitalizeFirst(core.customization.typography.id.replace('-', ' '))
    },
    // Add required TemplateMetadata fields with defaults
    format: 'reverse-chronological' as any,
    designStyle: 'single-column' as any,
    bestForRoles: [],
    experienceLevel: [] as any,
    tags: [],
    industry: [] as any,
    usageCount: 0,
    rating: 0
  } as ResumeTemplate;
}

// Convert legacy customization to core customization
export function legacyCustomizationToCore(
  legacy: LegacyCustomization,
  baseTemplate: CoreTemplate
): CoreTemplateCustomization {
  // Find matching color scheme
  const colorScheme = DEFAULT_COLOR_SCHEMES.find(cs => cs.id === legacy.colorScheme) 
    || baseTemplate.customization.colorScheme;

  // Find matching typography
  const typography = DEFAULT_TYPOGRAPHY.find(t => t.body.includes(legacy.fontFamily))
    || baseTemplate.customization.typography;

  // Find matching layout based on spacing
  const layout = DEFAULT_LAYOUTS.find(l => l.spacing === legacy.spacing)
    || baseTemplate.customization.layout;

  return {
    colorScheme,
    typography,
    layout,
    style: baseTemplate.customization.style,
    sections: baseTemplate.customization.sections.map((section, index) => ({
      ...section,
      order: legacy.sectionOrder.indexOf(section.id) !== -1 
        ? legacy.sectionOrder.indexOf(section.id) + 1 
        : index + 1,
      enabled: legacy.sectionOrder.includes(section.id)
    })),
    customCss: legacy.showBorder ? '.resume-template { border: 1px solid hsl(var(--border)); }' : ''
  };
}

// Convert core customization to legacy format
export function coreCustomizationToLegacy(
  core: CoreTemplateCustomization
): LegacyCustomization {
  return {
    colorScheme: core.colorScheme.id,
    fontFamily: extractFontFamily(core.typography.body),
    fontSize: parseFloat(core.typography.sizes.base) * 16, // Convert rem to px
    spacing: core.layout.spacing,
    sectionOrder: core.sections
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order)
      .map(s => s.id),
    showPhoto: false, // Legacy field, not in core
    showBorder: core.customCss?.includes('border') || false,
    accentColor: hslToHex(core.colorScheme.primary)
  };
}

// Helper functions
function convertLegacyColorScheme(legacyScheme: any) {
  return {
    id: legacyScheme.id || 'converted',
    name: legacyScheme.name || 'Converted Scheme',
    primary: hexToHsl(legacyScheme.primary) || '217 91% 60%',
    secondary: '214 95% 93%',
    accent: hexToHsl(legacyScheme.accent) || '213 93% 68%',
    text: '222 84% 5%',
    background: '0 0% 100%',
    muted: '210 40% 50%'
  };
}

function convertLegacyLayout(legacyLayout: any) {
  const layoutId = legacyLayout.columns === '1' ? 'single-column' : 'two-column';
  return DEFAULT_LAYOUTS.find(l => l.id === layoutId) || DEFAULT_LAYOUTS[0];
}

function getDefaultSections() {
  return [
    { id: 'personalInfo', name: 'Personal Information', enabled: true, order: 1, required: true, customizable: false },
    { id: 'summary', name: 'Professional Summary', enabled: true, order: 2, required: false, customizable: true },
    { id: 'experience', name: 'Work Experience', enabled: true, order: 3, required: true, customizable: true },
    { id: 'education', name: 'Education', enabled: true, order: 4, required: false, customizable: true },
    { id: 'skills', name: 'Skills', enabled: true, order: 5, required: false, customizable: true },
    { id: 'projects', name: 'Projects', enabled: false, order: 6, required: false, customizable: true },
    { id: 'certifications', name: 'Certifications', enabled: false, order: 7, required: false, customizable: true }
  ];
}

function determineExperienceLevels(category: string): ('entry' | 'mid' | 'senior' | 'executive')[] {
  const categoryMap: Record<string, ('entry' | 'mid' | 'senior' | 'executive')[]> = {
    'Entry Level': ['entry'],
    'Mid Level': ['mid'],
    'Executive': ['executive'],
    'Traditional': ['mid', 'senior', 'executive'],
    'Modern': ['entry', 'mid', 'senior'],
    'Creative': ['entry', 'mid'],
    'Technical': ['entry', 'mid', 'senior'],
    'Business': ['mid', 'senior', 'executive']
  };
  
  return categoryMap[category] || ['entry', 'mid', 'senior'];
}

function mapTemplateToComponent(templateId: string): string {
  const componentMap: Record<string, string> = {
    'classic-professional': 'ClassicTemplate',
    'modern-tech': 'ModernTemplate',
    'startup-creative': 'CreativeTemplate',
    'data-science': 'TechnicalTemplate',
    'banking-finance': 'ClassicTemplate',
    'legal-professional': 'ClassicTemplate',
    'healthcare-medical': 'ClassicTemplate',
    'graphic-designer': 'CreativeTemplate',
    'marketing-creative': 'CreativeTemplate',
    'media-arts': 'CreativeTemplate',
    'engineering': 'TechnicalTemplate',
    'sales-executive': 'ModernTemplate',
    'hr-professional': 'ModernTemplate',
    'education-teacher': 'ClassicTemplate',
    'entry-level': 'ModernTemplate',
    'mid-career': 'ModernTemplate',
    'executive-leader': 'ExecutiveTemplate',
    'career-change': 'ModernTemplate',
    'freelancer-consultant': 'CreativeTemplate'
  };
  
  return componentMap[templateId] || 'ModernTemplate';
}

function hexToHsl(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '217 91% 60%';
  
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((val, index) => {
    const num = parseFloat(val.replace('%', ''));
    return index === 0 ? num : num / 100;
  });
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractFontFamily(fontFamily: string): string {
  return fontFamily.split(',')[0].replace(/["']/g, '').trim();
}

// Export validation helpers
export function validateTemplateConversion(
  original: ResumeTemplate, 
  converted: CoreTemplate
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (original.id !== converted.metadata.id) {
    issues.push('Template ID mismatch');
  }
  
  if (original.name !== converted.metadata.name) {
    issues.push('Template name mismatch');
  }
  
  if (original.atsScore !== converted.metadata.atsScore) {
    issues.push('ATS score mismatch');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

export function validateCustomizationConversion(
  original: LegacyCustomization,
  converted: CoreTemplateCustomization
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (original.colorScheme !== converted.colorScheme.id) {
    issues.push('Color scheme ID mismatch');
  }
  
  if (original.spacing !== converted.layout.spacing) {
    issues.push('Spacing mismatch');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}