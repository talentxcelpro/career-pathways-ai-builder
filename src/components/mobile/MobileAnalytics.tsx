import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  eventType: string;
  eventName: string;
  screenName?: string;
  properties?: Record<string, any>;
}

export const useMobileAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = async (event: AnalyticsEvent) => {
    if (!user) return;

    try {
      await supabase.from('mobile_app_analytics').insert({
        user_id: user.id,
        event_type: event.eventType,
        event_name: event.eventName,
        screen_name: event.screenName,
        properties: event.properties || {},
        device_info: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          timestamp: new Date().toISOString(),
        },
        session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  };

  const trackScreenView = (screenName: string, properties?: Record<string, any>) => {
    trackEvent({
      eventType: 'screen_view',
      eventName: 'screen_viewed',
      screenName,
      properties,
    });
  };

  const trackUserAction = (actionName: string, properties?: Record<string, any>) => {
    trackEvent({
      eventType: 'user_action',
      eventName: actionName,
      properties,
    });
  };

  const trackFeatureUsage = (featureName: string, properties?: Record<string, any>) => {
    trackEvent({
      eventType: 'feature_usage',
      eventName: featureName,
      properties,
    });
  };

  return {
    trackEvent,
    trackScreenView,
    trackUserAction,
    trackFeatureUsage,
  };
};

export const MobileAnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { trackScreenView } = useMobileAnalytics();

  useEffect(() => {
    // Track initial screen view
    trackScreenView(window.location.pathname);

    // Track route changes
    const handleRouteChange = () => {
      trackScreenView(window.location.pathname);
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [trackScreenView]);

  return <>{children}</>;
};

// Export default component for compatibility
export const MobileAnalytics: React.FC = () => {
  return <div>Mobile Analytics Component</div>;
};