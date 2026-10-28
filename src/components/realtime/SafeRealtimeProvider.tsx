import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { initTalentXcelRealtime, cleanupRealtime, realtimeManager, WatchedTable, RealtimePayload } from '@/lib/realtimeManager';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeContextType {
  isConnected: boolean;
  lastUpdate: { table: WatchedTable; payload: RealtimePayload } | null;
  connectionStatus: Record<string, string>;
  usePollingFallback: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

interface SafeRealtimeProviderProps {
  children: ReactNode;
  showToasts?: boolean;
}

/**
 * Safe Realtime Provider that connects to user channels only when authenticated
 */
export const SafeRealtimeProvider: FC<SafeRealtimeProviderProps> = ({
  children, 
  showToasts = false 
}) => {

  // Safe state initialization with error handling
  const [state, setState] = useState(() => {
    try {
      return {
        isConnected: false,
        lastUpdate: null as { table: WatchedTable; payload: RealtimePayload } | null,
        connectionStatus: {} as Record<string, string>,
        usePollingFallback: false
      };
    } catch (error) {
      console.error('State initialization failed:', error);
      return {
        isConnected: false,
        lastUpdate: null,
        connectionStatus: {},
        usePollingFallback: false
      };
    }
  });

  useEffect(() => {
    let mounted = true;
    let statusInterval: ReturnType<typeof setInterval> | null = null;
    let hasInitializedRealtime = false;

    // Toast helper
    let toastFn: ((opts: any) => void) | null = null;
    if (showToasts) {
      import('@/hooks/use-toast').then(mod => {
        toastFn = mod.toast;
      }).catch(() => {});
    }

    const startStatusInterval = () => {
      if (statusInterval) return;
      statusInterval = setInterval(() => {
        if (!mounted) return;
        try {
          const status = realtimeManager.getStatus();
          const connectedChannels = Object.values(status).filter(s => s === 'SUBSCRIBED').length;
          setState(prev => ({
            ...prev,
            connectionStatus: status,
            isConnected: connectedChannels > 0
          }));
        } catch (error) {
          console.error('Status interval error:', error);
        }
      }, 5000);
    };

    const stopStatusInterval = () => {
      if (statusInterval) {
        clearInterval(statusInterval);
        statusInterval = null;
      }
    };

    // Safe update callback with error handling
    const onUpdateCallback = (table: WatchedTable, payload: RealtimePayload) => {
      if (!mounted) return;
      
      try {
        setState(prev => ({
          ...prev,
          lastUpdate: { table, payload },
          isConnected: true,
          usePollingFallback: false
        }));

        try {
          const status = realtimeManager.getStatus();
          setState(prev => ({ ...prev, connectionStatus: status }));
        } catch (statusError) {
          console.warn('Failed to get realtime status:', statusError);
        }

        if (showToasts && toastFn) {
          try {
            const message = getUpdateMessage(table, payload);
            if (message) {
              toastFn({
                title: "Real-time Update",
                description: message,
                duration: 3000,
              });
            }
          } catch (toastError) {
            console.warn('Toast notification failed:', toastError);
          }
        }
      } catch (error) {
        console.error('Update callback error:', error);
      }
    };

    // Initialize realtime safely with retry logic
    const initWithRetry = async (attempt = 1) => {
      try {
        await initTalentXcelRealtime(onUpdateCallback);
        hasInitializedRealtime = true;
        startStatusInterval();
      } catch (initError) {
        console.error(`Realtime initialization failed (attempt ${attempt}):`, initError);
        if (attempt < 3 && mounted) {
          const delay = Math.pow(2, attempt) * 1000;
          setTimeout(() => {
            if (mounted) initWithRetry(attempt + 1);
          }, delay);
        } else if (mounted) {
          setState(prev => ({ ...prev, usePollingFallback: true }));
        }
      }
    };

    // Check auth session before connecting to realtime channels
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          initWithRetry();
        }
      } catch (error) {
        console.warn('Auth session check failed:', error);
      }
    };

    initAuth();

    // Safe auth listener: connect when user logs in, disconnect on logout
    let authListener: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          try {
            cleanupRealtime();
            initWithRetry();
          } catch (error) {
            console.error('Auth state change reinit failed:', error);
          }
        } else {
          stopStatusInterval();
          try {
            cleanupRealtime();
          } catch (e) {}
          hasInitializedRealtime = false;
          setState(prev => ({
            ...prev,
            isConnected: false,
            connectionStatus: {}
          }));
        }
      });
      authListener = data;
    } catch (error) {
      console.error('Auth listener setup failed:', error);
    }

    // Safe online handler
    const onlineHandler = async () => {
      if (!mounted) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          cleanupRealtime();
          initWithRetry();
        }
      } catch (error) {
        console.error('Online handler reinit failed:', error);
      }
    };

    window.addEventListener('online', onlineHandler);

    // Cleanup function
    return () => {
      mounted = false;
      stopStatusInterval();
      window.removeEventListener('online', onlineHandler);
      authListener?.subscription?.unsubscribe();
      if (hasInitializedRealtime) {
        try {
          cleanupRealtime();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }
    };
  }, [showToasts]);

  const contextValue: RealtimeContextType = {
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    connectionStatus: state.connectionStatus,
    usePollingFallback: state.usePollingFallback,
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
 * Safe hook to access realtime context
 */
export function useSafeRealtimeContext(): RealtimeContextType {
  const context = useContext(RealtimeContext);
  
  if (!context) {
    return {
      isConnected: false,
      lastUpdate: null,
      connectionStatus: {},
      usePollingFallback: true
    };
  }
  
  return context;
}

/**
 * Safe hook to check realtime status
 */
export function useSafeRealtimeStatus() {
  const { isConnected, connectionStatus } = useSafeRealtimeContext();
  return { isConnected, connectionStatus };
}