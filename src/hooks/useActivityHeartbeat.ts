/**
 * useActivityHeartbeat.ts
 * High-performance, visibility-aware, idle-detecting presence heartbeat engine.
 * Platform: TalentXcel.in
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const HEARTBEAT_INTERVAL_MS = 60_000; // 60 seconds while active
const IDLE_TIMEOUT_MS = 300_000; // 5 minutes of inactivity transitions to idle
const HIDDEN_OFFLINE_DELAY_MS = 45_000; // 45 seconds after backgrounding before setting offline

// Global singleton flag to prevent duplicate heartbeat intervals across the app
let isHeartbeatInitialized = false;

export function useActivityHeartbeat() {
  const { user } = useAuth();
  const userId = user?.id;

  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hiddenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isIdleRef = useRef(false);
  const isTabHiddenRef = useRef(false);
  const lastHeartbeatTimeRef = useRef(0);

  useEffect(() => {
    if (!userId) {
      isHeartbeatInitialized = false;
      return;
    }

    if (isHeartbeatInitialized) {
      return;
    }
    isHeartbeatInitialized = true;

    // Send heartbeat to Supabase RPC
    const sendHeartbeat = async (isOnline: boolean) => {
      const now = Date.now();
      // Throttle rapid consecutive online heartbeats (minimum 15s apart unless changing online state)
      if (isOnline && now - lastHeartbeatTimeRef.current < 15_000) {
        return;
      }
      lastHeartbeatTimeRef.current = now;

      try {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const moduleName = currentPath.split('/')[1] || 'network';

        await supabase.rpc('record_presence_heartbeat', {
          p_is_online: isOnline,
          p_module: moduleName,
          p_page: currentPath,
          p_device_type: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'web'
        });
      } catch (err) {
        // Heartbeats should silently fail without breaking user interactions
        console.warn('[ActivityHeartbeat] Heartbeat non-fatal:', err);
      }
    };

    // Start recurring active heartbeat loop
    const startHeartbeatInterval = () => {
      stopHeartbeatInterval();
      heartbeatTimerRef.current = setInterval(() => {
        if (!isIdleRef.current && !isTabHiddenRef.current && navigator.onLine) {
          sendHeartbeat(true);
        }
      }, HEARTBEAT_INTERVAL_MS);
    };

    const stopHeartbeatInterval = () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };

    // Reset idle timer whenever user interaction is detected
    const onUserActivity = () => {
      // If user was previously idle or hidden, mark online immediately
      if (isIdleRef.current) {
        isIdleRef.current = false;
        if (!isTabHiddenRef.current && navigator.onLine) {
          sendHeartbeat(true);
          startHeartbeatInterval();
        }
      }

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = setTimeout(() => {
        isIdleRef.current = true;
        stopHeartbeatInterval();
        // Set offline when idle threshold is reached
        sendHeartbeat(false);
      }, IDLE_TIMEOUT_MS);
    };

    // Visibility-aware lifecycle handling (tabs, mobile backgrounding)
    const onVisibilityChange = () => {
      if (document.hidden) {
        isTabHiddenRef.current = true;
        stopHeartbeatInterval();

        // Give a grace period of 45s before setting presence to offline
        if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current);
        hiddenTimerRef.current = setTimeout(() => {
          if (document.hidden) {
            sendHeartbeat(false);
          }
        }, HIDDEN_OFFLINE_DELAY_MS);
      } else {
        isTabHiddenRef.current = false;
        if (hiddenTimerRef.current) {
          clearTimeout(hiddenTimerRef.current);
          hiddenTimerRef.current = null;
        }

        // Tab returned to foreground: resume tracking immediately
        isIdleRef.current = false;
        onUserActivity();
        sendHeartbeat(true);
        startHeartbeatInterval();
      }
    };

    // Network connection listeners
    const onNetworkOnline = () => {
      if (!isTabHiddenRef.current && !isIdleRef.current) {
        sendHeartbeat(true);
        startHeartbeatInterval();
      }
    };

    const onNetworkOffline = () => {
      stopHeartbeatInterval();
    };

    // Unload listener for browser close or navigation away
    const onPageUnload = () => {
      // Best-effort offline notification
      try {
        const token = supabase.auth.getSession();
        // Fast RPC beacon or update
        sendHeartbeat(false);
      } catch {}
    };

    // Initial heartbeat on mount
    sendHeartbeat(true);
    startHeartbeatInterval();
    onUserActivity();

    // Register event listeners
    const interactionEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          onUserActivity();
        }, 3000); // Throttle event handling to once every 3 seconds
      }
    };

    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, throttledActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onNetworkOnline);
    window.addEventListener('offline', onNetworkOffline);
    window.addEventListener('beforeunload', onPageUnload);
    window.addEventListener('pagehide', onPageUnload);

    return () => {
      isHeartbeatInitialized = false;
      stopHeartbeatInterval();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);

      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, throttledActivity);
      });
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onNetworkOnline);
      window.removeEventListener('offline', onNetworkOffline);
      window.removeEventListener('beforeunload', onPageUnload);
      window.removeEventListener('pagehide', onPageUnload);
    };
  }, [userId]);
}
