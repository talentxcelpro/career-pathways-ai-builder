// src/services/email/emailDb.ts
/**
 * Shared Supabase Database Client for Email Infrastructure
 * Automatically selects the service_role admin client when running server-side (Node.js/Vercel)
 * to bypass RLS restrictions and ensure seamless database outbox operations.
 * Completely self-contained to eliminate bundler path-alias or browser-dependency crashes.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

let cachedClient: SupabaseClient | null = null;

export function getEmailDbClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url =
    (typeof process !== 'undefined' && (process.env?.TX_SUPABASE_URL || process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
    DEFAULT_URL;

  const key =
    (typeof process !== 'undefined' &&
      (process.env?.TALENTXCEL_SERVICE_ROLE_KEY ||
        process.env?.SUPABASE_SERVICE_ROLE_KEY ||
        process.env?.VITE_SUPABASE_ANON_KEY ||
        process.env?.SUPABASE_ANON_KEY)) ||
    DEFAULT_ANON_KEY;

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    return cachedClient;
  } catch (err: any) {
    console.error('❌ Failed to initialize Supabase client in emailDb:', err?.message);
    cachedClient = createClient(DEFAULT_URL, DEFAULT_ANON_KEY, {
      auth: { persistSession: false },
    });
    return cachedClient;
  }
}

export const emailDb = {
  from: (table: string) => getEmailDbClient().from(table),
  rpc: (fn: string, args?: any) => (getEmailDbClient() as any).rpc(fn, args),
};
