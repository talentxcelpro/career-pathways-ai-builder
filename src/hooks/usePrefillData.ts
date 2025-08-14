import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PrefillContext {
  id?: string;
  name?: string;
  role?: string;
  industry?: string;
  experience_years?: number;
  location?: string;
  email?: string;
  skills?: string[];
  interests?: string[];
}

export interface PrefillOptions {
  module: string;
  generateType?: 'comprehensive' | 'basic' | 'suggestions';
  contentType?: string;
  useCache?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

/**
 * Core prefill hook that provides intelligent content for any module
 */
export function usePrefillData(options: PrefillOptions) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, headline, location, primary_role, industry')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Get module defaults
  const { data: moduleDefaults } = useQuery({
    queryKey: ['module-defaults', options.module],
    queryFn: async () => {
      const { data } = await supabase
        .from('module_defaults')
        .select('*')
        .eq('module_name', options.module)
        .eq('is_active', true)
        .order('priority', { ascending: false });
      return data || [];
    },
  });

  // Get cached prefill data
  const { data: cachedPrefill, isLoading: isCacheLoading } = useQuery({
    queryKey: ['user-prefill-cache', user?.id, options.module],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_prefill_cache')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_name', options.module)
        .gte('expires_at', new Date().toISOString())
        .single();
      return data;
    },
    enabled: !!user?.id && options.useCache !== false,
  });

  // AI-powered prefill generation
  const generatePrefillMutation = useMutation({
    mutationFn: async (customContext?: Partial<PrefillContext>) => {
      const userContext: PrefillContext = {
        id: user?.id,
        name: userProfile?.full_name,
        email: userProfile?.email,
        role: userProfile?.primary_role || userProfile?.headline,
        location: userProfile?.location,
        industry: userProfile?.industry,
        experience_years: 2, // Could be calculated from profile data
        ...customContext,
      };

      const { data, error } = await supabase.functions.invoke('ai-prefill-generator', {
        body: {
          module: options.module,
          userContext,
          generateType: options.generateType || 'comprehensive',
          contentType: options.contentType,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({
        queryKey: ['user-prefill-cache', user?.id, options.module],
      });
    },
  });

  // Template-based prefill (instant, no AI)
  const getTemplatePrefill = () => {
    if (!moduleDefaults || !userProfile) return null;

    const templates = moduleDefaults.reduce((acc, def) => {
      acc[def.content_type] = def.template_data;
      return acc;
    }, {} as Record<string, any>);

    // Replace placeholders with user data
    const replacePlaceholders = (text: string): string => {
      return text
        .replace(/\{\{name\}\}/g, userProfile.full_name || 'Professional')
        .replace(/\{\{role\}\}/g, userProfile.primary_role || userProfile.headline || 'Professional')
        .replace(/\{\{industry\}\}/g, userProfile.industry || 'Technology')
        .replace(/\{\{location\}\}/g, userProfile.location || 'Location')
        .replace(/\{\{email\}\}/g, userProfile.email || 'email@example.com');
    };

    const processTemplate = (obj: any): any => {
      if (typeof obj === 'string') {
        return replacePlaceholders(obj);
      } else if (Array.isArray(obj)) {
        return obj.map(processTemplate);
      } else if (typeof obj === 'object' && obj !== null) {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = processTemplate(value);
        }
        return result;
      }
      return obj;
    };

    return processTemplate(templates);
  };

  // Get the best available prefill data
  const getPrefillData = () => {
    // Priority: cached AI data > template data > empty
    if (cachedPrefill?.prefill_data) {
      return cachedPrefill.prefill_data;
    }
    return getTemplatePrefill();
  };

  return {
    // Data
    prefillData: getPrefillData(),
    templateData: getTemplatePrefill(),
    cachedData: cachedPrefill?.prefill_data,
    moduleDefaults,

    // States
    isLoading: isCacheLoading,
    isGenerating: generatePrefillMutation.isPending,
    hasCache: !!cachedPrefill,
    
    // Actions
    generateAIPrefill: generatePrefillMutation.mutate,
    refreshCache: () => queryClient.invalidateQueries({
      queryKey: ['user-prefill-cache', user?.id, options.module],
    }),

    // Utilities
    replacePlaceholders: (text: string, customData?: Record<string, string>) => {
      const data = { ...userProfile, ...customData };
      return text
        .replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
    },
  };
}

/**
 * Bulk prefill hook for multiple modules
 */
export function useBulkPrefill() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bulkTemplates } = useQuery({
    queryKey: ['bulk-prefill-templates'],
    queryFn: async () => {
      const { data } = await supabase
        .from('bulk_prefill_templates')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const bulkPrefillMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const template = bulkTemplates?.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const modules = JSON.parse(template.modules as any) as string[];
      const results = await Promise.all(
        modules.map(async (module) => {
          const { data } = await supabase.functions.invoke('ai-prefill-generator', {
            body: {
              module,
              userContext: { id: user?.id },
              generateType: 'comprehensive',
            },
          });
          return { module, data };
        })
      );

      return results;
    },
    onSuccess: () => {
      // Invalidate all module caches
      queryClient.invalidateQueries({
        queryKey: ['user-prefill-cache'],
      });
    },
  });

  return {
    bulkTemplates,
    applyBulkTemplate: bulkPrefillMutation.mutate,
    isApplying: bulkPrefillMutation.isPending,
  };
}

/**
 * Smart prefill hook that auto-detects module from current route
 */
export function useSmartPrefill() {
  const currentPath = window.location.pathname;
  
  const getModuleFromPath = (): string => {
    if (currentPath.includes('/network')) return 'network';
    if (currentPath.includes('/jobs')) return 'jobs';
    if (currentPath.includes('/resume')) return 'resume';
    if (currentPath.includes('/learning')) return 'learning';
    if (currentPath.includes('/career-map')) return 'career_map';
    if (currentPath.includes('/employer')) return 'employer';
    if (currentPath.includes('/tools')) return 'tools';
    return 'general';
  };

  return usePrefillData({
    module: getModuleFromPath(),
    generateType: 'comprehensive',
    useCache: true,
  });
}