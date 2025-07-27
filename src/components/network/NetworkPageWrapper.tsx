import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NetworkPageWrapperProps {
  children: React.ReactNode;
}

export const NetworkPageWrapper: React.FC<NetworkPageWrapperProps> = ({ children }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up real-time subscriptions for live updates
    const channel = supabase
      .channel('network-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        () => {
          console.log('New post detected, refreshing posts...');
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'connections'
        },
        () => {
          console.log('Connection updated, refreshing requests...');
          queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
          queryClient.invalidateQueries({ queryKey: ['connections'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections'
        },
        () => {
          console.log('New connection request, refreshing...');
          queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          console.log('Conversation updated, refreshing...');
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['conversationProfiles'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return <>{children}</>;
};