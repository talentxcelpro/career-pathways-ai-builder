import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyPost {
  id: string;
  company_id: string;
  author_id: string;
  title: string;
  content: string;
  post_type: 'update' | 'announcement' | 'job_posting' | 'event' | 'milestone';
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  media_urls: string[];
  tags: string[];
  scheduled_at?: string;
  published_at?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  post_type: CompanyPost['post_type'];
  status: CompanyPost['status'];
  media_urls?: string[];
  tags?: string[];
  scheduled_at?: string;
  is_featured?: boolean;
}

export function useCompanyPosts(companyId?: string) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Get company posts
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['company-posts', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('company_posts')
        .select(`
          *,
          companies (
            name,
            logo_url
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CompanyPost[];
    },
    enabled: !!companyId
  });

  // Get published posts (public)
  const { data: publishedPosts } = useQuery({
    queryKey: ['published-company-posts', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('company_posts')
        .select(`
          *,
          companies (
            name,
            logo_url
          )
        `)
        .eq('company_id', companyId)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data as CompanyPost[];
    },
    enabled: !!companyId
  });

  // Create post mutation
  const createPost = useMutation({
    mutationFn: async (data: CreatePostData & { companyId: string }) => {
      if (!currentUser) throw new Error('Must be logged in');

      const postData = {
        company_id: data.companyId,
        author_id: currentUser.id,
        title: data.title,
        content: data.content,
        post_type: data.post_type,
        status: data.status,
        media_urls: data.media_urls || [],
        tags: data.tags || [],
        scheduled_at: data.scheduled_at,
        is_featured: data.is_featured || false,
        published_at: data.status === 'published' ? new Date().toISOString() : null
      };

      const { data: newPost, error } = await supabase
        .from('company_posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      return newPost;
    },
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['company-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-company-posts'] });
      toast.success(newPost.status === 'published' ? 'Post published successfully!' : 'Post saved as draft');
    },
    onError: (error) => {
      toast.error('Failed to create post');
      console.error('Create post error:', error);
    }
  });

  // Update post mutation
  const updatePost = useMutation({
    mutationFn: async (data: Partial<CreatePostData> & { id: string }) => {
      const { id, ...updateData } = data;
      
      const postData = {
        ...updateData,
        published_at: updateData.status === 'published' && !data.scheduled_at 
          ? new Date().toISOString() 
          : undefined
      };

      const { data: updatedPost, error } = await supabase
        .from('company_posts')
        .update(postData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedPost;
    },
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: ['company-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-company-posts'] });
      toast.success('Post updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update post');
      console.error('Update post error:', error);
    }
  });

  // Delete post mutation
  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('company_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-company-posts'] });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete post');
      console.error('Delete post error:', error);
    }
  });

  // Publish post mutation
  const publishPost = useMutation({
    mutationFn: async (postId: string) => {
      const { data: updatedPost, error } = await supabase
        .from('company_posts')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return updatedPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-company-posts'] });
      toast.success('Post published successfully!');
    },
    onError: (error) => {
      toast.error('Failed to publish post');
      console.error('Publish post error:', error);
    }
  });

  // Schedule post mutation
  const schedulePost = useMutation({
    mutationFn: async ({ postId, scheduledAt }: { postId: string; scheduledAt: string }) => {
      const { data: updatedPost, error } = await supabase
        .from('company_posts')
        .update({ 
          status: 'scheduled',
          scheduled_at: scheduledAt
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return updatedPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-posts'] });
      toast.success('Post scheduled successfully!');
    },
    onError: (error) => {
      toast.error('Failed to schedule post');
      console.error('Schedule post error:', error);
    }
  });

  return {
    posts,
    publishedPosts,
    isLoading,
    refetch,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    schedulePost,
    canManagePosts: !!currentUser
  };
}

// Hook for post interactions
export function usePostInteractions(postId: string) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Like post mutation
  const likePost = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('company_post_interactions')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          interaction_type: 'like'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-company-posts'] });
    },
    onError: (error) => {
      if (error.message.includes('duplicate')) {
        // User already liked, try to unlike
        unlikePost.mutate();
      } else {
        toast.error('Failed to like post');
      }
    }
  });

  // Unlike post mutation
  const unlikePost = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('company_post_interactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .eq('interaction_type', 'like');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-company-posts'] });
    },
    onError: (error) => {
      toast.error('Failed to unlike post');
    }
  });

  return {
    likePost,
    unlikePost,
    canInteract: !!currentUser
  };
}