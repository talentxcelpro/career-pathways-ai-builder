import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface VideoViewData {
  contentId: string;
  contentType: 'post' | 'reel' | 'story';
  watchTime: number;
  completionRate: number;
  isLiked?: boolean;
  isShared?: boolean;
}

export const useVideoViewTracking = () => {
  const { user } = useAuth();
  const trackedViews = useRef<Set<string>>(new Set());

  const trackVideoView = useCallback(async (data: VideoViewData) => {
    if (!user) return;

    const viewKey = `${data.contentId}-${data.contentType}`;
    
    // Prevent duplicate tracking for the same video in the same session
    if (trackedViews.current.has(viewKey)) return;

    try {
      // Track the view with detailed analytics
      await supabase.rpc('track_video_view', {
        viewer_id: user.id,
        content_id: data.contentId,
        content_type: data.contentType,
        watch_time_seconds: Math.floor(data.watchTime / 1000),
        completion_rate: data.completionRate,
        is_liked: data.isLiked || false,
        is_shared: data.isShared || false,
        session_id: `${user.id}-${Date.now()}`, // Simple session tracking
        user_agent: navigator.userAgent,
        platform: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      });

      // Mark as tracked
      trackedViews.current.add(viewKey);
      
      console.log('Video view tracked:', data);
    } catch (error) {
      console.error('Error tracking video view:', error);
    }
  }, [user]);

  const trackVideoEngagement = useCallback(async (
    contentId: string, 
    contentType: 'post' | 'reel' | 'story', 
    engagementType: 'like' | 'comment' | 'share'
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('track_video_engagement', {
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        engagement_type: engagementType,
        timestamp: new Date().toISOString()
      });
      
      console.log('Video engagement tracked:', { contentId, contentType, engagementType });
    } catch (error) {
      console.error('Error tracking video engagement:', error);
    }
  }, [user]);

  const resetSession = useCallback(() => {
    trackedViews.current.clear();
  }, []);

  return {
    trackVideoView,
    trackVideoEngagement,
    resetSession
  };
};