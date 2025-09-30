import React, { createContext, useContext, useEffect, useState } from 'react';
import { initTalentXcelRealtime, cleanupRealtime, realtimeManager, WatchedTable, RealtimePayload } from '@/lib/realtimeManager';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeContextType {
  isConnected: boolean;
  lastUpdate: { table: WatchedTable; payload: RealtimePayload } | null;
  connectionStatus: Record<string, string>;
  usePollingFallback: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

interface RealtimeProviderProps {
  children: React.ReactNode;
  showToasts?: boolean;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ 
  children, 
  showToasts = false 
}) => {
  // Guard against React dispatcher being null
  if (!React || typeof React.useState !== 'function') {
    console.warn('React hooks not available, rendering children directly');
    return <>{children}</>;
  }

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{ table: WatchedTable; payload: RealtimePayload } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, string>>({});
  const [usePollingFallback, setUsePollingFallback] = useState(false);

  useEffect(() => {
    console.log('🎯 TalentXcel Realtime Provider initializing...');
    // Check if user is authenticated for realtime
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Auth session for realtime:', session ? 'authenticated' : 'not authenticated');
    });

    // Initialize realtime with global callback
    const onUpdateCallback = (table: WatchedTable, payload: RealtimePayload) => {
      console.log(`🔄 Global realtime update - ${table}:`, payload);
      setLastUpdate({ table, payload });
      // Consider connected once we start receiving events
      setIsConnected(true);
      setUsePollingFallback(false); // Realtime is working, disable polling
      // Update connection status
      const status = realtimeManager.getStatus();
      setConnectionStatus(status);

      // Show toast notifications for updates (optional)
      if (showToasts) {
        const message = getUpdateMessage(table, payload);
        if (message) {
          toast.success("Real-time Update", {
            description: message,
            duration: 3000,
          });
        }
      }
    };

    initTalentXcelRealtime(onUpdateCallback);

    // Re-init on auth changes and when connection comes back online
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      console.log('🔐 Auth state changed - reinitializing realtime');
      cleanupRealtime();
      initTalentXcelRealtime(onUpdateCallback);
    });

    const onlineHandler = () => {
      console.log('🌐 Network online - reinitializing realtime');
      cleanupRealtime();
      initTalentXcelRealtime(onUpdateCallback);
    };
    window.addEventListener('online', onlineHandler);

    // Check connection status periodically and enable polling fallback if needed
    const statusInterval = setInterval(() => {
      const status = realtimeManager.getStatus();
      setConnectionStatus(status);
      const connectedChannels = Object.values(status).filter(s => s === 'SUBSCRIBED').length;
      const wasConnected = isConnected;
      setIsConnected(connectedChannels > 0);
      
      // Enable polling fallback after 10 seconds if realtime isn't working
      if (connectedChannels === 0 && !usePollingFallback) {
        setTimeout(() => {
          const currentStatus = realtimeManager.getStatus();
          const currentConnected = Object.values(currentStatus).filter(s => s === 'SUBSCRIBED').length;
          if (currentConnected === 0) {
            console.log('🔄 Realtime not working, enabling polling fallback...');
            setUsePollingFallback(true);
            if (showToasts) {
              toast.info("Connection Status", {
                description: "Using polling for updates while realtime reconnects...",
                duration: 3000,
              });
            }
          }
        }, 10000);
      }
    }, 3000);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up TalentXcel Realtime Provider...');
      clearInterval(statusInterval);
      window.removeEventListener('online', onlineHandler);
      authListener?.subscription?.unsubscribe();
      cleanupRealtime();
      setIsConnected(false);
    };
  }, [showToasts]); // Removed toast dependency since we're using direct import

  const contextValue: RealtimeContextType = {
    isConnected,
    lastUpdate,
    connectionStatus,
    usePollingFallback,
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
};

// Helper function to generate user-friendly update messages
function getUpdateMessage(table: WatchedTable, payload: RealtimePayload): string | null {
  const { eventType } = payload;
  
  switch (table) {
    case 'connections':
      return eventType === 'INSERT' ? 'New connection request!' :
             eventType === 'UPDATE' ? 'Connection updated!' :
             null;
             
    case 'messages':
      return eventType === 'INSERT' ? 'New message received!' : null;
      
    case 'job_applications':
      return eventType === 'INSERT' ? 'Application submitted!' :
             eventType === 'UPDATE' ? 'Application status updated!' :
             null;

    case 'user_activities':
      return eventType === 'INSERT' ? 'New activity!' : null;

    case 'txc_transactions':
      return eventType === 'INSERT' ? 'TXC transaction completed!' : null;
             
    default:
      return null;
  }
}

/**
 * Hook to access realtime context
 */
export function useRealtimeContext(): RealtimeContextType {
  const context = useContext(RealtimeContext);
  
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  
  return context;
}

/**
 * Hook to check if realtime is connected
 */
export function useRealtimeStatus() {
  const { isConnected, connectionStatus } = useRealtimeContext();
  return { isConnected, connectionStatus };
}