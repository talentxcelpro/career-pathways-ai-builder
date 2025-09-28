import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ActivityType = 
  | 'job_like' 
  | 'job_save' 
  | 'job_share' 
  | 'user_follow' 
  | 'content_subscribe' 
  | 'comment_reaction'
  | 'post_like'
  | 'post_comment';

export function useSocialActivityTracker() {
  const trackActivity = useCallback(async (
    activityType: ActivityType,
    metadata: Record<string, any> = {}
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Track in user_activities table if it exists
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          activity_data: metadata,
          created_at: new Date().toISOString()
        });

      console.log(`Activity tracked: ${activityType}`, metadata);
    } catch (error) {
      console.log('Activity tracking failed (non-critical):', error);
    }
  }, []);

  const trackJobInteraction = useCallback((
    jobId: string, 
    interactionType: 'like' | 'save' | 'share'
  ) => {
    trackActivity(`job_${interactionType}` as ActivityType, {
      job_id: jobId,
      interaction_type: interactionType
    });
  }, [trackActivity]);

  const trackUserFollow = useCallback((targetUserId: string) => {
    trackActivity('user_follow', {
      target_user_id: targetUserId
    });
  }, [trackActivity]);

  const trackContentSubscription = useCallback((
    subscriptionType: string,
    subscriptionValue: string
  ) => {
    trackActivity('content_subscribe', {
      subscription_type: subscriptionType,
      subscription_value: subscriptionValue
    });
  }, [trackActivity]);

  const trackCommentReaction = useCallback((
    commentId: string,
    reactionType: string
  ) => {
    trackActivity('comment_reaction', {
      comment_id: commentId,
      reaction_type: reactionType
    });
  }, [trackActivity]);

  return {
    trackActivity,
    trackJobInteraction,
    trackUserFollow,
    trackContentSubscription,
    trackCommentReaction
  };
}