import { useState, useEffect, useCallback } from 'react';
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
  user?: {
    full_name: string;
    profile_picture_url?: string;
  };
  viewed?: boolean;
  isViewing?: boolean;
}

export const useAdvancedStories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active stories with user data and view status
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

      // Check view status for current user
      const transformedStories: Story[] = await Promise.all(
        (storiesData || []).map(async (story) => {
          let viewed = false;
          
          if (user) {
            const { data: viewData } = await supabase
              .from('story_views')
              .select('id')
              .eq('story_id', story.id)
              .eq('viewer_id', user.id)
              .maybeSingle();
            
            viewed = !!viewData;
          }

          return {
            ...story,
            user: story.profiles,
            viewed,
            isViewing: false
          };
        })
      );

      // Group stories by user
      const groupedStories = transformedStories.reduce((acc, story) => {
        const userId = story.user_id;
        if (!acc[userId]) {
          acc[userId] = [];
        }
        acc[userId].push(story);
        return acc;
      }, {} as Record<string, Story[]>);

      // Flatten and sort: unviewed first, then by creation time
      const sortedStories = Object.values(groupedStories)
        .flat()
        .sort((a, b) => {
          // First, prioritize unviewed stories
          if (a.viewed !== b.viewed) {
            return a.viewed ? 1 : -1;
          }
          // Then sort by creation time (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      setStories(sortedStories);
    } catch (err: any) {
      console.error('Error fetching stories:', err);
      setError(err.message || 'Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const viewStory = useCallback(async (storyId: string) => {
    if (!user) return;

    try {
      // Record the view (upsert to handle duplicate views)
      const { error } = await supabase
        .from('story_views')
        .upsert({
          story_id: storyId,
          viewer_id: user.id,
        }, {
          onConflict: 'story_id,viewer_id'
        });

      if (error) throw error;

      // Update local state
      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, viewed: true, views_count: story.views_count + (story.viewed ? 0 : 1) }
            : story
        )
      );
    } catch (err: any) {
      console.error('Error recording story view:', err);
    }
  }, [user]);

  const deleteStory = useCallback(async (storyId: string) => {
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
  }, [user]);

  const getUserStories = useCallback((userId: string) => {
    return stories.filter(story => story.user_id === userId);
  }, [stories]);

  const hasUserStory = useCallback((userId: string) => {
    return stories.some(story => story.user_id === userId);
  }, [stories]);

  const hasUnviewedStories = useCallback((userId: string) => {
    return stories.some(story => story.user_id === userId && !story.viewed);
  }, [stories]);

  const getStoriesGroupedByUser = useCallback(() => {
    const grouped = stories.reduce((acc, story) => {
      const userId = story.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
          hasUnviewed: false
        };
      }
      acc[userId].stories.push(story);
      if (!story.viewed) {
        acc[userId].hasUnviewed = true;
      }
      return acc;
    }, {} as Record<string, { user: Story['user']; stories: Story[]; hasUnviewed: boolean }>);

    return Object.values(grouped).sort((a, b) => {
      // Prioritize users with unviewed stories
      if (a.hasUnviewed !== b.hasUnviewed) {
        return a.hasUnviewed ? -1 : 1;
      }
      // Then sort by latest story
      const aLatest = Math.max(...a.stories.map(s => new Date(s.created_at).getTime()));
      const bLatest = Math.max(...b.stories.map(s => new Date(s.created_at).getTime()));
      return bLatest - aLatest;
    });
  }, [stories]);

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
  }, [fetchStories]);

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
    getStoriesGroupedByUser
  };
};