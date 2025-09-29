import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTXCMining } from './useTXCMining';
import { useTokenBalance } from './useTokenBalance';

export interface ProfilePost {
  id: string;
  user_id: string;
  author_id: string;
  content: string;
  post_type: string;
  media_urls: string[];
  tags: string[];
  visibility: 'public' | 'private' | 'followers';
  origin: string;
  location?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  is_pinned: boolean;
  is_featured: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  profiles?: any;
}

export function useProfilePosts(userId: string) {
  const queryClient = useQueryClient();
  const { earnTXC } = useTXCMining();
  const { refreshBalance } = useTokenBalance();

  // Get posts for a user's profile (both their own posts and posts visible to them)
  const { data: profilePosts, isLoading } = useQuery({
    queryKey: ['profile-posts', userId],
    queryFn: async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey (
            id,
            full_name,
            profile_picture_url,
            title,
            headline,
            current_company
          )
        `)
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      // If viewing someone else's profile, only show public posts
      // If viewing own profile, show all posts
      if (!currentUser || currentUser.id !== userId) {
        query = query.eq('visibility', 'public');
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ProfilePost[];
    },
    enabled: !!userId
  });

  // Get posts for global feed (all public posts)
  const { data: globalFeedPosts } = useQuery({
    queryKey: ['global-feed-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey (
            id,
            full_name,
            profile_picture_url,
            title,
            headline,
            current_company
          )
        `)
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ProfilePost[];
    }
  });

  // Create a new post
  const createPost = useMutation({
    mutationFn: async (postData: {
      content: string;
      post_type?: string;
      media_urls?: string[];
      tags?: string[];
      visibility?: 'public' | 'private' | 'followers';
      origin?: string;
      location?: string;
      link_previews?: Array<{ url: string }>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to create posts');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: postData.content,
          post_type: postData.post_type || 'text',
          author_id: user.id,
          user_id: user.id,
          media_urls: postData.media_urls || [],
          tags: postData.tags || [],
          visibility: postData.visibility || 'public',
          origin: postData.origin || 'profile',
          location: postData.location,
          link_previews: postData.link_previews || []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      // TEMPORARILY DISABLE TXC CALLS FOR POST CREATION - Fix TXC first
      // This ensures posts work without TXC interference
      
      toast.success('Post created successfully!');
      
      queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
      queryClient.invalidateQueries({ queryKey: ['global-feed-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['token-balance'] });
    },
    onError: (error) => {
      toast.error('Failed to create post');
      console.error('Create post error:', error);
    }
  });

  // Delete a post
  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
      queryClient.invalidateQueries({ queryKey: ['global-feed-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete post');
      console.error('Delete post error:', error);
    }
  });

  // Pin/unpin a post
  const togglePinPost = useMutation({
    mutationFn: async ({ postId, isPinned }: { postId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from('posts')
        .update({ is_pinned: isPinned })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
      toast.success(variables.isPinned ? 'Post pinned to profile' : 'Post unpinned');
    },
    onError: (error) => {
      toast.error('Failed to update post');
      console.error('Toggle pin error:', error);
    }
  });

  return {
    profilePosts,
    globalFeedPosts,
    isLoading,
    createPost,
    deletePost,
    togglePinPost
  };
}