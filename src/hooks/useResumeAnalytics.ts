import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AnalyticsEvent = {
  id: string;
  event_type: 'view' | 'download' | 'export' | 'share' | 'apply' | 'interview';
  event_data: Record<string, any>;
  source?: string;
  location?: string;
  created_at: string;
};

export type AnalyticsMetrics = {
  totalViews: number;
  totalDownloads: number;
  totalExports: number;
  totalShares: number;
  applicationRate: number;
  interviewRate: number;
  topSources: Array<{ source: string; count: number }>;
  weeklyTrend: Array<{ date: string; views: number; downloads: number }>;
};

export const useResumeAnalytics = (resumeId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch analytics events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['resume-analytics', resumeId],
    queryFn: async (): Promise<AnalyticsEvent[]> => {
      if (!resumeId || !user) return [];
      
      const { data, error } = await supabase
        .from('resume_analytics')
        .select('*')
        .eq('resume_id', resumeId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return (data || []) as AnalyticsEvent[];
    },
    enabled: !!resumeId && !!user
  });

  // Calculate metrics from events
  const metrics: AnalyticsMetrics = useMemo(() => {
    if (!events || events.length === 0) {
      return {
        totalViews: 0,
        totalDownloads: 0,
        totalExports: 0,
        totalShares: 0,
        applicationRate: 0,
        interviewRate: 0,
        topSources: [],
        weeklyTrend: []
      };
    }

    const views = events.filter(e => e.event_type === 'view').length;
    const downloads = events.filter(e => e.event_type === 'download').length;
    const exports = events.filter(e => e.event_type === 'export').length;
    const shares = events.filter(e => e.event_type === 'share').length;
    const applications = events.filter(e => e.event_type === 'apply').length;
    const interviews = events.filter(e => e.event_type === 'interview').length;

    // Calculate rates
    const applicationRate = views > 0 ? (applications / views) * 100 : 0;
    const interviewRate = applications > 0 ? (interviews / applications) * 100 : 0;

    // Top sources
    const sourceCounts = events.reduce((acc, event) => {
      const source = event.source || 'direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Weekly trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const weeklyTrend = last7Days.map(date => {
      const dayEvents = events.filter(e => 
        e.created_at.startsWith(date)
      );
      return {
        date,
        views: dayEvents.filter(e => e.event_type === 'view').length,
        downloads: dayEvents.filter(e => e.event_type === 'download').length
      };
    });

    return {
      totalViews: views,
      totalDownloads: downloads,
      totalExports: exports,
      totalShares: shares,
      applicationRate,
      interviewRate,
      topSources,
      weeklyTrend
    };
  }, [events]);

  // Track analytics event mutation
  const trackEvent = useMutation({
    mutationFn: async ({ 
      eventType, 
      eventData = {}, 
      source,
      location 
    }: {
      eventType: AnalyticsEvent['event_type'];
      eventData?: Record<string, any>;
      source?: string;
      location?: string;
    }) => {
      if (!resumeId || !user) throw new Error('Missing required data');

      const { error } = await supabase
        .from('resume_analytics')
        .insert({
          resume_id: resumeId,
          viewer_id: user.id, // Using viewer_id to match existing schema
          event_type: eventType,
          event_data: eventData,
          source,
          location,
          metadata: eventData // Also storing in metadata for compatibility
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume-analytics', resumeId] });
    }
  });

  // Convenience functions for tracking common events
  const trackView = (source?: string) => {
    trackEvent.mutate({ 
      eventType: 'view', 
      source,
      eventData: { timestamp: new Date().toISOString() }
    });
  };

  const trackDownload = (format: string, source?: string) => {
    trackEvent.mutate({ 
      eventType: 'download', 
      source,
      eventData: { format, timestamp: new Date().toISOString() }
    });
  };

  const trackExport = (format: string, template?: string) => {
    trackEvent.mutate({ 
      eventType: 'export',
      eventData: { format, template, timestamp: new Date().toISOString() }
    });
  };

  const trackShare = (platform: string) => {
    trackEvent.mutate({ 
      eventType: 'share',
      eventData: { platform, timestamp: new Date().toISOString() }
    });
  };

  const trackApplication = (jobTitle?: string, company?: string) => {
    trackEvent.mutate({ 
      eventType: 'apply',
      eventData: { jobTitle, company, timestamp: new Date().toISOString() }
    });
  };

  const trackInterview = (company?: string, type?: string) => {
    trackEvent.mutate({ 
      eventType: 'interview',
      eventData: { company, type, timestamp: new Date().toISOString() }
    });
  };

  return {
    events,
    metrics,
    isLoading: eventsLoading,
    trackView,
    trackDownload,
    trackExport,
    trackShare,
    trackApplication,
    trackInterview,
    trackEvent: trackEvent.mutate
  };
};