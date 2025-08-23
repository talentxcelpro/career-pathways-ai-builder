import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkRealtime } from '@/hooks/useRealtimeUpdates';
import { supabase } from '@/integrations/supabase/client';

export const NetworkPostsAutoRefresh: React.FC = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscriptions for auto-refresh
  useNetworkRealtime((payload) => {
    console.log('Network update received:', payload);
    
    // Invalidate all posts-related queries for auto-refresh
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['linkedInMobilePosts'] });
    queryClient.invalidateQueries({ queryKey: ['network-posts'] });
    
    // If it's a new post, show a subtle notification
    if (payload.eventType === 'INSERT' && payload.table === 'posts') {
      // Could add a toast notification here if needed
      console.log('New post available');
    }
  });

  // Set up periodic refresh for iOS devices (fallback)
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['linkedInMobilePosts'] });
    }, 30000); // Refresh every 30 seconds on iOS

    return () => clearInterval(interval);
  }, [queryClient]);

  // Set up connection state monitoring
  useEffect(() => {
    const channel = supabase.channel('network-connection-status');
    
    channel.on('system', {}, (payload) => {
      if (payload.status === 'ONLINE') {
        // Refresh data when connection is restored
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['linkedInMobilePosts'] });
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null; // This component doesn't render anything
};