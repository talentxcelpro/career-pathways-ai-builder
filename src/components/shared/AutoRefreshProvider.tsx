import React, { createContext, useContext, useEffect } from 'react';
import { SWRConfig } from 'swr';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AutoRefreshContextType {
  broadcastRefresh: (module: string) => void;
}

const AutoRefreshContext = createContext<AutoRefreshContextType | undefined>(undefined);

export function useAutoRefreshContext() {
  const context = useContext(AutoRefreshContext);
  if (!context) {
    throw new Error('useAutoRefreshContext must be used within AutoRefreshProvider');
  }
  return context;
}

interface AutoRefreshProviderProps {
  children: React.ReactNode;
}

export function AutoRefreshProvider({ children }: AutoRefreshProviderProps) {
  const { toast } = useToast();
  
  // Broadcast channel for cross-tab sync
  const broadcastRefresh = (module: string) => {
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('talentxcel-updates');
      channel.postMessage(`refresh-${module}`);
    }
  };

  // Listen for broadcast messages
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('talentxcel-updates');
    
    channel.onmessage = (event) => {
      const message = event.data;
      if (message.startsWith('refresh-')) {
        const module = message.replace('refresh-', '');
        toast({
          title: "Data Updated",
          description: `${module} data has been refreshed`,
          duration: 2000,
        });
      }
    };

    return () => {
      channel.close();
    };
  }, [toast]);

  // Simplified realtime - only essential subscriptions
  useEffect(() => {
    // Only subscribe to jobs changes for now to reduce memory usage
    const channel = supabase
      .channel('jobs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        broadcastRefresh('jobs');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SWRConfig
      value={{
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        loadingTimeout: 10000,
        onError: (error) => {
          console.error('SWR Error:', error);
          toast({
            title: "Connection Error",
            description: "Failed to refresh data. Please check your connection.",
            variant: "destructive",
          });
        },
      }}
    >
      <AutoRefreshContext.Provider value={{ broadcastRefresh }}>
        {children}
      </AutoRefreshContext.Provider>
    </SWRConfig>
  );
}