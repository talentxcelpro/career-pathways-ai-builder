import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type InteractionType = 'like' | 'save' | 'share';

export function useJobInteractions(jobId: string) {
  const [interactions, setInteractions] = useState({
    isLiked: false,
    isSaved: false,
    likesCount: 0,
    savesCount: 0,
    sharesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!jobId) return;
    loadInteractions();
  }, [jobId]);

  const loadInteractions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user's interactions
      let userInteractions = { isLiked: false, isSaved: false };
      if (user) {
        const { data } = await supabase
          .from('job_interactions')
          .select('interaction_type')
          .eq('job_id', jobId)
          .eq('user_id', user.id);

        if (data) {
          userInteractions.isLiked = data.some(i => i.interaction_type === 'like');
          userInteractions.isSaved = data.some(i => i.interaction_type === 'save');
        }
      }

      // Get counts for all interactions
      const { data: allInteractions } = await supabase
        .from('job_interactions')
        .select('interaction_type')
        .eq('job_id', jobId);

      const counts = {
        likesCount: allInteractions?.filter(i => i.interaction_type === 'like').length || 0,
        savesCount: allInteractions?.filter(i => i.interaction_type === 'save').length || 0,
        sharesCount: allInteractions?.filter(i => i.interaction_type === 'share').length || 0,
      };

      setInteractions({
        ...userInteractions,
        ...counts,
      });
    } catch (error) {
      console.error('Error loading job interactions:', error);
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
          description: `Please sign in to ${type} jobs`,
          variant: "destructive",
        });
        return;
      }

      const isCurrentlyActive = type === 'like' ? interactions.isLiked : interactions.isSaved;

      if (isCurrentlyActive) {
        // Remove interaction
        const { error } = await supabase
          .from('job_interactions')
          .delete()
          .eq('job_id', jobId)
          .eq('user_id', user.id)
          .eq('interaction_type', type);

        if (error) throw error;

        setInteractions(prev => ({
          ...prev,
          [type === 'like' ? 'isLiked' : 'isSaved']: false,
          [`${type}sCount`]: Math.max(0, prev[`${type}sCount` as keyof typeof prev] as number - 1),
        }));

        toast({
          title: `${type === 'like' ? 'Unliked' : 'Unsaved'}`,
          description: `Job ${type === 'like' ? 'unliked' : 'removed from saved jobs'}`,
        });
      } else {
        // Add interaction
        const { error } = await supabase
          .from('job_interactions')
          .insert({
            job_id: jobId,
            user_id: user.id,
            interaction_type: type,
          });

        if (error) throw error;

        setInteractions(prev => ({
          ...prev,
          [type === 'like' ? 'isLiked' : 'isSaved']: true,
          [`${type}sCount`]: (prev[`${type}sCount` as keyof typeof prev] as number) + 1,
        }));

        toast({
          title: `${type === 'like' ? 'Liked' : 'Saved'}`,
          description: `Job ${type === 'like' ? 'liked' : 'saved for later'}`,
        });
      }
    } catch (error: any) {
      console.error(`Error toggling ${type}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${type} job`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const recordShare = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('job_interactions')
          .insert({
            job_id: jobId,
            user_id: user.id,
            interaction_type: 'share',
          });

        setInteractions(prev => ({
          ...prev,
          sharesCount: prev.sharesCount + 1,
        }));
      }
    } catch (error) {
      console.error('Error recording share:', error);
    }
  };

  return {
    ...interactions,
    isLoading,
    isUpdating,
    toggleLike: () => toggleInteraction('like'),
    toggleSave: () => toggleInteraction('save'),
    recordShare,
  };
}