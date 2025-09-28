import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ContentType = 'course' | 'lesson' | 'instructor';
type InteractionType = 'like' | 'follow' | 'bookmark';

export function useLearningInteractions(contentType: ContentType, contentId: string) {
  const [interactions, setInteractions] = useState({
    isLiked: false,
    isFollowed: false,
    isBookmarked: false,
    likesCount: 0,
    followsCount: 0,
    bookmarksCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!contentId) return;
    loadInteractions();
  }, [contentType, contentId]);

  const loadInteractions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user's interactions
      let userInteractions = { isLiked: false, isFollowed: false, isBookmarked: false };
      if (user) {
        const { data } = await supabase
          .from('learning_interactions')
          .select('interaction_type')
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('user_id', user.id);

        if (data) {
          userInteractions.isLiked = data.some(i => i.interaction_type === 'like');
          userInteractions.isFollowed = data.some(i => i.interaction_type === 'follow');
          userInteractions.isBookmarked = data.some(i => i.interaction_type === 'bookmark');
        }
      }

      // Get counts for all interactions
      const { data: allInteractions } = await supabase
        .from('learning_interactions')
        .select('interaction_type')
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      const counts = {
        likesCount: allInteractions?.filter(i => i.interaction_type === 'like').length || 0,
        followsCount: allInteractions?.filter(i => i.interaction_type === 'follow').length || 0,
        bookmarksCount: allInteractions?.filter(i => i.interaction_type === 'bookmark').length || 0,
      };

      setInteractions({
        ...userInteractions,
        ...counts,
      });
    } catch (error) {
      console.error('Error loading learning interactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInteraction = async (type: InteractionType) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: `Please sign in to ${type} this ${contentType}`,
          variant: "destructive",
        });
        return;
      }

      const isCurrentlyActive = interactions[`is${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof interactions] as boolean;

      if (isCurrentlyActive) {
        // Remove interaction
        const { error } = await supabase
          .from('learning_interactions')
          .delete()
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('user_id', user.id)
          .eq('interaction_type', type);

        if (error) throw error;

        setInteractions(prev => ({
          ...prev,
          [`is${type.charAt(0).toUpperCase() + type.slice(1)}`]: false,
          [`${type}sCount`]: Math.max(0, (prev[`${type}sCount` as keyof typeof prev] as number) - 1),
        }));

        toast({
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} removed`,
          description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} ${type} removed`,
        });
      } else {
        // Add interaction
        const { error } = await supabase
          .from('learning_interactions')
          .insert({
            content_type: contentType,
            content_id: contentId,
            user_id: user.id,
            interaction_type: type,
          });

        if (error) throw error;

        setInteractions(prev => ({
          ...prev,
          [`is${type.charAt(0).toUpperCase() + type.slice(1)}`]: true,
          [`${type}sCount`]: (prev[`${type}sCount` as keyof typeof prev] as number) + 1,
        }));

        toast({
          title: `${type.charAt(0).toUpperCase() + type.slice(1)}ed`,
          description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} ${type}ed successfully`,
        });
      }
    } catch (error: any) {
      console.error(`Error toggling ${type}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${type} ${contentType}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    ...interactions,
    isLoading,
    isUpdating,
    toggleLike: () => toggleInteraction('like'),
    toggleFollow: () => toggleInteraction('follow'),
    toggleBookmark: () => toggleInteraction('bookmark'),
  };
}