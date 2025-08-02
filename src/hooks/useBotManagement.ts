import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIBot {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_picture_url?: string;
  banner_picture_url?: string;
  department: string[];
  content_domains: string[];
  tone_style: string;
  frequency: string;
  distribution_channels: string[];
  is_active: boolean;
  bot_config?: any;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BotContentTemplate {
  id: string;
  bot_id: string;
  template_name: string;
  content_type: string;
  category: string;
  prompt_template: string;
  system_message?: string;
  variables: any[];
  seo_keywords?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BotGeneratedContent {
  id: string;
  bot_id: string;
  template_id?: string;
  content_type: string;
  title: string;
  content: string;
  meta_data: any;
  seo_keywords?: string[];
  status: string;
  scheduled_at?: string;
  published_at?: string;
  engagement_metrics: any;
  ai_model_used?: string;
  generation_cost: number;
  created_at: string;
  updated_at: string;
}

export const useBots = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('ai-bots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_bots'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['ai-bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_bots')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AIBot[];
    },
  });
};

export const useCreateBot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bot: Omit<AIBot, 'id' | 'created_at' | 'updated_at'>) => {
      // Call edge function to create bot user
      const { data, error } = await supabase.functions.invoke('create-bot-user', {
        body: {
          name: bot.name,
          email: bot.email,
          department: bot.department,
          content_domains: bot.content_domains,
          tone_style: bot.tone_style,
          frequency: bot.frequency,
          profile_picture_url: bot.profile_picture_url
        }
      });
      
      if (error) throw error;
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
      toast.success('AI Bot created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create bot: ${error.message}`);
    },
  });
};

export const useUpdateBot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AIBot> & { id: string }) => {
      const { data, error } = await supabase
        .from('ai_bots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
      toast.success('AI Bot updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update bot: ${error.message}`);
    },
  });
};

export const useDeleteBot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Call edge function to delete bot user
      const { error } = await supabase.functions.invoke('delete-bot-user', {
        body: { botId: id }
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
      toast.success('AI Bot deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete bot: ${error.message}`);
    },
  });
};

export const useBotTemplates = (botId?: string) => {
  return useQuery({
    queryKey: ['bot-templates', botId],
    queryFn: async () => {
      let query = supabase.from('bot_content_templates').select('*');
      
      if (botId) {
        query = query.eq('bot_id', botId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BotContentTemplate[];
    },
    enabled: !!botId || botId === undefined,
  });
};

export const useBotGeneratedContent = (botId?: string) => {
  return useQuery({
    queryKey: ['bot-generated-content', botId],
    queryFn: async () => {
      let query = supabase.from('bot_generated_content').select('*');
      
      if (botId) {
        query = query.eq('bot_id', botId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BotGeneratedContent[];
    },
    enabled: !!botId || botId === undefined,
  });
};

export const useBotStats = () => {
  return useQuery({
    queryKey: ['bot-stats'],
    queryFn: async () => {
      const [botsResult, contentResult, templatesResult, promptsResult, queueResult] = await Promise.all([
        supabase.from('ai_bots').select('id, is_active').eq('is_active', true),
        supabase.from('bot_generated_content').select('id, status, generation_cost'),
        supabase.from('bot_content_templates').select('id, is_active'),
        supabase.from('bot_prompt_library').select('id, is_active, usage_count'),
        supabase.from('bot_content_queue').select('id, status')
      ]);

      const activeBots = botsResult.data?.length || 0;
      const totalBots = botsResult.data?.length || 0;
      const totalContent = contentResult.data?.length || 0;
      const publishedContent = contentResult.data?.filter(content => content.status === 'published').length || 0;
      const totalCost = contentResult.data?.reduce((sum, content) => sum + (content.generation_cost || 0), 0) || 0;
      const activeTemplates = templatesResult.data?.filter(template => template.is_active).length || 0;
      const activePrompts = promptsResult.data?.filter(prompt => prompt.is_active).length || 0;
      const totalPromptUsage = promptsResult.data?.reduce((sum, prompt) => sum + (prompt.usage_count || 0), 0) || 0;
      const queuedContent = queueResult.data?.filter(item => item.status === 'generated').length || 0;

      return {
        activeBots,
        totalBots,
        totalContent,
        publishedContent,
        totalCost,
        activeTemplates,
        activePrompts,
        totalPromptUsage,
        queuedContent
      };
    },
  });
};

// New hooks for automation features
export const useBotAutomation = () => {
  const queryClient = useQueryClient();

  const generateBatch = useMutation({
    mutationFn: async ({ botId, count = 5 }: { botId?: string; count?: number }) => {
      const { data, error } = await supabase.functions.invoke('ai-bot-content-engine', {
        body: { action: 'generate_batch', botId, count }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-generated-content'] });
      queryClient.invalidateQueries({ queryKey: ['bot-stats'] });
      toast.success('Content batch generated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to generate content: ${error.message}`);
    },
  });

  const publishQueue = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-bot-content-engine', {
        body: { action: 'publish_queue' }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bot-generated-content'] });
      queryClient.invalidateQueries({ queryKey: ['bot-stats'] });
      toast.success(`Published ${data.published} posts successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to publish content: ${error.message}`);
    },
  });

  return { generateBatch, publishQueue };
};

export const useBotPrompts = (botId?: string) => {
  return useQuery({
    queryKey: ['bot-prompts', botId],
    queryFn: async () => {
      let query = supabase.from('bot_prompt_library').select('*');
      
      if (botId) {
        query = query.eq('bot_id', botId);
      }
      
      const { data, error } = await query
        .eq('is_active', true)
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!botId || botId === undefined,
  });
};

export const useBotContentQueue = (botId?: string) => {
  return useQuery({
    queryKey: ['bot-content-queue', botId],
    queryFn: async () => {
      let query = supabase
        .from('bot_content_queue')
        .select('*, ai_bots(name), bot_prompt_library(category)');
      
      if (botId) {
        query = query.eq('bot_id', botId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!botId || botId === undefined,
  });
};