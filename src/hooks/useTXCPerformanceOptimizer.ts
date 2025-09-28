import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface TXCPerformanceMetrics {
  operationDuration: number;
  cacheHitRate: number;
  errorRate: number;
  averageResponseTime: number;
}

class TXCCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 30000; // 30 seconds

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const useTXCPerformanceOptimizer = () => {
  const [metrics, setMetrics] = useState<TXCPerformanceMetrics>({
    operationDuration: 0,
    cacheHitRate: 0,
    errorRate: 0,
    averageResponseTime: 0
  });

  const cache = useRef(new TXCCache()).current;
  const operationTimes = useRef<number[]>([]);
  const errorCount = useRef(0);
  const totalOperations = useRef(0);
  const cacheHits = useRef(0);
  const cacheRequests = useRef(0);

  const measureOperation = useCallback(<T>(
    operation: () => Promise<T>,
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<T> => {
    return new Promise(async (resolve, reject) => {
      const startTime = performance.now();
      
      // Check cache first
      if (cacheKey) {
        cacheRequests.current++;
        const cached = cache.get<T>(cacheKey);
        if (cached) {
          cacheHits.current++;
          const endTime = performance.now();
          operationTimes.current.push(endTime - startTime);
          updateMetrics();
          resolve(cached);
          return;
        }
      }

      try {
        totalOperations.current++;
        const result = await operation();
        const endTime = performance.now();
        
        operationTimes.current.push(endTime - startTime);
        
        // Cache successful results
        if (cacheKey && result) {
          cache.set(cacheKey, result, cacheTTL);
        }
        
        updateMetrics();
        resolve(result);
      } catch (error) {
        errorCount.current++;
        const endTime = performance.now();
        operationTimes.current.push(endTime - startTime);
        updateMetrics();
        reject(error);
      }
    });
  }, [cache]);

  const updateMetrics = useCallback(() => {
    const times = operationTimes.current;
    const avgResponseTime = times.length > 0 
      ? times.reduce((sum, time) => sum + time, 0) / times.length 
      : 0;
    
    const cacheHitRate = cacheRequests.current > 0 
      ? (cacheHits.current / cacheRequests.current) * 100 
      : 0;
    
    const errorRate = totalOperations.current > 0 
      ? (errorCount.current / totalOperations.current) * 100 
      : 0;

    setMetrics({
      operationDuration: times[times.length - 1] || 0,
      cacheHitRate,
      errorRate,
      averageResponseTime: avgResponseTime
    });
  }, []);

  const optimizedBalanceQuery = useCallback(async (userId: string) => {
    return measureOperation(
      async () => {
        const { data, error } = await supabase
          .from('user_txc_balances')
          .select('balance')
          .eq('user_id', userId)
          .single();
        
        if (error) throw error;
        return data?.balance || 0;
      },
      `balance_${userId}`,
      15000 // 15 second cache for balance
    );
  }, [measureOperation]);

  const optimizedTransactionQuery = useCallback(async (userId: string, limit: number = 10) => {
    return measureOperation(
      async () => {
        const { data, error } = await supabase
          .from('txc_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return data || [];
      },
      `transactions_${userId}_${limit}`,
      10000 // 10 second cache for recent transactions
    );
  }, [measureOperation]);

  const batchOperations = useCallback(async <T>(
    operations: (() => Promise<T>)[]
  ): Promise<(T | Error)[]> => {
    const startTime = performance.now();
    
    try {
      const results = await Promise.allSettled(operations.map(op => op()));
      const endTime = performance.now();
      
      operationTimes.current.push(endTime - startTime);
      updateMetrics();
      
      return results.map(result => 
        result.status === 'fulfilled' ? result.value : new Error('Operation failed')
      );
    } catch (error) {
      errorCount.current++;
      updateMetrics();
      throw error;
    }
  }, [updateMetrics]);

  const clearCache = useCallback(() => {
    cache.clear();
    cacheHits.current = 0;
    cacheRequests.current = 0;
  }, [cache]);

  const resetMetrics = useCallback(() => {
    operationTimes.current = [];
    errorCount.current = 0;
    totalOperations.current = 0;
    cacheHits.current = 0;
    cacheRequests.current = 0;
    
    setMetrics({
      operationDuration: 0,
      cacheHitRate: 0,
      errorRate: 0,
      averageResponseTime: 0
    });
  }, []);

  return {
    metrics,
    optimizedBalanceQuery,
    optimizedTransactionQuery,
    measureOperation,
    batchOperations,
    clearCache,
    resetMetrics,
    cacheSize: cache.size()
  };
};