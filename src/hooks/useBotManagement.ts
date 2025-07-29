import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIBot {
  id: string;
  full_name: string;
  email: string;
  role?: string;
  profile_picture_url?: string;
  banner_picture_url?: string;
  departments: string[];
  content_domains: string[];
  bot_tone: string;
  content_frequency: string;
  is_ai_bot: boolean;
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
  return useQuery({
    queryKey: ['ai-bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_ai_bot', true)
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
          full_name: bot.full_name,
          email: bot.email,
          departments: bot.departments,
          content_domains: bot.content_domains,
          bot_tone: bot.bot_tone,
          content_frequency: bot.content_frequency,
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
        .from('profiles')
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
      const [botsResult, contentResult, templatesResult] = await Promise.all([
        supabase.from('profiles').select('id, is_ai_bot').eq('is_ai_bot', true),
        supabase.from('bot_generated_content').select('id, status, generation_cost'),
        supabase.from('bot_content_templates').select('id, is_active')
      ]);

      const activeBots = botsResult.data?.length || 0;
      const totalBots = botsResult.data?.length || 0;
      const totalContent = contentResult.data?.length || 0;
      const publishedContent = contentResult.data?.filter(content => content.status === 'published').length || 0;
      const totalCost = contentResult.data?.reduce((sum, content) => sum + (content.generation_cost || 0), 0) || 0;
      const activeTemplates = templatesResult.data?.filter(template => template.is_active).length || 0;

      return {
        activeBots,
        totalBots,
        totalContent,
        publishedContent,
        totalCost,
        activeTemplates
      };
    },
  });
};