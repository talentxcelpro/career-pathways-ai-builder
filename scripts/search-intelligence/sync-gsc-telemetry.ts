// scripts/search-intelligence/sync-gsc-telemetry.ts
// Phase 6 & Phase 11 Live Google Search Console & GA4 collector.
// Paginates all verified TalentXcel GSC properties via Connection: close + retry resilience,
// compares aligned 28d vs prior 28d telemetry (impressions, clicks, position) & GA4 organic funnel conversions,
// writes real verified telemetry to SQLite & Supabase, and classifies Opportunities A–M.

import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { createSign } from 'node:crypto';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { classifyKeyword } from '../../src/lib/seo/demandIntelligence/classifier';
import { detectGscOpportunities, summarizeGscMonitoring } from '../../src/lib/seo/demandIntelligence/gscOpportunityDetector';
import { scoreOpportunity } from '../../src/lib/seo/demandIntelligence/opportunityScorer';
import type { GscTelemetryRow } from '../../src/lib/seo/demandIntelligence/types';
import { DEFAULT_WAREHOUSE_PATH, openWarehouse } from './sqliteWarehouse';
import { batchUpsertSupabase, getServerSupabaseClient, loadEnvLocal } from './supabaseSync';

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '499367883';
const PAGE_ROW_LIMIT = 25000;
const MAX_PAGES_PER_PROPERTY = 4; // Safe bounded cap (up to 100k rows per property per run)

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

interface RawGscApiRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function queryGscPaginated(
  accessToken: string,
  propertyUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  maxPages = MAX_PAGES_PER_PROPERTY
): Promise<RawGscApiRow[]> {
  const allRows: RawGscApiRow[] = [];
  for (let page = 0; page < maxPages; page += 1) {
    const startRow = page * PAGE_ROW_LIMIT;
    const payloadStr = JSON.stringify({
      startDate,
      endDate,
      dimensions,
      rowLimit: PAGE_ROW_LIMIT,
      startRow,
    });
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
      `GSC query ${propertyUrl}`
    );
    if (!res.ok) {
      console.warn(`[GSC] Query failed on ${propertyUrl}: HTTP ${res.status}`);
      break;
    }
    const json = res.data as { rows?: RawGscApiRow[] };
    const rows = json.rows || [];
    allRows.push(...rows);
    if (rows.length < PAGE_ROW_LIMIT) break;
  }
  return allRows;
}

const ORGANIC_CONVERSION_EVENTS = [
  'application_submitted',
  'guest_apply_opened',
  'apply_cta_clicked',
  'ats_score_generated',
  'sign_up',
];

async function fetchGa4LandingConversions(email: string, privateKey: string): Promise<Map<string, { sessions: number; conversions: number }>> {
  const map = new Map<string, { sessions: number; conversions: number }>();
  try {
    const gaClient = new BetaAnalyticsDataClient({
      credentials: { client_email: email, private_key: privateKey },
    });
    const [response] = await gaClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'landingPagePlusQueryString' }],
      metrics: [{ name: 'sessions' }, { name: 'keyEvents' }],
      limit: 5000,
    });
    for (const row of response.rows || []) {
      const rawPath = row.dimensionValues?.[0]?.value || '/';
      const cleanPath = rawPath.split('?')[0].replace(/\/+$/, '') || '/';
      const sessions = Number(row.metricValues?.[0]?.value || 0);
      const conversions = Number(row.metricValues?.[1]?.value || 0);
      const prev = map.get(cleanPath) || { sessions: 0, conversions: 0 };
      map.set(cleanPath, {
        sessions: prev.sessions + sessions,
        conversions: prev.conversions + conversions,
      });
    }

    // Supplement with Organic Search funnel conversion events when keyEvents=0
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
      const prev = map.get(cleanPath) || { sessions: 0, conversions: 0 };
      map.set(cleanPath, {
        sessions: prev.sessions,
        conversions: prev.conversions + eventCnt,
      });
    }
  } catch (err: unknown) {
    console.warn('[GA4] Non-fatal fetch warning:', (err as Error).message);
  }
  return map;
}

export async function runGscTelemetrySync(options: { dbPath?: string; skipSupabase?: boolean } = {}) {
  const startedAt = Date.now();
  const db = openWarehouse(options.dbPath || DEFAULT_WAREHOUSE_PATH);
  const skipSupabase = options.skipSupabase ?? process.argv.includes('--skip-supabase');

  const { email, privateKey } = loadGoogleServiceAccount();
  const accessToken = await mintGoogleAccessToken(
    email,
    privateKey,
    'https://www.googleapis.com/auth/webmasters.readonly'
  );

  // Dynamically discover verified TalentXcel properties (strictly filtering out unrelated sites like chatr.*)
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

  // Aligned non-overlapping 28d windows anchored to finalized GSC lag (-3 days)
  const endDate = isoDateDaysAgo(3);
  const startDate28d = isoDateDaysAgo(30);
  const priorEnd28d = isoDateDaysAgo(31);
  const priorStart28d = isoDateDaysAgo(58);

  const ga4Map = await fetchGa4LandingConversions(email, privateKey);
  const allTelemetryRows: GscTelemetryRow[] = [];
  const propertySummaries: Array<{ propertyUrl: string; rows28d: number; impressions: number; clicks: number; incomplete?: boolean }> = [];
  const incompleteProperties: string[] = [];

  for (const prop of txProperties) {
    try {
      const rows28d = await queryGscPaginated(accessToken, prop, startDate28d, endDate, ['query', 'page', 'country', 'device']);
      const prior28dRows = await queryGscPaginated(accessToken, prop, priorStart28d, priorEnd28d, ['query'], 2);

      const priorMap = new Map<string, { impressions: number; clicks: number; wPos: number }>();
      for (const r of prior28dRows) {
        const q = (r.keys?.[0] || '').trim().toLowerCase();
        const cur = priorMap.get(q) || { impressions: 0, clicks: 0, wPos: 0 };
        cur.impressions += r.impressions;
        cur.clicks += r.clicks;
        cur.wPos += r.position * Math.max(1, r.impressions);
        priorMap.set(q, cur);
      }

      // Compute per-query impression totals across current rows28d so prior impressions distribute cleanly without grain double-counting
      const queryCurImpTotals = new Map<string, number>();
      for (const r of rows28d) {
        const qKey = (r.keys?.[0] || '').trim().toLowerCase();
        queryCurImpTotals.set(qKey, (queryCurImpTotals.get(qKey) || 0) + r.impressions);
      }

      let propImp = 0;
      let propClicks = 0;
      for (const r of rows28d) {
        const query = r.keys?.[0] || '';
        const pageUrl = r.keys?.[1] || prop;
        const country = (r.keys?.[2] || 'GLB').toUpperCase();
        const device = (r.keys?.[3] || 'ALL').toUpperCase();
        let cleanPath = '/';
        try {
          cleanPath = new URL(pageUrl).pathname.replace(/\/+$/, '') || '/';
        } catch {
          cleanPath = '/';
        }
        const ga = ga4Map.get(cleanPath) || { sessions: 0, conversions: 0 };
        const qKey = query.trim().toLowerCase();
        const prior = priorMap.get(qKey);
        const curTotal = queryCurImpTotals.get(qKey) || 0;
        const share = curTotal > 0 ? r.impressions / curTotal : 1;
        const priorShareImp = prior ? Math.round(prior.impressions * share) : 0;
        const priorShareClk = prior ? Math.round(prior.clicks * share) : 0;
        const priorAvgPos = prior && prior.impressions > 0 ? prior.wPos / prior.impressions : null;

        propImp += r.impressions;
        propClicks += r.clicks;

        allTelemetryRows.push({
          query,
          pageUrl,
          propertyUrl: prop,
          country,
          device,
          impressions: r.impressions,
          priorImpressions: priorShareImp,
          priorClicks: priorShareClk,
          priorPosition: priorAvgPos,
          clicks: r.clicks,
          ctr: r.ctr,
          position: r.position,
          ga4Sessions: ga.sessions,
          ga4Conversions: ga.conversions,
          observationDate: endDate,
        });
      }

      propertySummaries.push({
        propertyUrl: prop,
        rows28d: rows28d.length,
        impressions: propImp,
        clicks: propClicks,
      });
    } catch (propErr: unknown) {
      incompleteProperties.push(`${prop}: ${(propErr as Error).message}`);
      propertySummaries.push({ propertyUrl: prop, rows28d: 0, impressions: 0, clicks: 0, incomplete: true });
    }
  }

  // Persist into SQLite gsc_telemetry & enrich matching keywords
  const nowIso = new Date().toISOString();
  const upsertGscStmt = db.prepare(`
    INSERT INTO gsc_telemetry (
      grain_key, query, normalized_query, page_url, property_url, country, device,
      impressions, prior_impressions, clicks, ctr, position, ga4_sessions, ga4_conversions,
      observation_date, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(grain_key) DO UPDATE SET
      impressions = excluded.impressions,
      prior_impressions = excluded.prior_impressions,
      clicks = excluded.clicks,
      ctr = excluded.ctr,
      position = excluded.position,
      ga4_sessions = excluded.ga4_sessions,
      ga4_conversions = excluded.ga4_conversions,
      updated_at = excluded.updated_at
  `);

  const upsertKwStmt = db.prepare(`
    INSERT INTO keywords (
      keyword_hash, raw_keyword, normalized_keyword, dedup_key,
      source, source_type, country_code, city_slug, language,
      industry_slug, job_role_slug, skill_slug, seniority, employment_type, work_mode,
      search_intent, opportunity_type, cluster_key, recommended_destination, recommended_canonical_url,
      is_classified, classification_confidence, entities_json, relations_json,
      search_volume_status, opportunity_score, demand_confidence, score_breakdown_json,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'gsc_api', 'VERIFIED_GSC', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?, ?, 'SCORED', ?, ?)
    ON CONFLICT(keyword_hash) DO UPDATE SET
      source = 'gsc_api',
      source_type = 'VERIFIED_GSC',
      search_volume_status = 'verified',
      opportunity_score = excluded.opportunity_score,
      demand_confidence = excluded.demand_confidence,
      score_breakdown_json = excluded.score_breakdown_json,
      updated_at = excluded.updated_at
  `);

  const classifiedObservedPayload: Array<Record<string, unknown>> = [];
  const seenHashes = new Set<string>();

  db.exec('BEGIN');
  try {
    for (const row of allTelemetryRows) {
      const cl = classifyKeyword(row.query, { source: 'gsc_api', sourceType: 'VERIFIED_GSC' });
      const normQ = cl?.normalizedKeyword || row.query.trim().toLowerCase();
      const grainKey = `${row.observationDate}|${row.propertyUrl}|${normQ}|${row.country}|${row.device}|${row.pageUrl}`;
      upsertGscStmt.run(
        grainKey,
        row.query,
        normQ,
        row.pageUrl,
        row.propertyUrl,
        row.country,
        row.device,
        row.impressions,
        row.priorImpressions ?? 0,
        row.clicks,
        row.ctr,
        row.position,
        row.ga4Sessions ?? 0,
        row.ga4Conversions ?? 0,
        row.observationDate,
        nowIso
      );

      if (cl) {
        const scored = scoreOpportunity({
          classified: cl,
          searchVolumeStatus: 'verified',
          gscImpressions: row.impressions,
          gscClicks: row.clicks,
          gscCtr: row.ctr,
          gscPosition: row.position,
          ga4Conversions: row.ga4Conversions ?? 0,
        });
        if (!seenHashes.has(cl.keywordHash)) {
          seenHashes.add(cl.keywordHash);
          upsertKwStmt.run(
            cl.keywordHash,
            cl.rawKeyword,
            cl.normalizedKeyword,
            cl.dedupKey,
            row.country === 'GLB' ? cl.countryCode : row.country,
            cl.citySlug,
            cl.language,
            cl.industrySlug,
            cl.jobRoleSlug,
            cl.skillSlug,
            cl.seniority,
            cl.employmentType,
            cl.workMode,
            cl.searchIntent,
            cl.opportunityType,
            cl.clusterKey,
            cl.recommendedDestination,
            cl.recommendedCanonicalUrl,
            cl.isClassified ? 1 : 0,
            cl.classificationConfidence,
            JSON.stringify(cl.entities),
            JSON.stringify(cl.semanticRelations),
            scored.compositeScore,
            scored.dataConfidence,
            JSON.stringify(scored),
            nowIso,
            nowIso
          );

          classifiedObservedPayload.push({
            keyword: cl.rawKeyword,
            normalized_keyword: cl.normalizedKeyword,
            keyword_hash: cl.keywordHash,
            source: 'gsc_api',
            source_type: 'VERIFIED_GSC',
            country: row.country === 'GLB' ? cl.countryCode : row.country,
            city: cl.citySlug,
            language: cl.language,
            industry: cl.industrySlug,
            job_role: cl.jobRoleSlug,
            skill: cl.skillSlug,
            seniority: cl.seniority,
            employment_type: cl.employmentType,
            work_mode: cl.workMode,
            search_intent: cl.searchIntent,
            opportunity_type: cl.opportunityType,
            recommended_destination: cl.recommendedDestination,
            estimated_demand: row.impressions,
            demand_confidence: scored.dataConfidence,
            competition_score: scored.competitionScore,
            relevance_score: scored.talentxcelRelevanceScore,
            inventory_score: scored.inventoryAvailabilityScore,
            conversion_score: scored.conversionPotentialScore,
            opportunity_score: scored.compositeScore,
            data_quality_score: 90,
            score_breakdown: scored,
            status: 'SCORED',
          });
        }
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // Detect Opportunities A-I across all real telemetry
  const qualifiedUrls = new Set<string>(
    (db.prepare("SELECT page_url FROM page_qualifications WHERE qualification_status = 'QUALIFIED_FOR_INDEX'").all() as Array<{ page_url: string }>).map(
      (r) => r.page_url
    )
  );
  const gscOpportunities = detectGscOpportunities(allTelemetryRows, qualifiedUrls);

  const upsertOppStmt = db.prepare(`
    INSERT INTO opportunities (
      opportunity_key, keyword_hash, cluster_key, opportunity_type, gsc_opportunity_code,
      recommended_destination, opportunity_score, confidence_score, priority, qualification_status,
      recommended_action, evidence_json, score_breakdown_json, updated_at
    ) VALUES (?, NULL, NULL, ?, ?, ?, ?, 0.90, ?, 'RECOMMENDED', ?, ?, '{}', ?)
    ON CONFLICT(opportunity_key) DO UPDATE SET
      opportunity_score = excluded.opportunity_score,
      priority = excluded.priority,
      recommended_action = excluded.recommended_action,
      evidence_json = excluded.evidence_json,
      updated_at = excluded.updated_at
  `);

  db.exec('BEGIN');
  try {
    for (const opp of gscOpportunities) {
      upsertOppStmt.run(
        opp.opportunityKey,
        opp.codeLabel,
        opp.code,
        opp.recommendedDestination,
        opp.severityScore,
        opp.priority,
        opp.recommendedAction,
        JSON.stringify(opp.evidence),
        nowIso
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  let supabaseSyncResult: Record<string, unknown> = { skipped: skipSupabase };
  if (!skipSupabase) {
    const sb = getServerSupabaseClient();
    await batchUpsertSupabase(
      sb,
      'keyword_sources',
      [
        {
          source_name: 'google_search_console_api',
          source_type: 'VERIFIED_GSC',
          collection_method: 'GSC_SEARCH_ANALYTICS_PAGINATED',
          source_confidence: 0.95,
          is_verified_demand: true,
          source_metadata: { properties: txProperties, startDate: startDate28d, endDate },
        },
        {
          source_name: 'ga4_analytics_data_api',
          source_type: 'VERIFIED_GA4',
          collection_method: 'GA4_RUN_REPORT',
          source_confidence: 0.90,
          is_verified_demand: true,
          source_metadata: { propertyId: GA4_PROPERTY_ID, landingPages: ga4Map.size },
        },
      ],
      'source_name'
    );

    const kwRes = await batchUpsertSupabase(
      sb,
      'keyword_intelligence',
      classifiedObservedPayload.slice(0, 4000),
      'keyword_hash'
    );

    // Bounded top 2,500 observations by impressions to keep cloud storage compact
    const topObsRows = [...allTelemetryRows]
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 2500)
      .map((r) => ({
        normalized_keyword: r.query.trim().toLowerCase(),
        observation_date: r.observationDate,
        property_url: r.propertyUrl,
        source: 'GSC_API',
        country: r.country,
        device: r.device,
        page_url: r.pageUrl.slice(0, 400),
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: Number(r.ctr.toFixed(6)),
        average_position: Number(r.position.toFixed(2)),
        trend_direction:
          r.priorImpressions && r.priorImpressions > 0
            ? r.impressions > r.priorImpressions * 1.15
              ? 'RISING'
              : r.impressions < r.priorImpressions * 0.85
                ? 'DECLINING'
                : 'STABLE'
            : 'UNKNOWN',
        conversion_count: r.ga4Conversions ?? 0,
        observation_metadata: { ga4_sessions: r.ga4Sessions ?? 0 },
      }));

    const obsRes = await batchUpsertSupabase(
      sb,
      'keyword_observations',
      topObsRows,
      'normalized_keyword,observation_date,source,property_url,country,device,page_url'
    );

    const oppPayload = gscOpportunities.slice(0, 1500).map((o) => ({
      opportunity_key: o.opportunityKey,
      opportunity_type: o.codeLabel,
      gsc_opportunity_code: o.code,
      recommended_destination: o.recommendedDestination,
      opportunity_score: o.severityScore,
      confidence_score: 0.9,
      priority: o.priority,
      qualification_status: 'RECOMMENDED',
      evidence: o.evidence,
      recommended_action: o.recommendedAction,
    }));
    const oppRes = await batchUpsertSupabase(sb, 'seo_opportunities', oppPayload, 'opportunity_key');

    await sb.from('seo_intelligence_runs').insert({
      run_type: 'GSC_GA4_SYNC',
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      records_processed: allTelemetryRows.length,
      records_inserted: kwRes.succeeded + obsRes.succeeded,
      summary_metrics: {
        propertiesCount: txProperties.length,
        totalRows: allTelemetryRows.length,
        ga4LandingPages: ga4Map.size,
        gscOpportunitiesCount: gscOpportunities.length,
      },
    });

    supabaseSyncResult = {
      keywordsSynced: kwRes.succeeded,
      observationsSynced: obsRes.succeeded,
      opportunitiesSynced: oppRes.succeeded,
      errors: [...kwRes.errors, ...obsRes.errors, ...oppRes.errors],
    };
  }

  const monitoringSummary = summarizeGscMonitoring(allTelemetryRows, gscOpportunities);

  db.close();
  return {
    propertiesQueried: propertySummaries,
    incompleteProperties,
    totalGscRows: allTelemetryRows.length,
    uniqueObservedQueries: seenHashes.size,
    ga4LandingPagesWithData: ga4Map.size,
    gscOpportunitiesDetected: gscOpportunities.length,
    monitoringSummary,
    opportunityBreakdownByCode: monitoringSummary.byCode,
    durationMs: Date.now() - startedAt,
    supabaseSyncResult,
  };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('sync-gsc-telemetry.ts')) {
  runGscTelemetrySync()
    .then((res) => console.log('GSC + GA4 sync complete:', JSON.stringify(res, null, 2)))
    .catch((e) => {
      console.error('GSC sync failed:', e);
      process.exit(1);
    });
}
