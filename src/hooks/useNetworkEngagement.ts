import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EngagementEvent {
  type: 'like' | 'comment' | 'share' | 'bookmark' | 'connect' | 'message';
  targetId: string;
  targetType: 'post' | 'profile' | 'comment';
  metadata?: Record<string, any>;
}

export function useNetworkEngagement() {
  const [events, setEvents] = useState<EngagementEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const trackEvent = useCallback(async (event: EngagementEvent) => {
    setEvents(prev => [...prev, event]);
    
    try {
      // Track engagement in analytics
      await supabase.from('user_activities').insert({
        activity_type: event.type,
        activity_data: {
          target_id: event.targetId,
          target_type: event.targetType,
          ...event.metadata
        }
      });
    } catch (error) {
      console.error('Failed to track engagement:', error);
    }
  }, []);

  const sharePost = useCallback(async (postId: string, originalAuthorId: string) => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Increment shares count (would need a stored procedure)
      await supabase.rpc('increment_post_shares', { post_id: postId });

      // Create notification for original author
      if (originalAuthorId !== user.id) {
        await supabase.from('notifications').insert({
          user_id: originalAuthorId,
          type: 'post_shared',
          title: 'Post Shared',
          message: 'Someone shared your post',
          metadata: { 
            post_id: postId,
            shared_by: user.id 
          }
        });
      }

      await trackEvent({
        type: 'share',
        targetId: postId,
        targetType: 'post',
        metadata: { original_author: originalAuthorId }
      });

      toast.success('Post shared successfully');
    } catch (error) {
      console.error('Failed to share post:', error);
      toast.error('Failed to share post');
    } finally {
      setIsProcessing(false);
    }
  }, [trackEvent]);

  return {
    events,
    isProcessing,
    sharePost,
    trackEvent
  };
}