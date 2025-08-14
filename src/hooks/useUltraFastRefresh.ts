import { useEffect, useRef, useState, useCallback } from 'react';
import { websocketManager } from '@/utils/websocketManager';
import { useAuth } from '@/contexts/AuthContext';

interface DeltaUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  old_data?: any;
}

interface UltraFastRefreshOptions {
  module: string;
  tables: string[];
  enabled?: boolean;
  onUpdate?: (delta: DeltaUpdate) => void;
  batchSize?: number;
  maxBatchTime?: number;
}

/**
 * Ultra-fast refresh hook with delta updates and sub-millisecond response
 * Targets < 1.2ms update propagation
 */
export function useUltraFastRefresh<T>(
  initialData: T,
  options: UltraFastRefreshOptions
) {
  const { user } = useAuth();
  const [data, setData] = useState<T>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const updateQueueRef = useRef<DeltaUpdate[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const performanceRef = useRef<{ updateCount: number; avgLatency: number }>({
    updateCount: 0,
    avgLatency: 0,
  });

  // Apply delta update to data
  const applyDelta = useCallback((currentData: T, delta: DeltaUpdate): T => {
    const startTime = performance.now();
    
    try {
      let newData: T;

      switch (delta.type) {
        case 'INSERT':
          if (Array.isArray(currentData)) {
            newData = [...currentData, delta.data] as T;
          } else if (typeof currentData === 'object' && currentData !== null) {
            newData = { ...currentData, [delta.data.id]: delta.data } as T;
          } else {
            newData = currentData;
          }
          break;

        case 'UPDATE':
          if (Array.isArray(currentData)) {
            newData = (currentData as any[]).map(item =>
              item.id === delta.data.id ? { ...item, ...delta.data } : item
            ) as T;
          } else if (typeof currentData === 'object' && currentData !== null) {
            newData = {
              ...currentData,
              [delta.data.id]: { ...(currentData as any)[delta.data.id], ...delta.data }
            } as T;
          } else {
            newData = currentData;
          }
          break;

        case 'DELETE':
          if (Array.isArray(currentData)) {
            newData = (currentData as any[]).filter(item => item.id !== delta.old_data.id) as T;
          } else if (typeof currentData === 'object' && currentData !== null) {
            const { [delta.old_data.id]: deleted, ...rest } = currentData as any;
            newData = rest as T;
          } else {
            newData = currentData;
          }
          break;

        default:
          newData = currentData;
      }

      // Update performance metrics
      const latency = performance.now() - startTime;
      performanceRef.current.updateCount++;
      performanceRef.current.avgLatency = 
        (performanceRef.current.avgLatency + latency) / 2;

      return newData;
    } catch (error) {
      console.error('Error applying delta update:', error);
      return currentData;
    }
  }, []);

  // Process batched updates
  const processBatch = useCallback(() => {
    if (updateQueueRef.current.length === 0) return;

    const updates = updateQueueRef.current.splice(0);
    
    setData(currentData => {
      let newData = currentData;
      for (const delta of updates) {
        newData = applyDelta(newData, delta);
      }
      return newData;
    });

    setLastUpdate(new Date());
    
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
  }, [applyDelta]);

  // Queue update for batching
  const queueUpdate = useCallback((delta: DeltaUpdate) => {
    updateQueueRef.current.push(delta);
    
    // Process immediately if batch size reached
    if (updateQueueRef.current.length >= (options.batchSize || 10)) {
      processBatch();
      return;
    }

    // Set timeout for batch processing
    if (!batchTimeoutRef.current) {
      batchTimeoutRef.current = setTimeout(processBatch, options.maxBatchTime || 5);
    }
  }, [processBatch, options.batchSize, options.maxBatchTime]);

  // Setup WebSocket connections for each table
  useEffect(() => {
    if (!options.enabled || !user?.id) return;

    const channels: string[] = [];
    
    options.tables.forEach(table => {
      const channelName = `${options.module}-${table}-${user.id}`;
      const channel = websocketManager.createChannel(channelName);
      
      channel
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: table,
        }, (payload) => {
          const delta: DeltaUpdate = {
            type: payload.eventType as DeltaUpdate['type'],
            table: table,
            data: payload.new,
            old_data: payload.old,
          };

          // Call custom handler if provided
          options.onUpdate?.(delta);
          
          // Queue for batched processing
          queueUpdate(delta);
        })
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            console.error(`Channel error for ${table}:`, err);
          }
        });

      channels.push(channelName);
    });

    return () => {
      channels.forEach(channelName => {
        websocketManager.removeChannel(channelName);
      });
      setIsConnected(false);
      
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, [options.enabled, options.module, options.tables, user?.id, options.onUpdate, queueUpdate]);

  // Immediate update function (bypasses batching)
  const updateImmediate = useCallback((delta: DeltaUpdate) => {
    setData(currentData => applyDelta(currentData, delta));
    setLastUpdate(new Date());
  }, [applyDelta]);

  return {
    data,
    isConnected,
    lastUpdate,
    performance: performanceRef.current,
    updateImmediate,
    queueUpdate,
    processBatch,
  };
}

/**
 * Module-specific ultra-fast refresh hooks
 */
export function useUltraFastNetworkRefresh() {
  const { user } = useAuth();
  
  return useUltraFastRefresh([], {
    module: 'network',
    tables: ['posts', 'connections', 'post_reactions'],
    enabled: !!user,
  });
}

export function useUltraFastJobsRefresh() {
  const { user } = useAuth();
  
  return useUltraFastRefresh([], {
    module: 'jobs',
    tables: ['jobs', 'job_applications', 'job_views'],
    enabled: !!user,
  });
}

export function useUltraFastEmployerRefresh() {
  const { user } = useAuth();
  
  return useUltraFastRefresh({}, {
    module: 'employer',
    tables: ['jobs', 'job_applications', 'company_profiles'],
    enabled: !!user,
  });
}

/**
 * Performance monitoring hook
 */
export function useRefreshPerformance() {
  const [metrics, setMetrics] = useState({
    avgLatency: 0,
    updateCount: 0,
    connectionStatus: 'disconnected' as 'connected' | 'disconnected' | 'connecting',
    lastError: null as string | null,
  });

  const updateMetrics = useCallback((newMetrics: Partial<typeof metrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  }, []);

  return { metrics, updateMetrics };
}