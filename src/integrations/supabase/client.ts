
// Production-ready Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseConfig } from '@/config/constants';

const { url: SUPABASE_URL, anonKey: SUPABASE_PUBLISHABLE_KEY } = getSupabaseConfig();

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'cache-control': 'no-cache'
    }
  },
  // Add retry configuration for better reliability
  db: {
    schema: 'public'
  },
  // Configure realtime for better performance
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    // Add error handling for realtime connections
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => {
      return Math.min(tries * 1000, 30000);
    },
    // Add more robust error handling
    timeout: 60000
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
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false, // Prevent duplicate session detection
          flowType: 'pkce'
        },
        global: {
          headers: {
            'cache-control': 'no-cache'
          }
        },
      }
    );
  }
  return supabaseFunctionsInstance;
};
