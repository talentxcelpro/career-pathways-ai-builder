// ============================================
// UNIFIED TEMPLATE ENGINE - RENDERING & MANAGEMENT
// ============================================
// This service handles all template operations and rendering

import React from 'react';
import { CoreTemplate, CoreTemplateCustomization, CoreTemplateRenderProps, DEFAULT_COLOR_SCHEMES, DEFAULT_TYPOGRAPHY, DEFAULT_LAYOUTS, createDefaultTemplate } from '@/types/template-core';
import { CoreResumeData } from '@/types/resume-core';
import { resumeTemplates } from '@/data/resumeTemplates';

export class TemplateEngine {
  private templates: Map<string, CoreTemplate> = new Map();
  private renderComponents: Map<string, React.ComponentType<any>> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Convert legacy resumeTemplates to new CoreTemplate format
    resumeTemplates.forEach(legacyTemplate => {
      const coreTemplate: CoreTemplate = {
        metadata: {
          id: legacyTemplate.id,
          name: legacyTemplate.name,
          description: legacyTemplate.description,
          category: legacyTemplate.category.toLowerCase(),
          tags: legacyTemplate.features,
          atsScore: legacyTemplate.atsScore,
          isRecommended: legacyTemplate.isRecommended || false,
          isPremium: legacyTemplate.isPremium || false,
          author: 'TalentXcel',
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          previewImage: legacyTemplate.preview,
          features: legacyTemplate.features,
          industries: [legacyTemplate.category],
          experienceLevels: ['entry', 'mid', 'senior', 'executive']
        },
        customization: {
          colorScheme: this.convertLegacyColorScheme(legacyTemplate.colorSchemes[0]),
          typography: DEFAULT_TYPOGRAPHY[0],
          layout: this.convertLegacyLayout(legacyTemplate.layout),
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
          sections: this.getDefaultSections(),
          customCss: ''
        },
        defaultSettings: {
          colorSchemeId: 'professional-blue',
          typographyId: 'modern-sans',
          layoutId: legacyTemplate.layout.columns === '1' ? 'single-column' : 'two-column'
        },
        renderComponent: this.mapTemplateToComponent(legacyTemplate.id)
      };
      
      this.templates.set(legacyTemplate.id, coreTemplate);
    });
  }

  private convertLegacyColorScheme(legacyScheme: any) {
    // Convert hex colors to HSL
    return {
      id: legacyScheme.id || 'converted',
      name: legacyScheme.name || 'Converted Scheme',
      primary: this.hexToHsl(legacyScheme.primary) || '217 91% 60%',
      secondary: '214 95% 93%',
      accent: this.hexToHsl(legacyScheme.accent) || '213 93% 68%',
      text: '222 84% 5%',
      background: '0 0% 100%',
      muted: '210 40% 50%'
    };
  }

  private convertLegacyLayout(legacyLayout: any) {
    const layoutId = legacyLayout.columns === '1' ? 'single-column' : 'two-column';
    return DEFAULT_LAYOUTS.find(l => l.id === layoutId) || DEFAULT_LAYOUTS[0];
  }

  private getDefaultSections() {
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

  private mapTemplateToComponent(templateId: string): string {
    const componentMap: Record<string, string> = {
      'classic-professional': 'ClassicTemplate',
      'modern-tech': 'ModernTemplate',
      'startup-creative': 'CreativeTemplate',
      'data-science': 'TechnicalTemplate',
      'banking-finance': 'ClassicTemplate',
      'graphic-designer': 'CreativeTemplate',
      'engineering': 'TechnicalTemplate',
      'executive-leader': 'ExecutiveTemplate',
      'entry-level': 'ModernTemplate'
    };
    
    return componentMap[templateId] || 'ModernTemplate';
  }

  private hexToHsl(hex: string): string {
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

  // Public API Methods
  getTemplate(id: string): CoreTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): CoreTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): CoreTemplate[] {
    return this.getAllTemplates().filter(t => t.metadata.category === category.toLowerCase());
  }

  getRecommendedTemplates(): CoreTemplate[] {
    return this.getAllTemplates().filter(t => t.metadata.isRecommended);
  }

  getPremiumTemplates(): CoreTemplate[] {
    return this.getAllTemplates().filter(t => t.metadata.isPremium);
  }

  getTemplatesByIndustry(industry: string): CoreTemplate[] {
    return this.getAllTemplates().filter(t => 
      t.metadata.industries.includes(industry.toLowerCase())
    );
  }

  getTemplatesByExperienceLevel(level: 'entry' | 'mid' | 'senior' | 'executive'): CoreTemplate[] {
    return this.getAllTemplates().filter(t => 
      t.metadata.experienceLevels.includes(level)
    );
  }

  createTemplate(template: Partial<CoreTemplate>): CoreTemplate {
    const newTemplate = createDefaultTemplate(template.metadata?.id || Date.now().toString());
    
    if (template.metadata) {
      Object.assign(newTemplate.metadata, template.metadata);
    }
    
    if (template.customization) {
      Object.assign(newTemplate.customization, template.customization);
    }
    
    this.templates.set(newTemplate.metadata.id, newTemplate);
    return newTemplate;
  }

  updateTemplate(id: string, updates: Partial<CoreTemplate>): CoreTemplate | undefined {
    const existing = this.templates.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...updates,
      metadata: { ...existing.metadata, ...updates.metadata, updatedAt: new Date().toISOString() }
    };
    
    this.templates.set(id, updated);
    return updated;
  }

  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  // Customization Methods
  getAvailableColorSchemes(): CoreTemplate['customization']['colorScheme'][] {
    return DEFAULT_COLOR_SCHEMES;
  }

  getAvailableTypography(): CoreTemplate['customization']['typography'][] {
    return DEFAULT_TYPOGRAPHY;
  }

  getAvailableLayouts(): CoreTemplate['customization']['layout'][] {
    return DEFAULT_LAYOUTS;
  }

  applyCustomization(
    templateId: string, 
    customization: Partial<CoreTemplateCustomization>
  ): CoreTemplate | undefined {
    const template = this.getTemplate(templateId);
    if (!template) return undefined;
    
    const updatedTemplate = {
      ...template,
      customization: {
        ...template.customization,
        ...customization
      }
    };
    
    this.templates.set(templateId, updatedTemplate);
    return updatedTemplate;
  }

  // Rendering Methods
  generateTemplateCSS(template: CoreTemplate): string {
    const { colorScheme, typography, layout, style } = template.customization;
    
    return `
      .resume-template {
        font-family: ${typography.body};
        color: hsl(${colorScheme.text});
        background: hsl(${colorScheme.background});
        margin: ${layout.margins.page};
      }
      
      .resume-template h1, .resume-template h2, .resume-template h3, .resume-template h4 {
        font-family: ${typography.header};
        color: hsl(${colorScheme.primary});
      }
      
      .resume-template .section {
        margin-bottom: ${layout.margins.section};
      }
      
      .resume-template .element {
        margin-bottom: ${layout.margins.element};
      }
      
      .resume-template .primary-accent {
        color: hsl(${colorScheme.primary});
      }
      
      .resume-template .secondary-accent {
        color: hsl(${colorScheme.accent});
      }
      
      .resume-template .border-primary {
        border-color: hsl(${colorScheme.primary});
      }
      
      .resume-template .bg-primary {
        background-color: hsl(${colorScheme.primary});
      }
      
      .resume-template .bg-secondary {
        background-color: hsl(${colorScheme.secondary});
      }
      
      ${template.customization.customCss || ''}
    `;
  }

  renderTemplate(props: CoreTemplateRenderProps): React.ReactElement | null {
    const component = this.renderComponents.get(props.template.renderComponent);
    if (!component) {
      console.warn(`Template component ${props.template.renderComponent} not found`);
      return null;
    }
    
    return React.createElement(component, props);
  }

  registerTemplateComponent(name: string, component: React.ComponentType<any>) {
    this.renderComponents.set(name, component);
  }

  // Search and Filter Methods
  searchTemplates(query: string): CoreTemplate[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTemplates().filter(template => 
      template.metadata.name.toLowerCase().includes(lowerQuery) ||
      template.metadata.description.toLowerCase().includes(lowerQuery) ||
      template.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      template.metadata.category.toLowerCase().includes(lowerQuery)
    );
  }

  filterTemplates(filters: {
    category?: string;
    industry?: string;
    experienceLevel?: string;
    isPremium?: boolean;
    isRecommended?: boolean;
    atsScoreMin?: number;
  }): CoreTemplate[] {
    return this.getAllTemplates().filter(template => {
      if (filters.category && template.metadata.category !== filters.category.toLowerCase()) {
        return false;
      }
      
      if (filters.industry && !template.metadata.industries.includes(filters.industry.toLowerCase())) {
        return false;
      }
      
      if (filters.experienceLevel && !template.metadata.experienceLevels.includes(filters.experienceLevel as any)) {
        return false;
      }
      
      if (filters.isPremium !== undefined && template.metadata.isPremium !== filters.isPremium) {
        return false;
      }
      
      if (filters.isRecommended !== undefined && template.metadata.isRecommended !== filters.isRecommended) {
        return false;
      }
      
      if (filters.atsScoreMin && template.metadata.atsScore < filters.atsScoreMin) {
        return false;
      }
      
      return true;
    });
  }

  // Analytics and Recommendations
  getTemplateStats(): {
    total: number;
    byCategory: Record<string, number>;
    premium: number;
    recommended: number;
    averageAtsScore: number;
  } {
    const templates = this.getAllTemplates();
    const byCategory: Record<string, number> = {};
    let totalAtsScore = 0;
    
    templates.forEach(template => {
      byCategory[template.metadata.category] = (byCategory[template.metadata.category] || 0) + 1;
      totalAtsScore += template.metadata.atsScore;
    });
    
    return {
      total: templates.length,
      byCategory,
      premium: templates.filter(t => t.metadata.isPremium).length,
      recommended: templates.filter(t => t.metadata.isRecommended).length,
      averageAtsScore: templates.length > 0 ? totalAtsScore / templates.length : 0
    };
  }

  getRecommendationsForUser(userProfile: {
    industry?: string;
    experienceLevel?: string;
    targetRole?: string;
    preferences?: {
      colorScheme?: string;
      layout?: string;
      style?: string;
    };
  }): CoreTemplate[] {
    let candidates = this.getAllTemplates();
    
    // Filter by industry
    if (userProfile.industry) {
      candidates = candidates.filter(t => 
        t.metadata.industries.includes(userProfile.industry!.toLowerCase())
      );
    }
    
    // Filter by experience level
    if (userProfile.experienceLevel) {
      candidates = candidates.filter(t => 
        t.metadata.experienceLevels.includes(userProfile.experienceLevel as any)
      );
    }
    
    // Prioritize recommended templates
    candidates.sort((a, b) => {
      if (a.metadata.isRecommended && !b.metadata.isRecommended) return -1;
      if (!a.metadata.isRecommended && b.metadata.isRecommended) return 1;
      return b.metadata.atsScore - a.metadata.atsScore;
    });
    
    return candidates.slice(0, 6); // Return top 6 recommendations
  }
}

// Export singleton instance
export const templateEngine = new TemplateEngine();