import React, { createContext, useContext, useEffect, useState } from 'react';
import { initTalentXcelRealtime, cleanupRealtime, realtimeManager, WatchedTable, RealtimePayload } from '@/lib/realtimeManager';
import { useSafeToast } from '@/hooks/useSafeToast';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeContextType {
  isConnected: boolean;
  lastUpdate: { table: WatchedTable; payload: RealtimePayload } | null;
  connectionStatus: Record<string, string>;
  usePollingFallback: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

interface SafeRealtimeProviderProps {
  children: React.ReactNode;
  showToasts?: boolean;
}

/**
 * Safe Realtime Provider that handles React dispatcher issues gracefully
 */
export const SafeRealtimeProvider: React.FC<SafeRealtimeProviderProps> = ({ 
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

  // Use safe toast hook
  const { toast, isReady: toastReady } = useSafeToast();

  useEffect(() => {
    let mounted = true;
    console.log('🎯 Safe TalentXcel Realtime Provider initializing...');
    
    // Check authentication safely
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 Safe auth session for realtime:', session ? 'authenticated' : 'not authenticated');
      } catch (error) {
        console.warn('Auth session check failed:', error);
      }
    };

    initAuth();

    // Safe update callback with error handling
    const onUpdateCallback = (table: WatchedTable, payload: RealtimePayload) => {
      if (!mounted) return;
      
      try {
        console.log(`🔄 Safe global realtime update - ${table}:`, payload);
        
        setState(prev => ({
          ...prev,
          lastUpdate: { table, payload },
          isConnected: true,
          usePollingFallback: false
        }));

        // Update connection status safely
        try {
          const status = realtimeManager.getStatus();
          setState(prev => ({ ...prev, connectionStatus: status }));
        } catch (statusError) {
          console.warn('Failed to get realtime status:', statusError);
        }

        // Show toast notifications safely
        if (showToasts && toastReady) {
          try {
            const message = getUpdateMessage(table, payload);
            if (message) {
              toast({
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
        console.log('🎯 Realtime initialized successfully');
      } catch (initError) {
        console.error(`Realtime initialization failed (attempt ${attempt}):`, initError);
        
        // Retry up to 3 times with exponential backoff
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`🔄 Retrying realtime init in ${delay}ms...`);
          setTimeout(() => {
            if (mounted) initWithRetry(attempt + 1);
          }, delay);
        } else {
          console.error('🚫 Realtime initialization failed after 3 attempts');
          setState(prev => ({ ...prev, usePollingFallback: true }));
        }
      }
    };

    initWithRetry();

    // Safe auth listener
    let authListener: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(() => {
        if (!mounted) return;
        
        console.log('🔐 Safe auth state changed - reinitializing realtime');
        try {
          cleanupRealtime();
          initTalentXcelRealtime(onUpdateCallback);
        } catch (error) {
          console.error('Auth state change reinit failed:', error);
        }
      });
      authListener = data;
    } catch (error) {
      console.error('Auth listener setup failed:', error);
    }

    // Safe online handler
    const onlineHandler = () => {
      if (!mounted) return;
      
      console.log('🌐 Safe network online - reinitializing realtime');
      try {
        cleanupRealtime();
        initTalentXcelRealtime(onUpdateCallback);
      } catch (error) {
        console.error('Online handler reinit failed:', error);
      }
    };

    window.addEventListener('online', onlineHandler);

    // Safe status check interval
    const statusInterval = setInterval(() => {
      if (!mounted) return;
      
      try {
        const status = realtimeManager.getStatus();
        const connectedChannels = Object.values(status).filter(s => s === 'SUBSCRIBED').length;
        
        setState(prev => ({
          ...prev,
          connectionStatus: status,
          isConnected: connectedChannels > 0
        }));
        
        // Enable polling fallback after delay if realtime isn't working
        if (connectedChannels === 0 && !state.usePollingFallback) {
          setTimeout(() => {
            if (!mounted) return;
            
            try {
              const currentStatus = realtimeManager.getStatus();
              const currentConnected = Object.values(currentStatus).filter(s => s === 'SUBSCRIBED').length;
              if (currentConnected === 0) {
                console.log('🔄 Safe realtime not working, enabling polling fallback...');
                setState(prev => ({ ...prev, usePollingFallback: true }));
                
                if (showToasts && toastReady) {
                  toast({
                    title: "Connection Status",
                    description: "Using polling for updates while realtime reconnects...",
                    duration: 3000,
                  });
                }
              }
            } catch (error) {
              console.error('Polling fallback check failed:', error);
            }
          }, 10000);
        }
      } catch (error) {
        console.error('Status interval error:', error);
      }
    }, 3000);

    // Cleanup function
    return () => {
      mounted = false;
      console.log('🧹 Cleaning up Safe TalentXcel Realtime Provider...');
      
      try {
        clearInterval(statusInterval);
        window.removeEventListener('online', onlineHandler);
        authListener?.subscription?.unsubscribe();
        cleanupRealtime();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };
  }, [showToasts, toastReady, state.usePollingFallback]);

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
    // Return safe fallback instead of throwing error
    console.warn('useSafeRealtimeContext called outside provider, returning fallback');
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