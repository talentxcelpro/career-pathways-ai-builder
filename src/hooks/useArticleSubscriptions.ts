import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ArticleSubscription {
  id: string;
  user_id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export const useArticleSubscriptions = (userId?: string) => {
  const queryClient = useQueryClient();

  // Get user's subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['articleSubscriptions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('article_subscriptions')
        .select(`
          *,
          author:profiles!article_subscriptions_author_id_fkey(
            id,
            full_name,
            profile_picture_url,
            title,
            current_company
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Get subscriber count for an author
  const getSubscriberCount = async (authorId: string) => {
    const { count, error } = await supabase
      .from('article_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', authorId);

    if (error) throw error;
    return count || 0;
  };

  // Check if user is subscribed to an author
  const isSubscribedTo = (authorId: string) => {
    return subscriptions?.some(sub => sub.author_id === authorId) || false;
  };

  // Subscribe to author
  const subscribeMutation = useMutation({
    mutationFn: async (authorId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('article_subscriptions')
        .insert({
          user_id: user.id,
          author_id: authorId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['articleSubscriptions'] });
      toast.success('Successfully subscribed to author!');
    },
    onError: (error) => {
      console.error('Subscribe error:', error);
      toast.error('Failed to subscribe to author');
    }
  });

  // Unsubscribe from author
  const unsubscribeMutation = useMutation({
    mutationFn: async (authorId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('article_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('author_id', authorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleSubscriptions'] });
      toast.success('Successfully unsubscribed from author');
    },
    onError: (error) => {
      console.error('Unsubscribe error:', error);
      toast.error('Failed to unsubscribe from author');
    }
  });

  return {
    subscriptions,
    subscriptionsLoading,
    isSubscribedTo,
    getSubscriberCount,
    subscribe: subscribeMutation.mutate,
    unsubscribe: unsubscribeMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending
  };
};

export const useArticleBookmarks = (userId?: string) => {
  const queryClient = useQueryClient();

  // Get user's bookmarked articles
  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery({
    queryKey: ['articleBookmarks', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('article_bookmarks')
        .select(`
          *,
          post:posts!article_bookmarks_post_id_fkey(
            id,
            headline,
            tagline,
            featured_image_url,
            article_category,
            reading_time,
            created_at,
            author_id,
            profiles!posts_author_id_fkey(
              id,
              full_name,
              profile_picture_url,
              title
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Check if article is bookmarked
  const isBookmarked = (postId: string) => {
    return bookmarks?.some(bookmark => bookmark.post_id === postId) || false;
  };

  // Bookmark article
  const bookmarkMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('article_bookmarks')
        .insert({
          user_id: user.id,
          post_id: postId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleBookmarks'] });
      toast.success('Article bookmarked!');
    },
    onError: (error) => {
      console.error('Bookmark error:', error);
      toast.error('Failed to bookmark article');
    }
  });

  // Remove bookmark
  const unbookmarkMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('article_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleBookmarks'] });
      toast.success('Bookmark removed');
    },
    onError: (error) => {
      console.error('Unbookmark error:', error);
      toast.error('Failed to remove bookmark');
    }
  });

  return {
    bookmarks,
    bookmarksLoading,
    isBookmarked,
    bookmark: bookmarkMutation.mutate,
    unbookmark: unbookmarkMutation.mutate,
    isBookmarking: bookmarkMutation.isPending,
    isUnbookmarking: unbookmarkMutation.isPending
  };
};