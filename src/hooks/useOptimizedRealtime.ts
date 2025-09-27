import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface OptimizedRealtimeOptions {
  throttleMs?: number;
  retryAttempts?: number;
  enableLogging?: boolean;
}

/**
 * Optimized Realtime Hook with connection pooling and throttling
 */
export function useOptimizedRealtime(options: OptimizedRealtimeOptions = {}) {
  const { throttleMs = 1000, retryAttempts = 3, enableLogging = false } = options;
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
  const throttleTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectedChannels, setConnectedChannels] = useState(0);

  const log = useCallback((message: string, ...args: any[]) => {
    if (enableLogging) console.log(`[OptimizedRealtime] ${message}`, ...args);
  }, [enableLogging]);

  const throttledUpdate = useCallback((key: string, callback: () => void) => {
    const existingTimer = throttleTimersRef.current.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      callback();
      throttleTimersRef.current.delete(key);
    }, throttleMs);

    throttleTimersRef.current.set(key, timer);
  }, [throttleMs]);

  const createOptimizedChannel = useCallback((
    channelName: string,
    config?: any
  ): RealtimeChannel => {
    // Reuse existing channel if available
    const existing = channelsRef.current.get(channelName);
    if (existing && existing.state !== 'closed') {
      log(`Reusing existing channel: ${channelName}`);
      return existing;
    }

    log(`Creating new channel: ${channelName}`);
    const channel = supabase.channel(channelName, config);
    channelsRef.current.set(channelName, channel);

    // Enhanced subscription with retry logic
    let retryCount = 0;
    const subscribe = () => {
      channel.subscribe((status, error) => {
        log(`Channel ${channelName} status: ${status}`);
        
        switch (status) {
          case 'SUBSCRIBED':
            setConnectedChannels(prev => prev + 1);
            setIsConnected(true);
            retryCount = 0;
            break;
            
          case 'CHANNEL_ERROR':
            setConnectedChannels(prev => Math.max(0, prev - 1));
            log(`Channel error for ${channelName}:`, error);
            
            if (retryCount < retryAttempts) {
              retryCount++;
              log(`Retrying channel ${channelName} (attempt ${retryCount})`);
              setTimeout(() => subscribe(), Math.min(1000 * retryCount, 5000));
            }
            break;
            
          case 'CLOSED':
            setConnectedChannels(prev => Math.max(0, prev - 1));
            channelsRef.current.delete(channelName);
            break;
        }
      });
    };

    subscribe();
    return channel;
  }, [log, retryAttempts]);

  const subscribeToTable = useCallback((
    table: string,
    event: string = '*',
    callback: (payload: any) => void,
    filter?: string
  ) => {
    const channelName = `optimized-${table}-${event}${filter ? `-${filter}` : ''}`;
    const channel = createOptimizedChannel(channelName);

    const config: any = { event, schema: 'public', table };
    if (filter) config.filter = filter;

    channel.on('postgres_changes', config, (payload) => {
      throttledUpdate(`${table}-${event}`, () => callback(payload));
    });

    return () => {
      const ch = channelsRef.current.get(channelName);
      if (ch) {
        supabase.removeChannel(ch);
        channelsRef.current.delete(channelName);
        setConnectedChannels(prev => Math.max(0, prev - 1));
      }
    };
  }, [createOptimizedChannel, throttledUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      channelsRef.current.forEach((channel, name) => {
        log(`Cleaning up channel: ${name}`);
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
      
      throttleTimersRef.current.forEach(timer => clearTimeout(timer));
      throttleTimersRef.current.clear();
    };
  }, [log]);

  // Update connection status
  useEffect(() => {
    setIsConnected(connectedChannels > 0);
  }, [connectedChannels]);

  return {
    isConnected,
    connectedChannels,
    subscribeToTable,
    getChannelStatus: () => ({
      total: channelsRef.current.size,
      connected: connectedChannels
    })
  };
}

/**
 * Optimized TXC Realtime Hook with fixed connection handling
 */
export function useOptimizedTXCRealtime() {
  const { subscribeToTable, isConnected } = useOptimizedRealtime({
    throttleMs: 500,
    enableLogging: true
  });
  
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeTxc = subscribeToTable(
      'txc_transactions',
      'INSERT',
      (payload) => {
        setRecentTransactions(prev => [payload.new, ...prev.slice(0, 9)]);
      }
    );

    return () => {
      unsubscribeTxc();
    };
  }, [subscribeToTable]);

  return {
    recentTransactions,
    isConnected
  };
}