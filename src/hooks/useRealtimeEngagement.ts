import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EngagementEvent {
  id: string;
  event_type: string;
  actor_id: string;
  target_type: string;
  target_id: string;
  target_owner_id?: string;
  module: string;
  metadata: Record<string, any>;
  score_impact: number;
  created_at: string;
}

export interface ContentScore {
  content_id: string;
  content_type: string;
  final_score: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  applies_count?: number;
  enrollments_count?: number;
  last_engagement_at: string;
}

export interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
  current_module?: string;
  current_page?: string;
  device_type: string;
}

export const useRealtimeEngagement = (module: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<EngagementEvent[]>([]);
  const [contentScores, setContentScores] = useState<Map<string, ContentScore>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserPresence>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // Publish engagement event
  const publishEvent = useCallback(async (
    eventType: string,
    targetType: string,
    targetId: string,
    targetOwnerId?: string,
    metadata: Record<string, any> = {},
    scoreImpact: number = 1
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('publish_engagement_event', {
        p_event_type: eventType,
        p_actor_id: user.id,
        p_target_type: targetType,
        p_target_id: targetId,
        p_target_owner_id: targetOwnerId,
        p_module: module,
        p_metadata: metadata,
        p_score_impact: scoreImpact
      });

      if (error) {
        console.error('Error publishing engagement event:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to publish engagement event:', error);
      toast({
        title: "Error",
        description: "Failed to record engagement",
        variant: "destructive",
      });
    }
  }, [user, module, toast]);

  // Update user presence
  const updatePresence = useCallback(async (
    isOnline: boolean = true,
    currentPage?: string,
    deviceType: string = 'web'
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('update_user_presence', {
        p_user_id: user.id,
        p_is_online: isOnline,
        p_current_module: module,
        p_current_page: currentPage,
        p_device_type: deviceType
      });
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  }, [user, module]);

  // Get ranked content
  const getRankedContent = useCallback(async (
    contentType?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ContentScore[]> => {
    try {
      const { data, error } = await supabase.rpc('get_ranked_content', {
        p_module: module,
        p_content_type: contentType,
        p_limit: limit,
        p_offset: offset
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get ranked content:', error);
      return [];
    }
  }, [module]);

  // Quick engagement actions
  const likeContent = useCallback((targetType: string, targetId: string, targetOwnerId?: string) => {
    return publishEvent('like', targetType, targetId, targetOwnerId);
  }, [publishEvent]);

  const commentOnContent = useCallback((targetType: string, targetId: string, targetOwnerId?: string, commentText?: string) => {
    return publishEvent('comment', targetType, targetId, targetOwnerId, { comment_text: commentText });
  }, [publishEvent]);

  const shareContent = useCallback((targetType: string, targetId: string, targetOwnerId?: string) => {
    return publishEvent('share', targetType, targetId, targetOwnerId, {}, 5); // Higher score impact for shares
  }, [publishEvent]);

  const viewContent = useCallback((targetType: string, targetId: string, targetOwnerId?: string, viewDuration?: number) => {
    return publishEvent('view', targetType, targetId, targetOwnerId, { view_duration: viewDuration }, 0.1);
  }, [publishEvent]);

  const followUser = useCallback((targetUserId: string) => {
    return publishEvent('follow', 'profile', targetUserId, targetUserId);
  }, [publishEvent]);

  const applyToJob = useCallback((jobId: string, jobOwnerId?: string) => {
    return publishEvent('apply', 'job', jobId, jobOwnerId, {}, 10); // High score impact
  }, [publishEvent]);

  const enrollInCourse = useCallback((courseId: string, courseOwnerId?: string) => {
    return publishEvent('enroll', 'course', courseId, courseOwnerId, {}, 8);
  }, [publishEvent]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    console.log(`🔥 Setting up realtime for module: ${module}`);

    // Subscribe to engagement events
    const eventsChannel = supabase
      .channel(`engagement-events-${module}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'engagement_events',
          filter: `module=eq.${module}`
        },
        (payload) => {
          console.log('🔥 New engagement event:', payload);
          const newEvent = payload.new as EngagementEvent;
          setEvents(prev => [newEvent, ...prev.slice(0, 99)]); // Keep last 100 events
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log(`🔥 Events channel status: ${status}`);
      });

    // Subscribe to content score updates
    const scoresChannel = supabase
      .channel(`content-scores-${module}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_scores',
          filter: `module=eq.${module}`
        },
        (payload) => {
          console.log('📊 Content score update:', payload);
          const score = payload.new as ContentScore;
          if (score) {
            setContentScores(prev => new Map(prev.set(score.content_id, score)));
          }
        }
      )
      .subscribe((status) => {
        console.log(`📊 Scores channel status: ${status}`);
      });

    // Subscribe to user presence
    const presenceChannel = supabase
      .channel(`user-presence-${module}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          const presence = payload.new as UserPresence;
          if (presence) {
            setOnlineUsers(prev => new Map(prev.set(presence.user_id, presence)));
          }
        }
      )
      .subscribe((status) => {
        console.log(`👥 Presence channel status: ${status}`);
      });

    // Update presence on mount
    updatePresence(true, window.location.pathname);

    return () => {
      console.log(`🔥 Cleaning up realtime for module: ${module}`);
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(scoresChannel);
      supabase.removeChannel(presenceChannel);
      updatePresence(false);
    };
  }, [user, module, updatePresence]);

  // Update presence when page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      updatePresence(!document.hidden, window.location.pathname);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updatePresence]);

  return {
    // State
    events,
    contentScores,
    onlineUsers,
    isConnected,
    
    // Actions
    publishEvent,
    updatePresence,
    getRankedContent,
    
    // Quick actions
    likeContent,
    commentOnContent,
    shareContent,
    viewContent,
    followUser,
    applyToJob,
    enrollInCourse
  };
};