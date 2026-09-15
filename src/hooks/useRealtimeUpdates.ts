import { useEffect, useCallback, useRef } from 'react';
import { WatchedTable, RealtimePayload } from '@/lib/realtimeManager';

/**
 * Hook to listen for real-time updates on specific tables
 */
export function useRealtimeUpdates(
  tables: WatchedTable | WatchedTable[],
  callback: (table: WatchedTable, payload: RealtimePayload) => void,
  dependencies: any[] = []
) {
  const callbackRef = useRef(callback);
  
  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, dependencies);

  const memoizedCallback = useCallback((event: CustomEvent) => {
    const { detail } = event;
    const table = detail.table as WatchedTable;
    callbackRef.current(table, detail);
  }, []);

  useEffect(() => {
    const tablesToListen = Array.isArray(tables) ? tables : [tables];
    
    console.log(`🎯 Setting up realtime listeners for:`, tablesToListen);

    const eventListeners: Array<{ eventName: string; handler: (event: CustomEvent) => void }> = [];

    tablesToListen.forEach((table) => {
      const eventName = `${table}Update`;
      
      const handler = (event: Event) => {
        memoizedCallback(event as CustomEvent);
      };
      
      window.addEventListener(eventName, handler);
      eventListeners.push({ eventName, handler });
      
      console.log(`👂 Listening for ${eventName} events`);
    });

    // Cleanup function
    return () => {
      eventListeners.forEach(({ eventName, handler }) => {
        window.removeEventListener(eventName, handler);
        console.log(`🔇 Stopped listening for ${eventName} events`);
      });
    };
  }, [tables, memoizedCallback]);
}

/**
 * Hook specifically for connections updates
 */
export function useConnectionsRealtime(callback: (payload: RealtimePayload) => void) {
  useRealtimeUpdates('connections', (_table, payload) => callback(payload));
}

/**
 * Hook specifically for messages updates
 */
export function useMessagesRealtime(callback: (payload: RealtimePayload) => void) {
  useRealtimeUpdates('messages', (_table, payload) => callback(payload));
}

/**
 * Hook specifically for user activities
 */
export function useActivitiesRealtime(callback: (payload: RealtimePayload) => void) {
  useRealtimeUpdates('user_activities', (_table, payload) => callback(payload));
}

/**
 * Hook for TXC transactions updates
 */
export function useTXCRealtime(callback: (payload: RealtimePayload) => void) {
  useRealtimeUpdates('txc_transactions', (_table, payload) => callback(payload));
}

/**
 * Hook for applications updates
 */
export function useApplicationsRealtime(callback: (payload: RealtimePayload) => void) {
  useRealtimeUpdates('job_applications', (_table, payload) => callback(payload));
}