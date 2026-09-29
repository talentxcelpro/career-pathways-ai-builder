// src/services/email/emailDb.ts
/**
 * Shared Supabase Database Client for Email Infrastructure
 * Automatically selects the service_role admin client when running server-side (Node.js/Vercel)
 * to bypass RLS restrictions and ensure seamless database outbox operations.
 * Falls back to the standard client for browser runtimes.
 */

import { supabase as defaultClient } from '@/integrations/supabase/client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getEmailDbClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const isServer = typeof window === 'undefined';
  const serviceKey = isServer
    ? (process.env?.TALENTXCEL_SERVICE_ROLE_KEY || process.env?.SUPABASE_SERVICE_ROLE_KEY)
    : undefined;
  const url = isServer
    ? (process.env?.TX_SUPABASE_URL || process.env?.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co')
    : undefined;

  if (isServer && serviceKey && url) {
    try {
      cachedClient = createClient(url, serviceKey, {
        auth: { persistSession: false }
      });
      return cachedClient;
    } catch {
      // Fallback to default client
    }
  }

  return defaultClient;
}

export const emailDb = {
  from: (table: string) => getEmailDbClient().from(table),
  rpc: (fn: string, args?: any) => (getEmailDbClient() as any).rpc(fn, args),
};
