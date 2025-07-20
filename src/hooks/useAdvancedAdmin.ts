import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// SEO Metadata Management
export const useSEOMetadata = () => {
  return useQuery({
    queryKey: ['seo-metadata'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_metadata')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateSEOMetadata = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metadata: any) => {
      const { data, error } = await supabase
        .from('seo_metadata')
        .insert(metadata)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-metadata'] });
      toast.success('SEO metadata created successfully');
    },
    onError: () => {
      toast.error('Failed to create SEO metadata');
    },
  });
};

// Ad Campaigns Management
export const useAdCampaigns = () => {
  return useQuery({
    queryKey: ['ad-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateAdCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaign: any) => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .insert(campaign)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-campaigns'] });
      toast.success('Ad campaign created successfully');
    },
    onError: () => {
      toast.error('Failed to create ad campaign');
    },
  });
};

// A/B Testing Management
export const useABTests = () => {
  return useQuery({
    queryKey: ['ab-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateABTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (test: any) => {
      const { data, error } = await supabase
        .from('ab_tests')
        .insert(test)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast.success('A/B test created successfully');
    },
    onError: () => {
      toast.error('Failed to create A/B test');
    },
  });
};

// Feature Flags Management
export const useFeatureFlags = () => {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('flag_name');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useToggleFeatureFlag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { data, error } = await supabase
        .from('feature_flags')
        .update({ is_enabled })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag updated successfully');
    },
    onError: () => {
      toast.error('Failed to update feature flag');
    },
  });
};

// Content Hub Management
export const useContentHub = () => {
  return useQuery({
    queryKey: ['content-hub'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_hub')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (content: any) => {
      const { data, error } = await supabase
        .from('content_hub')
        .insert(content)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-hub'] });
      toast.success('Content created successfully');
    },
    onError: () => {
      toast.error('Failed to create content');
    },
  });
};

// Page Builder Management
export const usePageBuilderPages = () => {
  return useQuery({
    queryKey: ['page-builder-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_builder_pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (page: any) => {
      const { data, error } = await supabase
        .from('page_builder_pages')
        .insert(page)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-builder-pages'] });
      toast.success('Page created successfully');
    },
    onError: () => {
      toast.error('Failed to create page');
    },
  });
};

// Performance Analytics
export const usePerformanceAnalytics = (dateRange?: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['performance-analytics', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('performance_analytics')
        .select('*');
      
      if (dateRange) {
        query = query
          .gte('recorded_at', dateRange.from.toISOString())
          .lte('recorded_at', dateRange.to.toISOString());
      }
      
      const { data, error } = await query
        .order('recorded_at', { ascending: false })
        .limit(1000);
      
      if (error) throw error;
      return data;
    },
  });
};

// AI Prompt Library
export const useAIPromptLibrary = () => {
  return useQuery({
    queryKey: ['ai-prompt-library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_prompt_library')
        .select('*')
        .eq('is_active', true)
        .order('prompt_category', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateAIPrompt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prompt: any) => {
      const { data, error } = await supabase
        .from('ai_prompt_library')
        .insert(prompt)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompt-library'] });
      toast.success('AI prompt created successfully');
    },
    onError: () => {
      toast.error('Failed to create AI prompt');
    },
  });
};

// Site Redirects
export const useSiteRedirects = () => {
  return useQuery({
    queryKey: ['site-redirects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_redirects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateRedirect = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (redirect: any) => {
      const { data, error } = await supabase
        .from('site_redirects')
        .insert(redirect)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-redirects'] });
      toast.success('Redirect created successfully');
    },
    onError: () => {
      toast.error('Failed to create redirect');
    },
  });
};

// Integration Configs
export const useIntegrationConfigs = () => {
  return useQuery({
    queryKey: ['integration-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .order('integration_name');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('integration_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] });
      toast.success('Integration updated successfully');
    },
    onError: () => {
      toast.error('Failed to update integration');
    },
  });
};