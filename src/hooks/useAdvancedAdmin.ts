import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSEOMetadata = () => {
  return useQuery({
    queryKey: ['seo-metadata'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_metadata')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateSEOMetadata = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metadata: any) => {
      const { data, error } = await supabase
        .from('seo_metadata')
        .insert([{ ...metadata, created_by: (await supabase.auth.getUser()).data.user?.id }])
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

export const useAdCampaigns = () => {
  return useQuery({
    queryKey: ['ad-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateAdCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaign: any) => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .insert([{ ...campaign, created_by: (await supabase.auth.getUser()).data.user?.id }])
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

export const useFeatureFlags = () => {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
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

export const useContentHub = () => {
  return useQuery({
    queryKey: ['content-hub'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_hub')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (content: any) => {
      const { data, error } = await supabase
        .from('content_hub')
        .insert([{ ...content, author_id: (await supabase.auth.getUser()).data.user?.id }])
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

export const usePageBuilderPages = () => {
  return useQuery({
    queryKey: ['page-builder-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_builder_pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (page: any) => {
      const { data, error } = await supabase
        .from('page_builder_pages')
        .insert([{ ...page, created_by: (await supabase.auth.getUser()).data.user?.id }])
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

export const useAIPromptLibrary = () => {
  return useQuery({
    queryKey: ['ai-prompt-library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_prompt_library')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateAIPrompt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prompt: any) => {
      const { data, error } = await supabase
        .from('ai_prompt_library')
        .insert([{ ...prompt, created_by: (await supabase.auth.getUser()).data.user?.id }])
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