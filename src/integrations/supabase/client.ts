
// Production-ready Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseConfig } from '@/config/constants';

const { url: SUPABASE_URL, anonKey: SUPABASE_PUBLISHABLE_KEY } = getSupabaseConfig();

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

import { usageGuardFetch } from '@/utils/supabaseUsageGuard';

import { crossSubdomainStorage } from '@/lib/auth/crossSubdomainStorage';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: crossSubdomainStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    fetch: usageGuardFetch
  },
  // Add retry configuration for better reliability
  db: {
    schema: 'public'
  },
  // Configure realtime for resilient performance & prevent thundering herd
  realtime: {
    params: {
      eventsPerSecond: 2
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => {
      // Randomized exponential backoff with jitter to prevent reconnect stampedes
      const backoff = Math.min(1000 * Math.pow(1.5, Math.min(tries, 6)), 30000);
      const jitter = Math.floor(Math.random() * 1000);
      return backoff + jitter;
    },
    timeout: 30000
  }
});

// Single instance pattern to prevent multiple GoTrue clients
let supabaseFunctionsInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseFunctions = () => {
  if (!supabaseFunctionsInstance) {
    supabaseFunctionsInstance = createClient(
      SUPABASE_URL, // Use same URL to prevent multiple instances
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          storage: crossSubdomainStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false, // Prevent duplicate session detection
          flowType: 'pkce'
        },
        global: {
          fetch: usageGuardFetch
        },
      }
    );
  }
  return supabaseFunctionsInstance;
};
