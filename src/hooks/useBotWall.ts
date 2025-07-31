import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BotWallPost {
  id: string;
  bot_id: string;
  title: string;
  content: string;
  type: 'post' | 'article' | 'seo_page' | 'newsletter';
  source: 'ai' | 'manual';
  created_by?: string;
  tags: string[];
  is_draft: boolean;
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWallPostData {
  bot_id: string;
  title: string;
  content: string;
  type: 'post' | 'article' | 'seo_page' | 'newsletter';
  tags: string[];
  is_draft?: boolean;
  scheduled_at?: string;
}

export const useBotWallPosts = (botId?: string) => {
  return useQuery({
    queryKey: ['bot-wall-posts', botId],
    queryFn: async () => {
      let query = supabase
        .from('bot_wall')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (botId) {
        query = query.eq('bot_id', botId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BotWallPost[];
    },
    enabled: !!botId || botId === undefined,
  });
};

export const useCreateWallPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postData: CreateWallPostData) => {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bot_wall')
        .insert({
          ...postData,
          published_at: postData.is_draft ? null : new Date().toISOString(),
          created_by: userId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Also insert into posts table for network feed visibility
      if (!postData.is_draft) {
        try {
          await supabase.from('posts').insert({
            author_id: userId,
            user_id: userId,
            content: postData.content,
            headline: postData.title,
            is_public: true,
            post_type: 'bot_content',
            tags: postData.tags,
            status: 'published',
            visibility: 'public',
            origin: 'bot_wall',
            created_at: new Date().toISOString()
          });
        } catch (postError) {
          console.error('Failed to sync to posts table:', postError);
          // Don't fail the wall post creation if posts sync fails
        }
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bot-wall-posts'] });
      queryClient.invalidateQueries({ queryKey: ['bot-wall-posts', data.bot_id] });
      toast.success(data.is_draft ? 'Wall post saved as draft' : 'Wall post published successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create wall post: ${error.message}`);
    },
  });
};

export const useUpdateWallPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BotWallPost> & { id: string }) => {
      const { data, error } = await supabase
        .from('bot_wall')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bot-wall-posts'] });
      queryClient.invalidateQueries({ queryKey: ['bot-wall-posts', data.bot_id] });
      toast.success('Wall post updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update wall post: ${error.message}`);
    },
  });
};

export const useDeleteWallPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bot_wall')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-wall-posts'] });
      toast.success('Wall post deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete wall post: ${error.message}`);
    },
  });
};

export const usePublishWallPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('bot_wall')
        .update({ 
          is_draft: false, 
          published_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bot-wall-posts'] });
      queryClient.invalidateQueries({ queryKey: ['bot-wall-posts', data.bot_id] });
      toast.success('Wall post published successfully');
    },
    onError: (error) => {
      toast.error(`Failed to publish wall post: ${error.message}`);
    },
  });
};