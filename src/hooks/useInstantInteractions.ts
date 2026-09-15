/**
 * Instant Interaction Hook
 * Provides optimistic updates for all user interactions
 */

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOptimisticMutation } from './useOptimisticMutation';
import { toast } from 'sonner';

export function useInstantInteractions() {
  const queryClient = useQueryClient();

  // Like/Unlike post with instant feedback
  const likePost = useOptimisticMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (isLiked) {
        const { data, error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId });
        
        if (error) throw error;
        return null;
      }
    },
    queryKey: ['posts'],
    updateFn: (oldData: any, { postId, isLiked }) => {
      if (!oldData?.pages) return oldData;
      
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          posts: page.posts?.map((post: any) =>
            post.id === postId
              ? {
                  ...post,
                  likes_count: (post.likes_count || 0) + (isLiked ? 1 : -1),
                  is_liked: isLiked,
                }
              : post
          ),
        })),
      };
    },
  });

  // Add comment with instant feedback
  const addComment = useOptimisticMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    queryKey: ['comments'],
    updateFn: (oldData: any, { postId, content }) => {
      const tempComment = {
        id: `temp-${Date.now()}`,
        post_id: postId,
        content,
        created_at: new Date().toISOString(),
        author: { full_name: 'You' },
      };

      if (!oldData) return [tempComment];
      return [tempComment, ...oldData];
    },
    successMessage: 'Comment added',
  });

  // Send connection request with instant feedback
  const sendConnectionRequest = useOptimisticMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          recipient_id: userId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    queryKey: ['connections'],
    updateFn: (oldData: any, { userId }) => {
      const tempConnection = {
        id: `temp-${Date.now()}`,
        recipient_id: userId,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      if (!oldData) return [tempConnection];
      return [tempConnection, ...oldData];
    },
    successMessage: 'Connection request sent',
  });

  // Accept connection request with instant feedback
  const acceptConnection = useOptimisticMutation({
    mutationFn: async ({ connectionId }: { connectionId: string }) => {
      const { data, error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    queryKey: ['connections'],
    updateFn: (oldData: any, { connectionId }) => {
      if (!oldData) return oldData;
      return oldData.map((conn: any) =>
        conn.id === connectionId ? { ...conn, status: 'accepted' } : conn
      );
    },
    successMessage: 'Connection accepted',
  });

  // Apply to job with instant feedback
  const applyToJob = useOptimisticMutation({
    mutationFn: async ({ jobId, applicationData }: { jobId: string; applicationData: any }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          ...applicationData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    queryKey: ['job', 'jobId'],
    updateFn: (oldData: any, { jobId }) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        has_applied: true,
        applications_count: (oldData.applications_count || 0) + 1,
      };
    },
    successMessage: 'Application submitted successfully',
  });

  // Share post with instant feedback
  const sharePost = useOptimisticMutation({
    mutationFn: async ({ postId, content }: { postId: string; content?: string }) => {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: content || '',
          shared_post_id: postId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    queryKey: ['posts'],
    updateFn: (oldData: any, { postId }) => {
      if (!oldData?.pages) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          posts: page.posts?.map((post: any) =>
            post.id === postId
              ? { ...post, shares_count: (post.shares_count || 0) + 1 }
              : post
          ),
        })),
      };
    },
    successMessage: 'Post shared',
  });

  return {
    likePost,
    addComment,
    sendConnectionRequest,
    acceptConnection,
    applyToJob,
    sharePost,
  };
}
