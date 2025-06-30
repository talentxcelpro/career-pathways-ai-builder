
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNetworkManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(full_name, profile_picture_url)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('content', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: networkStats } = useQuery({
    queryKey: ['network-stats'],
    queryFn: async () => {
      const [
        { count: totalPosts },
        { count: totalGroups },
        { count: totalEvents },
        reportedContentCount
      ] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('groups').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        // For reported content, we'll use a mock count for now as there's no reporting table
        Promise.resolve({ count: 5 })
      ]);

      return {
        totalPosts: totalPosts || 0,
        totalGroups: totalGroups || 0,
        totalEvents: totalEvents || 0,
        reportedContent: reportedContentCount?.count || 0
      };
    }
  });

  const { data: trendingTopics } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      const { data: posts } = await supabase
        .from('posts')
        .select('tags')
        .not('tags', 'is', null)
        .limit(100);

      // Extract and count hashtags
      const tagCounts: Record<string, number> = {};
      posts?.forEach(post => {
        post.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      return Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag: `#${tag}`, count }));
    }
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Post deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete post');
    }
  });

  const handleDeletePost = (postId: string) => {
    deletePost.mutate(postId);
  };

  return {
    searchTerm,
    setSearchTerm,
    posts,
    networkStats,
    trendingTopics,
    isLoading: postsLoading,
    handleDeletePost
  };
};
