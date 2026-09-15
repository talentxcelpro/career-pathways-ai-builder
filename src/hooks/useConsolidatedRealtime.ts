import { useEffect, useState, useCallback } from 'react';
import { consolidatedRealtimeManager } from '@/lib/consolidatedRealtimeManager';

/**
 * Hook for using the consolidated realtime manager
 */
export function useConsolidatedRealtime() {
  const [status, setStatus] = useState(() => consolidatedRealtimeManager.getStatus());

  useEffect(() => {
    const updateStatus = () => {
      setStatus(consolidatedRealtimeManager.getStatus());
    };

    // Update status every 2 seconds
    const interval = setInterval(updateStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const subscribeToTable = useCallback((table: string, callback: (payload: any) => void) => {
    return consolidatedRealtimeManager.subscribeToTable(table, callback);
  }, []);

  const subscribeToTables = useCallback((tables: string[], callback: (table: string, payload: any) => void) => {
    return consolidatedRealtimeManager.subscribeToTables(tables, callback);
  }, []);

  return {
    ...status,
    subscribeToTable,
    subscribeToTables,
    cleanup: () => consolidatedRealtimeManager.cleanupAll()
  };
}

/**
 * Hook for TXC transactions using consolidated realtime
 */
export function useConsolidatedTXCRealtime() {
  const { subscribeToTable, isAuthenticated } = useConsolidatedRealtime();
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cleanup: (() => void) | undefined;

    subscribeToTable('txc_transactions', (payload) => {
      if (payload.eventType === 'INSERT') {
        setRecentTransactions(prev => [payload.new, ...prev.slice(0, 9)]);
        setIsConnected(true);
      }
    }).then(unsubscribe => {
      cleanup = unsubscribe;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [subscribeToTable, isAuthenticated]);

  return {
    recentTransactions,
    isConnected
  };
}

/**
 * Hook for user-specific realtime data using consolidated manager
 */
export function useConsolidatedUserRealtime(userId?: string) {
  const { subscribeToTables, isAuthenticated } = useConsolidatedRealtime();
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const userTables = [
      'ai_career_recommendations',
      'ai_job_matches', 
      'job_applications',
      'notifications'
    ];

    let cleanup: (() => void) | undefined;

    subscribeToTables(userTables, (table, payload) => {
      if (payload.eventType === 'INSERT' && payload.new?.user_id === userId) {
        setActivityFeed(prev => [{
          type: table,
          data: payload.new,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 19)]);
        setIsConnected(true);
      }
    }).then(unsubscribe => {
      cleanup = unsubscribe;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [subscribeToTables, isAuthenticated, userId]);

  return {
    activityFeed,
    isConnected
  };
}