// ============================================
// TEMPLATE ENGINE REACT HOOK
// ============================================
// React hook for managing template operations and state

import { useState, useCallback, useMemo } from 'react';
import { templateEngine } from '@/services/template-engine';
import { CoreTemplate, CoreTemplateCustomization } from '@/types/template-core';
import { coreToLegacy, legacyToCore } from '@/utils/template-adapters';

export function useTemplateEngine() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customization, setCustomization] = useState<Partial<CoreTemplateCustomization>>({});

  // Get current template
  const selectedTemplate = useMemo(() => {
    return selectedTemplateId ? templateEngine.getTemplate(selectedTemplateId) : undefined;
  }, [selectedTemplateId]);

  // Get all templates
  const allTemplates = useMemo(() => {
    return templateEngine.getAllTemplates();
  }, []);

  // Get templates by category
  const getTemplatesByCategory = useCallback((category: string) => {
    return templateEngine.getTemplatesByCategory(category);
  }, []);

  // Get recommended templates
  const recommendedTemplates = useMemo(() => {
    return templateEngine.getRecommendedTemplates();
  }, []);

  // Get premium templates
  const premiumTemplates = useMemo(() => {
    return templateEngine.getPremiumTemplates();
  }, []);

  // Search templates
  const searchTemplates = useCallback((query: string) => {
    return templateEngine.searchTemplates(query);
  }, []);

  // Filter templates
  const filterTemplates = useCallback((filters: {
    category?: string;
    industry?: string;
    experienceLevel?: string;
    isPremium?: boolean;
    isRecommended?: boolean;
    atsScoreMin?: number;
  }) => {
    return templateEngine.filterTemplates(filters);
  }, []);

  // Get user recommendations
  const getRecommendations = useCallback((userProfile: {
    industry?: string;
    experienceLevel?: string;
    targetRole?: string;
    preferences?: {
      colorScheme?: string;
      layout?: string;
      style?: string;
    };
  }) => {
    return templateEngine.getRecommendationsForUser(userProfile);
  }, []);

  // Template operations
  const selectTemplate = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    setCustomization({}); // Reset customization when template changes
  }, []);

  const updateCustomization = useCallback((updates: Partial<CoreTemplateCustomization>) => {
    setCustomization(prev => ({ ...prev, ...updates }));
  }, []);

  const applyCustomization = useCallback((templateId: string, customizationUpdates: Partial<CoreTemplateCustomization>) => {
    return templateEngine.applyCustomization(templateId, customizationUpdates);
  }, []);

  // Generate template CSS
  const generateCSS = useCallback((template: CoreTemplate) => {
    return templateEngine.generateTemplateCSS(template);
  }, []);

  // Get template stats
  const templateStats = useMemo(() => {
    return templateEngine.getTemplateStats();
  }, []);

  // Get available customization options
  const availableColorSchemes = useMemo(() => {
    return templateEngine.getAvailableColorSchemes();
  }, []);

  const availableTypography = useMemo(() => {
    return templateEngine.getAvailableTypography();
  }, []);

  const availableLayouts = useMemo(() => {
    return templateEngine.getAvailableLayouts();
  }, []);

  // Legacy compatibility helpers
  const getLegacyTemplates = useMemo(() => {
    return allTemplates.map(coreToLegacy);
  }, [allTemplates]);

  const convertToLegacy = useCallback((template: CoreTemplate) => {
    return coreToLegacy(template);
  }, []);

  const convertFromLegacy = useCallback((legacyTemplate: any) => {
    return legacyToCore(legacyTemplate);
  }, []);

  return {
    // State
    selectedTemplateId,
    selectedTemplate,
    customization,
    
    // Template collections
    allTemplates,
    recommendedTemplates,
    premiumTemplates,
    templateStats,
    
    // Template operations
    selectTemplate,
    getTemplatesByCategory,
    searchTemplates,
    filterTemplates,
    getRecommendations,
    
    // Customization
    updateCustomization,
    applyCustomization,
    generateCSS,
    availableColorSchemes,
    availableTypography,
    availableLayouts,
    
    // Legacy compatibility
    getLegacyTemplates,
    convertToLegacy,
    convertFromLegacy,
    
    // Engine instance (for advanced usage)
    engine: templateEngine
  };
}