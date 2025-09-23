import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VideoEvent {
  event_type: string;
  lesson_id: string;
  user_id?: string;
  timestamp: string;
  data: Record<string, any>;
  session_id: string;
}

interface VideoAnalytics {
  totalWatchTime: number;
  completionRate: number;
  averageSessionDuration: number;
  dropOffPoints: number[];
  qualityChanges: number;
  bufferingEvents: number;
  errors: number;
}

export const useVideoAnalytics = (lessonId: string, userId?: string) => {
  const sessionId = useRef(Math.random().toString(36).substring(7));
  const sessionStartTime = useRef(Date.now());
  const lastHeartbeat = useRef(Date.now());
  const watchSegments = useRef<Array<{ start: number; end: number }>>([]);
  const currentSegmentStart = useRef<number | null>(null);
  const eventQueue = useRef<VideoEvent[]>([]);
  const flushTimer = useRef<NodeJS.Timeout>();

  // Track video events
  const trackVideoEvent = useCallback(async (
    eventType: string,
    data: Record<string, any> = {}
  ) => {
    const event: VideoEvent = {
      event_type: eventType,
      lesson_id: lessonId,
      user_id: userId,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        connection_type: (navigator as any).connection?.effectiveType || 'unknown',
        user_agent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      session_id: sessionId.current
    };

    // Add to queue for batch processing
    eventQueue.current.push(event);

    // Immediate flush for critical events
    if (['error', 'complete', 'session_end'].includes(eventType)) {
      await flushEvents();
    } else {
      // Schedule batch flush
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flushEvents, 5000);
    }

    console.log('Video Event:', eventType, data);
  }, [lessonId, userId]);

  // Flush events to database
  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;

    const events = [...eventQueue.current];
    eventQueue.current = [];

    try {
      const { error } = await supabase
        .from('video_analytics')
        .insert(events);

      if (error) {
        console.error('Failed to save video analytics:', error);
        // Re-queue events on failure
        eventQueue.current.unshift(...events);
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
      // Re-queue events on network error
      eventQueue.current.unshift(...events);
    }
  }, []);

  // Track watch segments
  const startWatchSegment = useCallback((currentTime: number) => {
    if (currentSegmentStart.current === null) {
      currentSegmentStart.current = currentTime;
    }
  }, []);

  const endWatchSegment = useCallback((currentTime: number) => {
    if (currentSegmentStart.current !== null) {
      watchSegments.current.push({
        start: currentSegmentStart.current,
        end: currentTime
      });
      currentSegmentStart.current = null;
    }
  }, []);

  // Calculate analytics
  const calculateAnalytics = useCallback((): VideoAnalytics => {
    const totalWatchTime = watchSegments.current.reduce(
      (total, segment) => total + (segment.end - segment.start),
      0
    );

    return {
      totalWatchTime,
      completionRate: 0, // Will be calculated based on video duration
      averageSessionDuration: Date.now() - sessionStartTime.current,
      dropOffPoints: [], // Will be populated from events
      qualityChanges: 0, // Will be calculated from events
      bufferingEvents: 0, // Will be calculated from events
      errors: 0 // Will be calculated from events
    };
  }, []);

  // Heartbeat to track active viewing
  const sendHeartbeat = useCallback(() => {
    const now = Date.now();
    if (now - lastHeartbeat.current > 30000) { // 30 seconds
      trackVideoEvent('heartbeat', {
        session_duration: now - sessionStartTime.current,
        total_watch_time: calculateAnalytics().totalWatchTime
      });
      lastHeartbeat.current = now;
    }
  }, [trackVideoEvent, calculateAnalytics]);

  // Track engagement milestones
  const trackMilestone = useCallback((percentage: number, duration: number) => {
    const milestones = [25, 50, 75, 90, 100];
    
    milestones.forEach(milestone => {
      if (percentage >= milestone && percentage < milestone + 5) {
        trackVideoEvent('milestone', {
          percentage: milestone,
          duration,
          timestamp: percentage
        });
      }
    });
  }, [trackVideoEvent]);

  // Performance monitoring
  const trackPerformance = useCallback((metrics: {
    loadTime?: number;
    bufferCount?: number;
    qualityChanges?: number;
    errors?: any[];
  }) => {
    trackVideoEvent('performance', {
      load_time_ms: metrics.loadTime,
      buffer_events: metrics.bufferCount,
      quality_changes: metrics.qualityChanges,
      error_count: metrics.errors?.length || 0,
      timestamp: Date.now()
    });
  }, [trackVideoEvent]);

  // Engagement scoring
  const calculateEngagementScore = useCallback((
    watchTime: number,
    duration: number,
    interactions: number
  ): number => {
    const completionScore = Math.min(watchTime / duration, 1) * 40;
    const interactionScore = Math.min(interactions / 10, 1) * 30;
    const continuityScore = watchSegments.current.length > 0 ? 
      (watchSegments.current.length <= 3 ? 30 : Math.max(30 - (watchSegments.current.length - 3) * 5, 10)) : 0;
    
    return Math.round(completionScore + interactionScore + continuityScore);
  }, []);

  // A/B testing support
  const trackVariant = useCallback((variant: string, feature: string) => {
    trackVideoEvent('ab_test', {
      variant,
      feature,
      session_id: sessionId.current
    });
  }, [trackVideoEvent]);

  // Error tracking with context
  const trackError = useCallback((error: Error, context: Record<string, any> = {}) => {
    trackVideoEvent('error_detailed', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      context,
      timestamp: Date.now(),
      url: window.location.href
    });
  }, [trackVideoEvent]);

  // Accessibility tracking
  const trackAccessibility = useCallback((feature: string, enabled: boolean) => {
    trackVideoEvent('accessibility', {
      feature,
      enabled,
      timestamp: Date.now()
    });
  }, [trackVideoEvent]);

  // Cleanup on unmount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        endWatchSegment(Date.now());
        trackVideoEvent('tab_hidden');
      } else {
        trackVideoEvent('tab_visible');
      }
    };

    const handleBeforeUnload = () => {
      endWatchSegment(Date.now());
      trackVideoEvent('session_end', {
        session_duration: Date.now() - sessionStartTime.current,
        total_watch_time: calculateAnalytics().totalWatchTime
      });
      flushEvents();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
      }
      
      // Final flush
      flushEvents();
    };
  }, [endWatchSegment, trackVideoEvent, calculateAnalytics, flushEvents]);

  // Periodic heartbeat
  useEffect(() => {
    const heartbeatInterval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(heartbeatInterval);
  }, [sendHeartbeat]);

  return {
    trackVideoEvent,
    startWatchSegment,
    endWatchSegment,
    trackMilestone,
    trackPerformance,
    calculateEngagementScore,
    trackVariant,
    trackError,
    trackAccessibility,
    analytics: calculateAnalytics(),
    sessionId: sessionId.current
  };
};