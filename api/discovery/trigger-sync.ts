/**
 * api/discovery/trigger-sync.ts
 * POST /api/discovery/trigger-sync
 *
 * Triggers a live Google Search Console data pull for sc-domain:talentxcel.in
 * and upserts results into udx_demand_entities + tx_gsc_queries.
 *
 * SERVER-SIDE ONLY — uses TALENTXCEL_SERVICE_ROLE_KEY + Google Service Account.
 * Credentials are never exposed to the browser.
 *
 * Runtime: Node.js (required for crypto.createSign used in JWT minting)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { runtime: 'nodejs20.x' };

const TX_SUPABASE_URL = process.env.TX_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const ROW_LIMIT = 25000;
const STABILIZATION_DAYS = 3;
const GSC_PROPERTY = 'https://talentxcel.in/';
const TENANT_ID = 'talentxcel';

interface GSCRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// ── JWT / token helpers ────────────────────────────────────────────────────

async function getServiceAccountToken(email: string, privateKey: string): Promise<string> {
  const { createSign } = await import('crypto');
  const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
  const now = Math.floor(Date.now() / 1000);

  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: email, scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  })).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(privateKey.replace(/\\n/g, '\n'), 'base64url');
  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  const d = await res.json() as { access_token: string };
  return d.access_token;
}

async function getAccessToken(body?: any): Promise<string> {
  let email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key   = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (body?.serviceAccountJson) {
    try {
      const sa = JSON.parse(body.serviceAccountJson);
      email = sa.client_email;
      key = sa.private_key;
    } catch (_) {}
  } else if (body?.serviceAccountEmail && body?.serviceAccountPrivateKey) {
    email = body.serviceAccountEmail;
    key = body.serviceAccountPrivateKey;
  }

  // Fallback: local file (dev only)
  if (!email || !key) {
    try {
      const fs   = await import('fs');
      const path = await import('path');
      const fp   = path.resolve(process.cwd(), 'gsc-service-account.json');
      if (fs.existsSync(fp)) {
        const sa = JSON.parse(fs.readFileSync(fp, 'utf8'));
        email = sa.client_email;
        key = sa.private_key;
      }
    } catch (_) {}
  }

  if (email && key) return getServiceAccountToken(email, key);

  throw new Error('No Google credentials configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY or provide in request body.');
}

// ── GSC fetch helpers ──────────────────────────────────────────────────────

async function fetchAllRows(
  token: string, siteUrl: string,
  startDate: string, endDate: string,
  dimensions: string[]
): Promise<GSCRow[]> {
  const rows: GSCRow[] = [];
  let startRow = 0;
  const encoded = encodeURIComponent(siteUrl);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/searchAnalytics/query`;

  while (true) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit: ROW_LIMIT, startRow, dataState: 'final' }),
    });
    if (!res.ok) throw new Error(`GSC API ${res.status}: ${await res.text()}`);
    const data = await res.json() as { rows?: GSCRow[] };
    const batch = data.rows ?? [];
    rows.push(...batch);
    if (batch.length < ROW_LIMIT) break;
    startRow += ROW_LIMIT;
  }
  return rows;
}

function normalizeQuery(q: string): string {
  return q.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Supabase upsert helper ─────────────────────────────────────────────────

async function supabaseUpsert(table: string, payload: object, onConflict: string, serviceKey: string) {
  const res = await fetch(`${TX_SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Prefer': `resolution=merge-duplicates,return=minimal`,
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify(payload),
  });
  return res;
}

// ── Main handler ───────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const runId = `gsc_sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const syncStartedAt = new Date().toISOString();
  let rowsInserted = 0;
  const errors: string[] = [];

  try {
    const token = await getAccessToken(req.body);

    // Auto-detect exact property format
    let siteUrl = GSC_PROPERTY;
    try {
      const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sitesRes.ok) {
        const sitesData = await sitesRes.json() as { siteEntry?: { siteUrl: string }[] };
        const matched = (sitesData.siteEntry ?? []).find(
          (s) => s.siteUrl === siteUrl || s.siteUrl.includes('talentxcel.in')
        );
        if (matched) siteUrl = matched.siteUrl;
      }
    } catch (_) {}

    // Date window: last 16 days, stabilized by 3 days
    const endDt = new Date();
    endDt.setDate(endDt.getDate() - STABILIZATION_DAYS);
    const endDate = endDt.toISOString().slice(0, 10);
    const startDt = new Date(endDt);
    startDt.setDate(startDt.getDate() - 16);
    const startDate = startDt.toISOString().slice(0, 10);

    const dimensionSets = [
      { dimensions: ['query', 'page'],    label: 'query_page' },
      { dimensions: ['query', 'country'], label: 'query_country' },
      { dimensions: ['query', 'device'],  label: 'query_device' },
    ];

    for (const { dimensions, label } of dimensionSets) {
      try {
        const rows = await fetchAllRows(token, siteUrl, startDate, endDate, dimensions);
        for (const row of rows) {
          const query = row.keys[0] ?? '';
          const normalizedQuery = normalizeQuery(query);
          if (!normalizedQuery) continue;

          const page    = dimensions.includes('page')    ? (row.keys[dimensions.indexOf('page')]    ?? '') : '';
          const country = dimensions.includes('country') ? (row.keys[dimensions.indexOf('country')] ?? 'unknown') : 'unknown';
          const device  = dimensions.includes('device')  ? (row.keys[dimensions.indexOf('device')]  ?? 'ALL') : 'ALL';

          // Upsert into udx_demand_entities
          await supabaseUpsert('udx_demand_entities', {
            tenant_id: TENANT_ID,
            query,
            normalized_query: normalizedQuery,
            country,
            device,
            impressions: row.impressions ?? 0,
            clicks: row.clicks ?? 0,
            ctr: row.ctr ?? 0,
            avg_position: row.position ?? 0,
            data_source: 'gsc_api',
            last_gsc_sync_at: syncStartedAt,
            last_updated_at: syncStartedAt,
          }, 'tenant_id,normalized_query,country', serviceKey);

          // Backward-compat: also write to tx_gsc_queries
          if (query) {
            await supabaseUpsert('tx_gsc_queries', {
              query,
              clicks: row.clicks ?? 0,
              impressions: row.impressions ?? 0,
              ctr: row.ctr ?? 0,
              position: row.position ?? 0,
              country,
              device,
              updated_at: syncStartedAt,
            }, 'query,country', serviceKey);
          }

          rowsInserted++;
        }
      } catch (dimErr: any) {
        errors.push(`[${label}] ${dimErr.message}`);
      }
    }

    // Write audit log
    await supabaseUpsert('udx_audit_log', {
      tenant_id: TENANT_ID,
      log_type: 'EXECUTION',
      actor: 'GSC_CONNECTOR',
      action_taken: 'gsc_sync_complete',
      policy_class: 'AUTO',
      outcome: errors.length === 0 ? 'AUTO_EXECUTED' : 'PARTIAL',
      metadata: { runId, rowsInserted, errorCount: errors.length, siteUrl, dateRange: `${startDate}→${endDate}` },
    }, '', serviceKey);

    return res.status(200).json({
      success: true,
      result: { rowsInserted, rowsUpdated: 0, errors, runId, siteUrl, dateRange: `${startDate} → ${endDate}` },
      message: `Live GSC sync complete: ${rowsInserted} rows ingested for ${siteUrl}`,
    });

  } catch (err: any) {
    // Write failure audit
    try {
      await supabaseUpsert('udx_audit_log', {
        tenant_id: TENANT_ID,
        log_type: 'EXECUTION',
        actor: 'GSC_CONNECTOR',
        action_taken: 'gsc_sync_fatal',
        policy_class: 'AUTO',
        outcome: 'FORBIDDEN_BLOCKED',
        metadata: { runId, error: err.message },
      }, '', serviceKey);
    } catch (_) {}

    return res.status(500).json({ success: false, error: err.message, runId });
  }
}
