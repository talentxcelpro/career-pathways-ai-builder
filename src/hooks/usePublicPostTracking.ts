import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePublicPostTracking = (postId: string, isPublicView = false) => {
  useEffect(() => {
    if (!postId || !isPublicView) return;

    const trackView = async () => {
      try {
        // Generate a simple session ID
        const sessionId = sessionStorage.getItem('session_id') || 
          Math.random().toString(36).substring(2, 15);
        
        if (!sessionStorage.getItem('session_id')) {
          sessionStorage.setItem('session_id', sessionId);
        }

        // Track the public post view
        await supabase.rpc('track_public_post_view', {
          p_post_id: postId,
          p_viewer_ip: null, // We can't get IP on frontend
          p_user_agent: navigator.userAgent,
          p_referrer: document.referrer || null,
          p_session_id: sessionId
        });
      } catch (error) {
        console.error('Error tracking public post view:', error);
      }
    };

    // Track view after a short delay to ensure user actually viewed the content
    const timeoutId = setTimeout(trackView, 2000);

    return () => clearTimeout(timeoutId);
  }, [postId, isPublicView]);
};