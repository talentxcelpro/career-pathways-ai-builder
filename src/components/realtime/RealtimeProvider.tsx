import React, { createContext, useContext, useEffect, useState } from 'react';
import { initTalentXcelRealtime, cleanupRealtime, realtimeManager, WatchedTable, RealtimePayload } from '@/lib/realtimeManager';
import { useToast } from '@/components/ui/use-toast';

interface RealtimeContextType {
  isConnected: boolean;
  lastUpdate: { table: WatchedTable; payload: RealtimePayload } | null;
  connectionStatus: Record<string, string>;
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
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{ table: WatchedTable; payload: RealtimePayload } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    console.log('🎯 TalentXcel Realtime Provider initializing...');

    // Initialize realtime with global callback
    initTalentXcelRealtime((table, payload) => {
      console.log(`🔄 Global realtime update - ${table}:`, payload);
      
      setLastUpdate({ table, payload });
      setIsConnected(true);
      
      // Update connection status
      setConnectionStatus(realtimeManager.getStatus());

      // Show toast notifications for updates (optional)
      if (showToasts) {
        const message = getUpdateMessage(table, payload);
        if (message) {
          toast({
            title: "Real-time Update",
            description: message,
            duration: 3000,
          });
        }
      }
    });

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      setConnectionStatus(realtimeManager.getStatus());
      setIsConnected(realtimeManager.initialized);
    }, 5000);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up TalentXcel Realtime Provider...');
      clearInterval(statusInterval);
      cleanupRealtime();
      setIsConnected(false);
    };
  }, [showToasts, toast]);

  const contextValue: RealtimeContextType = {
    isConnected,
    lastUpdate,
    connectionStatus,
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
    case 'jobs':
      return eventType === 'INSERT' ? 'New job posted!' : 
             eventType === 'UPDATE' ? 'Job updated!' : 
             'Job removed';
             
    case 'posts':
      return eventType === 'INSERT' ? 'New post in your network!' :
             eventType === 'UPDATE' ? 'Post updated!' :
             'Post removed';
             
    case 'connections':
      return eventType === 'INSERT' ? 'New connection request!' :
             eventType === 'UPDATE' ? 'Connection updated!' :
             null;
             
    case 'messages':
      return eventType === 'INSERT' ? 'New message received!' : null;
      
    case 'colleges':
      return eventType === 'INSERT' ? 'New college added!' :
             eventType === 'UPDATE' ? 'College information updated!' :
             null;
             
    case 'ai_career_recommendations':
      return eventType === 'INSERT' ? 'New career recommendation!' : null;
      
    case 'job_applications':
      return eventType === 'INSERT' ? 'Application submitted!' :
             eventType === 'UPDATE' ? 'Application status updated!' :
             null;
             
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