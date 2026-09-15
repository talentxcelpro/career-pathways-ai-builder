import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsEvent {
  id: string;
  resume_id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  visitor_ip?: string;
  user_agent?: string;
  created_at: string;
}

export interface AnalyticsSummary {
  total_views: number;
  total_downloads: number;
  total_shares: number;
  recent_events: AnalyticsEvent[];
  top_sources: { source: string; count: number }[];
  daily_stats: { date: string; views: number; downloads: number }[];
}

export const useNewResumeAnalytics = (resumeId?: string) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const trackEvent = useCallback(async (eventType: string, eventData: any = {}, targetResumeId?: string) => {
    if (!user || (!resumeId && !targetResumeId)) return;

    try {
      await supabase
        .from('resume_analytics')
        .insert({
          resume_id: targetResumeId || resumeId,
          user_id: user.id,
          event_type: eventType,
          event_data: eventData,
          visitor_ip: null, // Would be populated by server
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }, [user, resumeId]);

  const loadAnalytics = useCallback(async () => {
    if (!user || !resumeId) return;

    setIsLoading(true);
    try {
      // Get all events for this resume
      const { data: events, error: eventsError } = await supabase
        .from('resume_analytics')
        .select('*')
        .eq('resume_id', resumeId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;

      // Calculate summary stats
      const totalViews = events?.filter(e => e.event_type === 'view').length || 0;
      const totalDownloads = events?.filter(e => e.event_type === 'download').length || 0;
      const totalShares = events?.filter(e => e.event_type === 'share').length || 0;

      // Get source breakdown
      const sourceCount = events?.reduce((acc: any, event) => {
        const source = event.event_data?.source || 'direct';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      const topSources = Object.entries(sourceCount || {})
        .map(([source, count]) => ({ source, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate daily stats for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyStats = events
        ?.filter(e => new Date(e.created_at) >= thirtyDaysAgo)
        .reduce((acc: any, event) => {
          const date = new Date(event.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = { date, views: 0, downloads: 0 };
          }
          if (event.event_type === 'view') acc[date].views++;
          if (event.event_type === 'download') acc[date].downloads++;
          return acc;
        }, {});

      setAnalytics({
        total_views: totalViews,
        total_downloads: totalDownloads,
        total_shares: totalShares,
        recent_events: events?.slice(0, 10) || [],
        top_sources: topSources,
        daily_stats: Object.values(dailyStats || {}) as any[]
      });

    } catch (error: any) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, resumeId]);

  // Convenience methods for common events
  const trackView = useCallback((source?: string) => {
    trackEvent('view', { source: source || 'direct' });
  }, [trackEvent]);

  const trackDownload = useCallback((format: string) => {
    trackEvent('download', { format });
  }, [trackEvent]);

  const trackShare = useCallback((platform: string) => {
    trackEvent('share', { platform });
  }, [trackEvent]);

  useEffect(() => {
    if (resumeId) {
      loadAnalytics();
    }
  }, [loadAnalytics, resumeId]);

  return {
    analytics,
    isLoading,
    trackEvent,
    trackView,
    trackDownload,
    trackShare,
    loadAnalytics
  };
};