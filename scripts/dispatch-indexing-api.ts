// scripts/dispatch-indexing-api.ts
// Production Google Indexing API Outbox Dispatcher
// Consumes strictly JobPosting detail URLs from Supabase `indexing_outbox` table,
// enforcing Google's 200 URL/day quota and zero-hub invariant.

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import * as crypto from 'crypto';
import * as https from 'https';
import { getSupabaseAdminClient } from './ingest-ats-jobs';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  project_id: string;
}

interface OutboxItem {
  id: number;
  url: string;
  action: 'URL_UPDATED' | 'URL_DELETED';
  priority: number;
  status: string;
  attempts: number;
  last_error?: string | null;
  scheduled_at: string;
}

export interface DispatcherTelemetry {
  timestamp: string;
  queueDepth: number;
  itemsProcessed: number;
  submittedSuccess: number;
  failedCount: number;
  droppedInvalidCount: number;
  quotaHit: boolean;
  dryRun: boolean;
}

/**
 * Creates a JWT and exchanges it for a Google OAuth2 access token
 */
async function getGoogleAccessToken(serviceAccount: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const base64UrlEncode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(claimSet)}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();
  const signature = signer
    .sign(serviceAccount.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsignedToken}.${signature}`;

  return new Promise((resolveToken, rejectToken) => {
    const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req = https.request(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.access_token) {
              resolveToken(parsed.access_token);
            } else {
              rejectToken(new Error(`OAuth2 token rejection: ${JSON.stringify(parsed)}`));
            }
          } catch (e) {
            rejectToken(e);
          }
        });
      }
    );
    req.on('error', rejectToken);
    req.write(postData);
    req.end();
  });
}

/**
 * Publish URL notification to Google Indexing API
 */
function publishUrlToGoogle(
  url: string,
  token: string,
  action: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<{ status: number; data: any }> {
  return new Promise((resolveCall) => {
    const body = JSON.stringify({ url, type: action });
    const req = https.request(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolveCall({ status: res.statusCode || 200, data: JSON.parse(data || '{}') });
          } catch {
            resolveCall({ status: res.statusCode || 200, data });
          }
        });
      }
    );
    req.on('error', (err) => resolveCall({ status: 500, data: { error: err.message } }));
    req.write(body);
    req.end();
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Main Dispatcher Execution
 */
export async function runIndexingDispatcher(options: {
  batchLimit?: number;
  dryRun?: boolean;
} = {}): Promise<DispatcherTelemetry> {
  const requestedLimit = Math.min(options.batchLimit ?? 45, 190);
  const dryRun = options.dryRun ?? false;

  console.log('================================================================');
  console.log('🚀 TALENTXCEL GOOGLE INDEXING API OUTBOX DISPATCHER');
  console.log(`   Mode: ${dryRun ? 'DRY-RUN (No mutations)' : 'LIVE EXECUTION'}`);
  console.log(`   Requested Run Limit: ${requestedLimit} URLs (Per-6h Batch Target: 45)`);
  console.log('================================================================\n');

  // 1. Locate credentials
  const candidateKeys = [
    resolve(process.cwd(), 'talentxcel-indexing.json'),
    resolve(process.cwd(), 'gsc-service-account.json'),
    resolve(process.cwd(), 'gcp-key.json'),
  ];
  const keyPath = candidateKeys.find((p) => existsSync(p));
  if (!keyPath) {
    throw new Error('No valid Google Service Account JSON key found in workspace root.');
  }

  const serviceAccount: ServiceAccountKey = JSON.parse(readFileSync(keyPath, 'utf-8'));
  console.log(`✓ GCP IAM Key: ${serviceAccount.client_email}`);
  console.log(`✓ GCP Project ID: ${serviceAccount.project_id}`);

  // 2. Connect to Supabase
  const supabase = getSupabaseAdminClient();

  // 3. Rolling 24-Hour Quota Verification (Ceiling: 190 URLs/24h)
  const ROLLING_24H_HARD_CEILING = 190;
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count: recentDispatchedCount, error: countError } = await supabase
    .from('indexing_outbox')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'dispatched')
    .gte('dispatched_at', twentyFourHoursAgo);

  if (countError) {
    throw new Error(`Failed to query rolling 24h dispatches: ${countError.message}`);
  }

  const alreadyDispatched24h = recentDispatchedCount || 0;
  const remainingQuota24h = Math.max(0, ROLLING_24H_HARD_CEILING - alreadyDispatched24h);
  const effectiveBatchLimit = Math.min(requestedLimit, remainingQuota24h);

  console.log(`📊 Rolling 24-Hour Quota Status:`);
  console.log(`   - Dispatched in past 24h: ${alreadyDispatched24h} / ${ROLLING_24H_HARD_CEILING} hard ceiling`);
  console.log(`   - Remaining Quota Budget : ${remainingQuota24h} URLs`);
  console.log(`   - Effective Batch Limit  : ${effectiveBatchLimit} URLs\n`);

  if (remainingQuota24h <= 0) {
    console.warn('⚠️ ROLLING 24H QUOTA CEILING REACHED (190 URLs). Halting run to prevent GCP 429 penalties.');
    return {
      timestamp: new Date().toISOString(),
      queueDepth: 0,
      itemsProcessed: 0,
      submittedSuccess: 0,
      failedCount: 0,
      droppedInvalidCount: 0,
      quotaHit: true,
      dryRun,
    };
  }

  // 4. Generate Google OAuth2 Token
  console.log('🔑 Acquiring Google OAuth2 Bearer Access Token...');
  const accessToken = await getGoogleAccessToken(serviceAccount);
  console.log('✅ Google OAuth2 Bearer Token Acquired!\n');

  // 5. Fetch queued items (strictly ordered by priority ASC, scheduled_at ASC, id ASC)
  const { data: queuedItems, count: totalQueueDepth, error: fetchError } = await supabase
    .from('indexing_outbox')
    .select('id, url, action, priority, status, attempts, last_error, scheduled_at', { count: 'exact' })
    .eq('status', 'queued')
    .lte('scheduled_at', new Date().toISOString())
    .order('priority', { ascending: true })
    .order('scheduled_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(effectiveBatchLimit);

  if (fetchError) {
    throw new Error(`Failed to fetch indexing_outbox: ${fetchError.message}`);
  }

  const items: OutboxItem[] = (queuedItems || []) as OutboxItem[];
  console.log(`📦 Outbox Queue Depth: ${totalQueueDepth ?? 0} total queued items`);
  console.log(`📋 Selected for Dispatch: ${items.length} items (limit: ${effectiveBatchLimit})\n`);

  const telemetry: DispatcherTelemetry = {
    timestamp: new Date().toISOString(),
    queueDepth: totalQueueDepth ?? 0,
    itemsProcessed: items.length,
    submittedSuccess: 0,
    failedCount: 0,
    droppedInvalidCount: 0,
    quotaHit: false,
    dryRun,
  };

  if (items.length === 0) {
    console.log('ℹ️ No items currently queued for dispatch.');
    return telemetry;
  }

  // 5. Process Batch
  const jobDetailRegex = /^https:\/\/(?:jobs\.)?talentxcel\.in\/jobs\/[a-zA-Z0-9_-]+$/;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // INVARIANT GUARD: Zero Hubs in Google Indexing API!
    // Google Indexing API is strictly reserved for JobPosting detail URLs.
    if (!jobDetailRegex.test(item.url)) {
      console.warn(`  🚫 [DROPPED - NON-JOB URL] Item #${item.id}: ${item.url}`);
      telemetry.droppedInvalidCount++;
      if (!dryRun) {
        await supabase
          .from('indexing_outbox')
          .update({
            status: 'dropped',
            attempts: item.attempts + 1,
            last_error: 'INVARIANT VIOLATION: Google Indexing API strictly forbids CollectionPage hubs',
          })
          .eq('id', item.id);
      }
      continue;
    }

    if (dryRun) {
      console.log(`  [DRY-RUN] [${i + 1}/${items.length}] Would submit: ${item.url} (${item.action})`);
      telemetry.submittedSuccess++;
      continue;
    }

    // Live dispatch
    const res = await publishUrlToGoogle(item.url, accessToken, item.action);

    if (res.status === 200) {
      telemetry.submittedSuccess++;
      if ((i + 1) % 10 === 0 || i === 0 || i === items.length - 1) {
        const notifyTime = res.data?.urlNotificationMetadata?.latestUpdate?.notifyTime || 'OK';
        console.log(`  ✓ [${i + 1}/${items.length}] [200 OK] ${item.url} (Notified: ${notifyTime})`);
      }

      await supabase
        .from('indexing_outbox')
        .update({
          status: 'dispatched',
          dispatched_at: new Date().toISOString(),
          attempts: item.attempts + 1,
          last_error: null,
        })
        .eq('id', item.id);
    } else if (res.status === 429) {
      console.warn(`  ⚠️ [${i + 1}/${items.length}] [429 QUOTA HIT] Google Indexing API Daily Quota reached at: ${item.url}`);
      telemetry.quotaHit = true;
      telemetry.failedCount++;

      // Reschedule current item for next window
      await supabase
        .from('indexing_outbox')
        .update({
          status: 'queued',
          attempts: item.attempts,
          last_error: 'Google Indexing API 429: Daily Quota Limit Reached',
          scheduled_at: new Date(Date.now() + 12 * 3600 * 1000).toISOString(), // 12-hour backoff
        })
        .eq('id', item.id);

      // Halt execution immediately to preserve quota integrity
      break;
    } else {
      console.warn(`  ❌ [${i + 1}/${items.length}] [HTTP ${res.status}] Error: ${JSON.stringify(res.data)}`);
      telemetry.failedCount++;
      const nextAttempts = item.attempts + 1;
      const finalStatus = nextAttempts >= 3 ? 'failed' : 'queued';
      const backoffHours = nextAttempts === 1 ? 1 : nextAttempts === 2 ? 6 : 24;

      await supabase
        .from('indexing_outbox')
        .update({
          status: finalStatus,
          attempts: nextAttempts,
          last_error: `HTTP ${res.status}: ${JSON.stringify(res.data)}`,
          scheduled_at: new Date(Date.now() + backoffHours * 3600 * 1000).toISOString(),
        })
        .eq('id', item.id);
    }

    // Rate limit delay between requests (120ms)
    await sleep(120);
  }

  console.log('\n================================================================');
  console.log('🎉 DISPATCHER BATCH COMPLETE');
  console.log('================================================================');
  console.table({
    'Total Queue Depth': telemetry.queueDepth,
    'Processed In Batch': telemetry.itemsProcessed,
    'Successfully Dispatched': telemetry.submittedSuccess,
    'Failed / Backoff': telemetry.failedCount,
    'Dropped Invalid Hubs': telemetry.droppedInvalidCount,
    'Daily Quota Hit': telemetry.quotaHit ? 'YES (429)' : 'NO',
  });

  return telemetry;
}

// Direct invocation CLI handler
if (process.argv[1]?.includes('dispatch-indexing-api')) {
  const isDryRun = process.argv.includes('--dry-run');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 45;

  runIndexingDispatcher({ batchLimit: limit, dryRun: isDryRun }).catch((err) => {
    console.error('Fatal Dispatcher Error:', err);
    process.exit(1);
  });
}
