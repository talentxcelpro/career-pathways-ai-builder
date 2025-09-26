import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ContentItem {
  id: string;
  user_id: string;
  content_type: string;
  title: string;
  content: string;
  tags: string[];
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export const useContentLibrary = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadContent = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error('Failed to load content:', error);
      toast.error('Failed to load content library');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveContent = useCallback(async (contentData: {
    content_type: string;
    title: string;
    content: string;
    tags?: string[];
    is_public?: boolean;
  }) => {
    if (!user) {
      toast.error('Please sign in to save content');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('content_library')
        .insert({
          user_id: user.id,
          ...contentData,
          tags: contentData.tags || [],
          is_public: contentData.is_public || false
        })
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [data, ...prev]);
      toast.success('Content saved to library!');
      return data;
    } catch (error: any) {
      console.error('Failed to save content:', error);
      toast.error('Failed to save content');
      throw error;
    }
  }, [user]);

  const updateContent = useCallback(async (id: string, updates: Partial<ContentItem>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('content_library')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === id ? data : item));
      toast.success('Content updated successfully!');
    } catch (error: any) {
      console.error('Failed to update content:', error);
      toast.error('Failed to update content');
    }
  }, [user]);

  const deleteContent = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('content_library')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast.success('Content deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content');
    }
  }, [user]);

  const incrementUsage = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_library')
        .update({ usage_count: supabase.rpc('increment_usage', { content_id: id }) })
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to increment usage:', error);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    items,
    isLoading,
    loadContent,
    saveContent,
    updateContent,
    deleteContent,
    incrementUsage
  };
};