/**
 * Connection Status Monitor
 * Auto-reconnection with exponential backoff
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface ConnectionState {
  status: 'online' | 'offline' | 'slow' | 'reconnecting';
  latency: number;
  lastCheck: number;
  reconnectAttempts: number;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;

export function useConnectionStatus() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'online',
    latency: 0,
    lastCheck: Date.now(),
    reconnectAttempts: 0,
  });

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setConnectionState(prev => ({
        ...prev,
        status: 'online',
        reconnectAttempts: 0,
      }));
      toast.success('Back online', {
        description: 'Your connection has been restored',
      });
    };

    const handleOffline = () => {
      setConnectionState(prev => ({
        ...prev,
        status: 'offline',
      }));
      toast.error('Connection lost', {
        description: 'Attempting to reconnect...',
      });
      attemptReconnect();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Health check with latency monitoring
  const checkHealth = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });

      const latency = performance.now() - startTime;

      setConnectionState(prev => ({
        ...prev,
        status: latency > 1000 ? 'slow' : 'online',
        latency: Math.round(latency),
        lastCheck: Date.now(),
        reconnectAttempts: 0,
      }));

      // Warn about slow connection
      if (latency > 2000 && connectionState.status !== 'slow') {
        toast.warning('Slow connection detected', {
          description: 'Some features may be delayed',
        });
      }
    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        status: 'offline',
      }));
      attemptReconnect();
    }
  }, [connectionState.status]);

  // Auto-reconnect with exponential backoff
  const attemptReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setConnectionState(prev => {
      const newAttempts = prev.reconnectAttempts + 1;

      if (newAttempts > MAX_RECONNECT_ATTEMPTS) {
        toast.error('Connection failed', {
          description: 'Unable to reconnect. Please check your internet connection.',
        });
        return {
          ...prev,
          status: 'offline',
        };
      }

      const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, newAttempts - 1);

      reconnectTimeoutRef.current = setTimeout(() => {
        checkHealth();
      }, delay);

      return {
        ...prev,
        status: 'reconnecting',
        reconnectAttempts: newAttempts,
      };
    });
  }, [checkHealth]);

  // Start periodic health checks
  useEffect(() => {
    checkHealth();

    healthCheckIntervalRef.current = setInterval(checkHealth, 30000); // Every 30 seconds

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [checkHealth]);

  const forceReconnect = useCallback(() => {
    setConnectionState(prev => ({
      ...prev,
      reconnectAttempts: 0,
    }));
    checkHealth();
  }, [checkHealth]);

  return {
    ...connectionState,
    isHealthy: connectionState.status === 'online',
    forceReconnect,
  };
}
