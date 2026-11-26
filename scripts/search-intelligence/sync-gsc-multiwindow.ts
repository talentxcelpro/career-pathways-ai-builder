// scripts/search-intelligence/sync-gsc-multiwindow.ts
// Phase 3 Multi-Window Google Search Console & GA4 Collector.
// Incrementally collects 7d, 28d, 90d, and 365d GSC telemetry across all verified TalentXcel properties,
// collects standalone + filtered Search Appearance (e.g., JOB_DETAILS) page/query breakdowns,
// enriches with GA4 engagement & conversion behavior, persists full data to SQLite WAL,
// and syncs bounded top high-signal snapshots to Supabase.

import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { createSign } from 'node:crypto';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { normalizeKeyword } from '../../src/lib/seo/demandIntelligence/normalizer';
import { DEFAULT_WAREHOUSE_PATH, openWarehouse } from './sqliteWarehouse';
import { batchUpsertSupabase, getServerSupabaseClient, loadEnvLocal } from './supabaseSync';

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '499367883';
const PAGE_ROW_LIMIT = 25000;
const MAX_PAGES_PER_WINDOW = 2; // Bounded cap: up to 50k rows per property per window
const WINDOWS = [7, 28, 90, 365] as const;

const ORGANIC_CONVERSION_EVENTS = [
  'application_submitted',
  'guest_apply_opened',
  'apply_cta_clicked',
  'ats_score_generated',
  'sign_up',
];

interface RawGscApiRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface Ga4LandingBehavior {
  sessions: number;
  engagedSessions: number;
  bounceRate: number;
  conversions: number;
}

function httpsJsonRequest(
  urlStr: string,
  opts: { method?: string; headers?: Record<string, string>; body?: string; timeoutMs?: number } = {}
): Promise<{ ok: boolean; status: number; data: unknown; raw: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const req = https.request(
      u,
      {
        method: opts.method || 'GET',
        headers: {
          ...(opts.headers || {}),
          Connection: 'close',
        },
        timeout: opts.timeoutMs ?? 30000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const status = res.statusCode ?? 0;
          try {
            const parsed = JSON.parse(data || '{}');
            resolve({ ok: status >= 200 && status < 300, status, data: parsed, raw: data });
          } catch {
            resolve({ ok: false, status, data: {}, raw: data.slice(0, 300) });
          }
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error(`HTTPS timeout on ${u.hostname}`)));
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

async function withGoogleRetry<T>(fn: () => Promise<T>, label: string, maxAttempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 350 * Math.pow(2, attempt - 1)));
      }
    }
  }
  throw new Error(`${label} failed after ${maxAttempts} attempts: ${(lastErr as Error)?.message || String(lastErr)}`);
}

function loadGoogleServiceAccount(): { email: string; privateKey: string } {
  loadEnvLocal();
  const saFile = path.resolve(process.cwd(), 'gsc-service-account.json');
  if (fs.existsSync(saFile)) {
    const parsed = JSON.parse(fs.readFileSync(saFile, 'utf8'));
    if (parsed.client_email && parsed.private_key) {
      return { email: parsed.client_email, privateKey: parsed.private_key };
    }
  }
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !privateKey) {
    throw new Error('Google Service Account credentials not found in gsc-service-account.json or .env.local.');
  }
  return { email, privateKey: privateKey.replace(/\\n/g, '\n') };
}

async function mintGoogleAccessToken(email: string, privateKey: string, scope: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      iss: email,
      scope,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(privateKey, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  }).toString();
  const res = await withGoogleRetry(
    () =>
      httpsJsonRequest('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': String(Buffer.byteLength(body)),
        },
        body,
      }),
    'Google OAuth token mint'
  );
  if (!res.ok) {
    throw new Error(`OAuth token error HTTP ${res.status}: ${res.raw}`);
  }
  const data = res.data as { access_token: string };
  return data.access_token;
}

function isoDateDaysAgo(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86400_000);
  return d.toISOString().slice(0, 10);
}

async function queryGscPaginated(
  accessToken: string,
  propertyUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  dimensionFilterGroups?: Array<{
    filters: Array<{ dimension: string; operator: string; expression: string }>;
  }>,
  maxPages = MAX_PAGES_PER_WINDOW
): Promise<RawGscApiRow[]> {
  const allRows: RawGscApiRow[] = [];
  for (let page = 0; page < maxPages; page += 1) {
    const startRow = page * PAGE_ROW_LIMIT;
    const payloadObj: Record<string, unknown> = {
      startDate,
      endDate,
      dimensions,
      rowLimit: PAGE_ROW_LIMIT,
      startRow,
    };
    if (dimensionFilterGroups && dimensionFilterGroups.length > 0) {
      payloadObj.dimensionFilterGroups = dimensionFilterGroups;
    }
    const payloadStr = JSON.stringify(payloadObj);
    const res = await withGoogleRetry(
      () =>
        httpsJsonRequest(
          `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Content-Length': String(Buffer.byteLength(payloadStr)),
            },
            body: payloadStr,
          }
        ),
      `GSC query ${propertyUrl} (${dimensions.join(',')})`
    );
    if (!res.ok) {
      console.warn(`[GSC] Query failed on ${propertyUrl} (${dimensions.join(',')}): HTTP ${res.status}`);
      break;
    }
    const json = res.data as { rows?: RawGscApiRow[] };
    const rows = json.rows || [];
    allRows.push(...rows);
    if (rows.length < PAGE_ROW_LIMIT) break;
  }
  return allRows;
}

async function fetchGa4Behavior(email: string, privateKey: string): Promise<Map<string, Ga4LandingBehavior>> {
  const map = new Map<string, Ga4LandingBehavior>();
  try {
    const gaClient = new BetaAnalyticsDataClient({
      credentials: { client_email: email, private_key: privateKey },
    });
    const [response] = await gaClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'landingPagePlusQueryString' }],
      metrics: [
        { name: 'sessions' },
        { name: 'engagedSessions' },
        { name: 'bounceRate' },
        { name: 'keyEvents' },
      ],
      limit: 5000,
    });
    for (const row of response.rows || []) {
      const rawPath = row.dimensionValues?.[0]?.value || '/';
      const cleanPath = rawPath.split('?')[0].replace(/\/+$/, '') || '/';
      const sessions = Number(row.metricValues?.[0]?.value || 0);
      const engagedSessions = Number(row.metricValues?.[1]?.value || 0);
      const bounceRate = Number(row.metricValues?.[2]?.value || 0);
      const conversions = Number(row.metricValues?.[3]?.value || 0);
      const prev = map.get(cleanPath);
      if (!prev) {
        map.set(cleanPath, { sessions, engagedSessions, bounceRate, conversions });
      } else {
        const totalSessions = prev.sessions + sessions;
        const weightedBounce =
          totalSessions > 0
            ? (prev.bounceRate * prev.sessions + bounceRate * sessions) / totalSessions
            : 0;
        map.set(cleanPath, {
          sessions: totalSessions,
          engagedSessions: prev.engagedSessions + engagedSessions,
          bounceRate: Number(weightedBounce.toFixed(4)),
          conversions: prev.conversions + conversions,
        });
      }
    }

    const [convResponse] = await gaClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'landingPagePlusQueryString' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Organic Search' } } },
            { filter: { fieldName: 'eventName', inListFilter: { values: ORGANIC_CONVERSION_EVENTS } } },
          ],
        },
      },
      limit: 5000,
    });
    for (const row of convResponse.rows || []) {
      const rawPath = row.dimensionValues?.[0]?.value || '/';
      const cleanPath = rawPath.split('?')[0].replace(/\/+$/, '') || '/';
      const eventCnt = Number(row.metricValues?.[0]?.value || 0);
      if (eventCnt <= 0) continue;
      const prev = map.get(cleanPath) || { sessions: 0, engagedSessions: 0, bounceRate: 0, conversions: 0 };
      map.set(cleanPath, {
        ...prev,
        conversions: prev.conversions + eventCnt,
      });
    }
  } catch (err: unknown) {
    console.warn('[GA4] Non-fatal behavior fetch warning:', (err as Error).message);
  }
  return map;
}

function extractPathFromUrl(pageUrl: string): string {
  try {
    const u = new URL(pageUrl);
    return u.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return '/';
  }
}

export async function runMultiWindowGscSync(options: { dbPath?: string; skipSupabase?: boolean } = {}) {
  const startedAt = Date.now();
  const db = openWarehouse(options.dbPath || DEFAULT_WAREHOUSE_PATH);
  const skipSupabase = options.skipSupabase ?? process.argv.includes('--skip-supabase');

  const { email, privateKey } = loadGoogleServiceAccount();
  const accessToken = await mintGoogleAccessToken(
    email,
    privateKey,
    'https://www.googleapis.com/auth/webmasters.readonly'
  );

  const sitesRes = await withGoogleRetry(
    () =>
      httpsJsonRequest('https://www.googleapis.com/webmasters/v3/sites', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    'GSC sites list'
  );
  if (!sitesRes.ok) {
    throw new Error(`Failed to list GSC sites: HTTP ${sitesRes.status}`);
  }
  const sitesJson = sitesRes.data as { siteEntry?: Array<{ siteUrl: string; permissionLevel: string }> };
  const txProperties = (sitesJson.siteEntry || [])
    .filter((s) => s.siteUrl.includes('talentxcel.in') && s.permissionLevel !== 'siteUnverifiedUser')
    .map((s) => s.siteUrl);

  const ga4Map = await fetchGa4Behavior(email, privateKey);
  const endDate = isoDateDaysAgo(3); // Finalized GSC reporting boundary (~2-3 day lag)
  const nowIso = new Date().toISOString();

  const upsertTelemetryStmt = db.prepare(`
    INSERT INTO gsc_window_telemetry (
      grain_key, property_url, window_days, captured_date, query, normalized_query,
      page_url, country, device, clicks, impressions, ctr, position,
      ga4_sessions, ga4_engaged_sessions, ga4_bounce_rate, ga4_conversions, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(grain_key) DO UPDATE SET
      captured_date = excluded.captured_date,
      clicks = excluded.clicks,
      impressions = excluded.impressions,
      ctr = excluded.ctr,
      position = excluded.position,
      ga4_sessions = excluded.ga4_sessions,
      ga4_engaged_sessions = excluded.ga4_engaged_sessions,
      ga4_bounce_rate = excluded.ga4_bounce_rate,
      ga4_conversions = excluded.ga4_conversions,
      updated_at = excluded.updated_at
  `);

  const upsertAppearanceStmt = db.prepare(`
    INSERT INTO gsc_search_appearance (
      appearance_key, property_url, window_days, search_appearance, query, page_url,
      clicks, impressions, ctr, position, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(appearance_key) DO UPDATE SET
      clicks = excluded.clicks,
      impressions = excluded.impressions,
      ctr = excluded.ctr,
      position = excluded.position,
      updated_at = excluded.updated_at
  `);

  const windowStats: Record<number, { rows: number; clicks: number; impressions: number }> = {
    7: { rows: 0, clicks: 0, impressions: 0 },
    28: { rows: 0, clicks: 0, impressions: 0 },
    90: { rows: 0, clicks: 0, impressions: 0 },
    365: { rows: 0, clicks: 0, impressions: 0 },
  };
  let appearanceSummaryRows = 0;
  let appearanceFilteredRows = 0;
  const discoveredAppearances = new Set<string>();
  let minObservedDate = '';
  let maxObservedDate = '';

  // Check actual daily date bounds on primary property (90d) to document reporting completeness
  const primaryProp = txProperties.find((p) => p === 'sc-domain:talentxcel.in') || txProperties[0];
  if (primaryProp) {
    const dailyRows = await queryGscPaginated(
      accessToken,
      primaryProp,
      isoDateDaysAgo(92),
      endDate,
      ['date'],
      undefined,
      1
    );
    const dates = dailyRows.map((r) => r.keys[0]).filter(Boolean).sort();
    if (dates.length > 0) {
      minObservedDate = dates[0];
      maxObservedDate = dates[dates.length - 1];
    }
  }

  for (const prop of txProperties) {
    for (const windowDays of WINDOWS) {
      const startDate = isoDateDaysAgo(3 + windowDays - 1);
      const rows = await queryGscPaginated(
        accessToken,
        prop,
        startDate,
        endDate,
        ['query', 'page', 'country', 'device']
      );

      if (rows.length > 0) {
        db.exec('BEGIN');
        try {
          for (const r of rows) {
            const query = r.keys[0] || '';
            const pageUrl = r.keys[1] || '';
            const country = (r.keys[2] || '').toUpperCase();
            const device = (r.keys[3] || '').toUpperCase();
            if (!query || !pageUrl) continue;

            const normQ = normalizeKeyword(query).normalizedKeyword || query.toLowerCase().trim();
            const grainKey = `${prop}|${windowDays}|${normQ}|${pageUrl}|${country}|${device}`;
            const ga = ga4Map.get(extractPathFromUrl(pageUrl));

            upsertTelemetryStmt.run(
              grainKey,
              prop,
              windowDays,
              endDate,
              query,
              normQ,
              pageUrl,
              country,
              device,
              Math.round(r.clicks || 0),
              Math.round(r.impressions || 0),
              Number((r.ctr || 0).toFixed(6)),
              Number((r.position || 0).toFixed(2)),
              ga?.sessions || 0,
              ga?.engagedSessions || 0,
              ga?.bounceRate || 0,
              ga?.conversions || 0,
              nowIso
            );

            windowStats[windowDays].rows += 1;
            windowStats[windowDays].clicks += Math.round(r.clicks || 0);
            windowStats[windowDays].impressions += Math.round(r.impressions || 0);
          }
          db.exec('COMMIT');
        } catch (err) {
          db.exec('ROLLBACK');
          throw err;
        }
      }

      // Search Appearance collection on 28d and 90d windows
      if (windowDays === 28 || windowDays === 90) {
        const saRows = await queryGscPaginated(
          accessToken,
          prop,
          startDate,
          endDate,
          ['searchAppearance'],
          undefined,
          1
        );
        if (saRows.length > 0) {
          db.exec('BEGIN');
          try {
            for (const sa of saRows) {
              const appearance = sa.keys[0] || '';
              if (!appearance) continue;
              discoveredAppearances.add(appearance);
              const key = `${prop}|${windowDays}|${appearance}|__SUMMARY__|__SUMMARY__`;
              upsertAppearanceStmt.run(
                key,
                prop,
                windowDays,
                appearance,
                '',
                '',
                Math.round(sa.clicks || 0),
                Math.round(sa.impressions || 0),
                Number((sa.ctr || 0).toFixed(6)),
                Number((sa.position || 0).toFixed(2)),
                nowIso
              );
              appearanceSummaryRows += 1;
            }
            db.exec('COMMIT');
          } catch (err) {
            db.exec('ROLLBACK');
            throw err;
          }

          // Fetch filtered page+query breakdown for each discovered searchAppearance (respecting GSC API constraint)
          for (const sa of saRows) {
            const appearance = sa.keys[0] || '';
            if (!appearance) continue;
            const filtered = await queryGscPaginated(
              accessToken,
              prop,
              startDate,
              endDate,
              ['page', 'query'],
              [{ filters: [{ dimension: 'searchAppearance', operator: 'equals', expression: appearance }] }],
              1
            );
            if (filtered.length > 0) {
              db.exec('BEGIN');
              try {
                for (const fr of filtered) {
                  const pageUrl = fr.keys[0] || '';
                  const query = fr.keys[1] || '';
                  if (!pageUrl || !query) continue;
                  const normFrQ = normalizeKeyword(query).normalizedKeyword || query.toLowerCase().trim();
                  const key = `${prop}|${windowDays}|${appearance}|${normFrQ}|${pageUrl}`;
                  upsertAppearanceStmt.run(
                    key,
                    prop,
                    windowDays,
                    appearance,
                    query,
                    pageUrl,
                    Math.round(fr.clicks || 0),
                    Math.round(fr.impressions || 0),
                    Number((fr.ctr || 0).toFixed(6)),
                    Number((fr.position || 0).toFixed(2)),
                    nowIso
                  );
                  appearanceFilteredRows += 1;
                }
                db.exec('COMMIT');
              } catch (err) {
                db.exec('ROLLBACK');
                throw err;
              }
            }
          }
        }
      }
    }
  }

  let supabaseSynced = 0;
  if (!skipSupabase) {
    const supabase = getServerSupabaseClient();
    if (supabase) {
      // Bounded sync: top 1,500 high-signal snapshots ordered by impressions DESC across windows
      const rawSnapshots = db
        .prepare(
          `SELECT grain_key, property_url, window_days, captured_date, query, normalized_query,
                  page_url, country, device, clicks, impressions, ctr, position,
                  ga4_sessions, ga4_engaged_sessions, ga4_bounce_rate, ga4_conversions, updated_at
           FROM gsc_window_telemetry
           WHERE impressions > 0
           ORDER BY impressions DESC, clicks DESC
           LIMIT 1500`
        )
        .all() as Array<{
          grain_key: string;
          property_url: string;
          window_days: number;
          captured_date: string;
          query: string;
          normalized_query: string;
          page_url: string;
          country: string;
          device: string;
          clicks: number;
          impressions: number;
          ctr: number;
          position: number;
          ga4_sessions: number;
          ga4_engaged_sessions: number;
          ga4_bounce_rate: number | null;
          ga4_conversions: number;
        }>;

      const topSnapshots = rawSnapshots.map((r) => ({
        snapshot_key: r.grain_key,
        property_url: r.property_url,
        window_days: r.window_days,
        captured_date: r.captured_date,
        query: r.query,
        normalized_query: r.normalized_query,
        page_url: r.page_url,
        country: r.country || 'GLB',
        device: r.device || 'ALL',
        search_appearance: 'NONE',
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        average_position: r.position,
        ga4_sessions: r.ga4_sessions,
        ga4_engaged_sessions: r.ga4_engaged_sessions,
        ga4_bounce_rate: r.ga4_bounce_rate,
        ga4_conversions: r.ga4_conversions,
        data_freshness_note: `window=${r.window_days}d; finalized_lag_cutoff=${r.captured_date}`,
      }));

      const res = await batchUpsertSupabase(
        supabase,
        'gsc_multi_window_snapshots',
        topSnapshots,
        'snapshot_key',
        { batchSize: 250 }
      );
      supabaseSynced = res.succeeded;
    }
  }

  const summary = {
    propertiesCount: txProperties.length,
    properties: txProperties,
    endDate,
    observedDateBounds: { minObservedDate, maxObservedDate },
    windowStats,
    appearanceSummaryRows,
    appearanceFilteredRows,
    discoveredAppearances: Array.from(discoveredAppearances),
    ga4LandingPages: ga4Map.size,
    supabaseSynced,
    durationMs: Date.now() - startedAt,
  };
  console.log(JSON.stringify(summary, null, 2));
  db.close();
  return summary;
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('sync-gsc-multiwindow.ts')) {
  runMultiWindowGscSync().catch((err) => {
    console.error('[Phase3 GSC Multi-Window Sync] Fatal error:', err);
    process.exit(1);
  });
}
