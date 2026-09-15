
// Production-ready Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseConfig } from '@/config/constants';

const { url: SUPABASE_URL, anonKey: SUPABASE_PUBLISHABLE_KEY } = getSupabaseConfig();

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

// Custom storage adapter for Capacitor to ensure native session persistence
const capacitorStorage = {
  getItem: async (key: string) => {
    if (!isNative) {
      return window.localStorage.getItem(key);
    }
    const { value } = await Preferences.get({ key });
    return value;
  },
  setItem: async (key: string, value: string) => {
    if (!isNative) {
      window.localStorage.setItem(key, value);
      return;
    }
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string) => {
    if (!isNative) {
      window.localStorage.removeItem(key);
      return;
    }
    await Preferences.remove({ key });
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: capacitorStorage as any,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: !isNative,
    flowType: 'pkce'
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
    // Add error handling for realtime TalentNetwork
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
          storage: capacitorStorage as any,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false, // Prevent duplicate session detection
          flowType: 'pkce'
        },
      }
    );
  }
  return supabaseFunctionsInstance;
};


