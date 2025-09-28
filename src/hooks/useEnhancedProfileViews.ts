import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseEnhancedProfileViewsReturn {
  viewCount: number;
  trackProfileView: (
    profileId: string, 
    viewType?: string,
    interactionSignals?: Record<string, any>
  ) => Promise<boolean>;
  isLoading: boolean;
}

interface ViewSession {
  sessionId: string;
  viewedProfiles: Set<string>;
  startTime: number;
}

export const useEnhancedProfileViews = (profileId?: string): UseEnhancedProfileViewsReturn => {
  const [viewCount, setViewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const sessionRef = useRef<ViewSession | null>(null);

  // Initialize session if not exists
  const initializeSession = useCallback(() => {
    if (!sessionRef.current) {
      sessionRef.current = {
        sessionId: `${user?.id || 'anon'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        viewedProfiles: new Set(),
        startTime: Date.now()
      };
    }
    return sessionRef.current;
  }, [user?.id]);

  // Enhanced view tracking with better validation
  const trackProfileView = useCallback(async (
    targetProfileId: string, 
    viewType: string = 'network_card',
    interactionSignals: Record<string, any> = {}
  ): Promise<boolean> => {
    if (isLoading || !targetProfileId) return false;
    
    // Don't track self-views
    if (user?.id === targetProfileId) return false;

    const session = initializeSession();
    
    // Prevent duplicate tracking in same session
    if (session.viewedProfiles.has(targetProfileId)) return false;

    setIsLoading(true);

    try {
      // Call the enhanced database function with validation
      const { data, error } = await supabase.rpc('track_profile_view_v2', {
        p_profile_id: targetProfileId,
        p_viewer_id: user?.id || null,
        p_view_type: viewType,
        p_session_id: session.sessionId,
        p_ip_address: null, // Will be handled server-side if needed
        p_user_agent: navigator.userAgent,
        p_view_duration_seconds: 0, // Will be updated later if needed
        p_interaction_signals: {
          ...interactionSignals,
          timestamp: new Date().toISOString(),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          referrer: document.referrer,
          session_start: session.startTime
        }
      });

      if (error) {
        console.warn('Failed to track profile view:', error);
        return false;
      }

      if (data) {
        // Mark as tracked in session
        session.viewedProfiles.add(targetProfileId);
        
        // Update local count if tracking our own profile views
        if (profileId === targetProfileId) {
          setViewCount(prev => prev + 1);
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.warn('Failed to track profile view:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isLoading, profileId, initializeSession]);

  return {
    viewCount,
    trackProfileView,
    isLoading
  };
};