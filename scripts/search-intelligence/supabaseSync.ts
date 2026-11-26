// scripts/search-intelligence/supabaseSync.ts
// Rate-limited, batched, retry-safe server-side Supabase client & sync helper.
// Respects storage quota caps and uses TALENTXCEL_SERVICE_ROLE_KEY strictly on server/CLI.

import fs from 'node:fs';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function loadEnvLocal(rootDir = process.cwd()): void {
  const envPath = path.join(rootDir, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

export function getServerSupabaseClient(): SupabaseClient {
  loadEnvLocal();
  const url = process.env.TX_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing TX_SUPABASE_URL or TALENTXCEL_SERVICE_ROLE_KEY in environment / .env.local.');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export interface BatchUpsertResult {
  table: string;
  attempted: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

export async function batchUpsertSupabase<T extends Record<string, unknown>>(
  client: SupabaseClient,
  table: string,
  rows: T[],
  onConflict: string,
  options: { batchSize?: number; delayMs?: number; maxRetries?: number } = {}
): Promise<BatchUpsertResult> {
  const batchSize = options.batchSize ?? 250;
  const delayMs = options.delayMs ?? 60;
  const maxRetries = options.maxRetries ?? 3;

  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    let done = false;
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      const { error } = await client.from(table).upsert(chunk, { onConflict });
      if (!error) {
        succeeded += chunk.length;
        done = true;
        break;
      }
      if (attempt === maxRetries) {
        failed += chunk.length;
        errors.push(`batch ${i}-${i + chunk.length}: ${error.message}`);
      } else {
        await sleep(attempt * 300 + Math.floor(Math.random() * 150));
      }
    }
    if (done && i + batchSize < rows.length && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return { table, attempted: rows.length, succeeded, failed, errors };
}
