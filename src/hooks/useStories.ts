import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Story {
  id: string;
  user_id: string;
  type: 'photo' | 'video' | 'text';
  content?: string;
  media_url?: string;
  background?: string;
  font?: string;
  font_size?: string;
  is_active: boolean;
  views_count: number;
  created_at: string;
  expires_at: string;
  // User profile data
  user?: {
    full_name: string;
    profile_picture_url?: string;
  };
  // View status for current user
  viewed?: boolean;
}

export const useStories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active stories with user data
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select(`
          *,
          profiles!stories_user_id_fkey (
            full_name,
            profile_picture_url
          )
        `)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (storiesError) throw storiesError;

      // Transform data and check view status for current user
      const transformedStories: Story[] = await Promise.all(
        (storiesData || []).map(async (story) => {
          let viewed = false;
          
          if (user) {
            const { data: viewData } = await supabase
              .from('story_views')
              .select('id')
              .eq('story_id', story.id)
              .eq('viewer_id', user.id)
              .single();
            
            viewed = !!viewData;
          }

          return {
            ...story,
            user: story.profiles,
            viewed,
          };
        })
      );

      setStories(transformedStories);
    } catch (err: any) {
      console.error('Error fetching stories:', err);
      setError(err.message || 'Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  const viewStory = async (storyId: string) => {
    if (!user) return;

    try {
      // Record the view
      await supabase
        .from('story_views')
        .upsert({
          story_id: storyId,
          viewer_id: user.id,
        });

      // Update local state
      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, viewed: true, views_count: story.views_count + 1 }
            : story
        )
      );
    } catch (err: any) {
      console.error('Error recording story view:', err);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_active: false })
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setStories(prev => prev.filter(story => story.id !== storyId));
      
      toast.success('Story deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting story:', err);
      toast.error('Failed to delete story');
      return false;
    }
  };

  const getUserStories = (userId: string) => {
    return stories.filter(story => story.user_id === userId);
  };

  const hasUserStory = (userId: string) => {
    return stories.some(story => story.user_id === userId);
  };

  const hasUnviewedStories = (userId: string) => {
    return stories.some(story => story.user_id === userId && !story.viewed);
  };

  useEffect(() => {
    fetchStories();

    // Set up realtime subscription for stories
    const channel = supabase
      .channel('stories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories',
        },
        () => {
          fetchStories(); // Refetch when stories change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    stories,
    loading,
    error,
    refreshStories: fetchStories,
    viewStory,
    deleteStory,
    getUserStories,
    hasUserStory,
    hasUnviewedStories,
  };
};