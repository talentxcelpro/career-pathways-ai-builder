import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BotContentTemplate {
  id: string;
  bot_id: string;
  template_name: string;
  prompt_template: string;
  category: string;
  content_type: string;
  seo_keywords: string[];
  system_message?: string;
  variables?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentGenerationSchedule {
  id: string;
  schedule_name: string;
  cron_expression: string;
  is_active: boolean;
  daily_quota: number;
  current_day_count: number;
  last_run_at?: string;
  next_run_at?: string;
  generation_config: any;
  created_at: string;
  updated_at: string;
}

// Fetch all bot content templates using ai_content_library
export const useBotContentTemplates = (botId?: string) => {
  return useQuery({
    queryKey: ['bot-content-templates', botId],
    queryFn: async () => {
      let query = supabase
        .from('ai_content_library')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (botId) {
        // Filter by creator for now, we'll improve this later
        query = query.eq('created_by', botId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bot content templates:', error);
        throw error;
      }

      // Transform to our interface
      return (data || []).map(item => ({
        id: item.id,
        bot_id: item.created_by || '',
        template_name: item.title,
        prompt_template: item.content,
        category: item.category,
        content_type: item.template_type,
        seo_keywords: item.tags || [],
        system_message: '',
        variables: item.metadata,
        is_active: true,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) as BotContentTemplate[];
    },
  });
};

// Create new bot content template
export const useCreateBotTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<BotContentTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ai_content_library')
        .insert({
          title: template.template_name,
          content: template.prompt_template,
          category: template.category,
          template_type: template.content_type,
          tags: template.seo_keywords,
          created_by: template.bot_id,
          metadata: template.variables || {},
          is_approved: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating bot template:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-content-templates'] });
      toast.success('Content template created successfully!');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Failed to create content template');
    },
  });
};

// Update bot content template
export const useUpdateBotTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BotContentTemplate> & { id: string }) => {
      const updateData: any = {};
      
      if (updates.template_name) updateData.title = updates.template_name;
      if (updates.prompt_template) updateData.content = updates.prompt_template;
      if (updates.category) updateData.category = updates.category;
      if (updates.content_type) updateData.template_type = updates.content_type;
      if (updates.seo_keywords) updateData.tags = updates.seo_keywords;
      if (updates.variables) updateData.metadata = updates.variables;

      const { data, error } = await supabase
        .from('ai_content_library')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating bot template:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-content-templates'] });
      toast.success('Template updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    },
  });
};

// Delete bot content template
export const useDeleteBotTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('ai_content_library')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting bot template:', error);
        throw error;
      }

      return templateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-content-templates'] });
      toast.success('Template deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    },
  });
};

// Bulk create templates for multiple bots
export const useBulkCreateTemplates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templates: Omit<BotContentTemplate, 'id' | 'created_at' | 'updated_at'>[]) => {
      const insertData = templates.map(template => ({
        title: template.template_name,
        content: template.prompt_template,
        category: template.category,
        template_type: template.content_type,
        tags: template.seo_keywords,
        created_by: template.bot_id,
        metadata: template.variables || {},
        is_approved: true
      }));

      const { data, error } = await supabase
        .from('ai_content_library')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Error bulk creating templates:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bot-content-templates'] });
      toast.success(`Successfully created ${data.length} templates!`);
    },
    onError: (error) => {
      console.error('Error bulk creating templates:', error);
      toast.error('Failed to create templates');
    },
  });
};

// Mock content generation schedule for now
export const useContentGenerationSchedule = () => {
  return useQuery({
    queryKey: ['content-generation-schedule'],
    queryFn: async () => {
      // Return mock data since table doesn't exist yet
      return [{
        id: '1',
        schedule_name: 'Daily Content Generation',
        cron_expression: '*/15 * * * *',
        is_active: true,
        daily_quota: 420,
        current_day_count: 0,
        last_run_at: null,
        next_run_at: null,
        generation_config: {
          templates_per_run: 7,
          variation_enabled: true,
          seo_optimization: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }] as ContentGenerationSchedule[];
    },
  });
};

// Mock update content generation schedule
export const useUpdateGenerationSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentGenerationSchedule> & { id: string }) => {
      // Mock implementation for now
      console.log('Mock updating schedule:', id, updates);
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-generation-schedule'] });
      toast.success('Generation schedule updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update generation schedule');
    },
  });
};

// Trigger manual content generation
export const useTriggerContentGeneration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: {
      botIds?: string[];
      templateCount?: number;
      scheduleId?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('bot-content-generator', {
        body: {
          type: 'manual_generation',
          ...config
        }
      });

      if (error) {
        console.error('Error triggering content generation:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bot-generated-content'] });
      toast.success(`Content generation triggered! ${data?.message || ''}`);
    },
    onError: (error) => {
      console.error('Error triggering generation:', error);
      toast.error('Failed to trigger content generation');
    },
  });
};