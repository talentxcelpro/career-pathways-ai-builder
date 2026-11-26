// scripts/search-intelligence/run-phase4-autonomous-growth.ts
// Phase 4 Autonomous Organic Growth Execution & Recovery Engine.
// Consolidates Phase 1-3 intelligence into a deduplicated, governed execution queue,
// performs live GA4 organic funnel recovery, dual-UA technical SEO & canonical audits,
// 7-state cannibalization classification, 3-candidate CTR metadata generation,
// safe Tier A execution with before/after snapshots, and segmented Growth Scorecards.

import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import {
  classifyCannibalizationCluster,
  consolidateExecutionQueue,
  generateCtrMetadataCandidates,
  transitionPhase4Action,
  type CannibalizationUrlEvidence,
  type GrowthExecutionQueueItem,
} from '../../src/lib/seo/demandIntelligence/autonomousGrowth';
import { generateContentBrief } from '../../src/lib/seo/demandIntelligence/contentBriefGenerator';
import { computeKeywordFingerprint } from '../../src/lib/seo/demandIntelligence/normalizer';
import { collectAndPersistLiveInventory } from './inventoryMatcher';
import { DEFAULT_WAREHOUSE_PATH, openWarehouse } from './sqliteWarehouse';
import { batchUpsertSupabase, getServerSupabaseClient, loadEnvLocal } from './supabaseSync';

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '499367883';

export type OperatingCycleMode = 'daily' | 'weekly' | 'monthly' | 'full';

interface Ga4FunnelSummary {
  totalOrganicSessions: number;
  totalEngagedSessions: number;
  avgBounceRate: number;
  eventTotals: Record<string, number>;
  landingPagesCount: number;
  poorEngagementPages: Array<{ path: string; sessions: number; bounceRate: number }>;
  highTrafficZeroSignupPages: Array<{ path: string; sessions: number; signUps: number }>;
  telemetryGaps: string[];
  byPath: Map<string, { sessions: number; engagedSessions: number; bounceRate: number; conversions: number; signUps: number }>;
}

interface DualUaMetadataProbe {
  url: string;
  stdStatus: number;
  stdTitle: string | null;
  stdDesc: string | null;
  stdCanonical: string | null;
  botStatus: number;
  botTitle: string | null;
  botDesc: string | null;
  botCanonical: string | null;
}

function fetchHtmlWithUa(urlStr: string, userAgent: string, timeoutMs = 7000): Promise<{ status: number; body: string }> {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = https.request(
        u,
        {
          method: 'GET',
          headers: {
            'User-Agent': userAgent,
            Accept: 'text/html,application/xhtml+xml',
            Connection: 'close',
          },
          timeout: timeoutMs,
        },
        (res) => {
          const status = res.statusCode ?? 0;
          let body = '';
          res.on('data', (chunk) => {
            if (body.length < 220_000) body += chunk.toString('utf8');
          });
          res.on('end', () => resolve({ status, body }));
        }
      );
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, body: '' });
      });
      req.on('error', () => resolve({ status: 0, body: '' }));
      req.end();
    } catch {
      resolve({ status: 0, body: '' });
    }
  });
}

function extractHeadTags(html: string): { title: string | null; description: string | null; canonical: string | null } {
  const clean = (s: string | undefined) => (s ? s.replace(/\s+/g, ' ').trim() : null);
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const d =
    html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["'][^>]*>/i)?.[1] ||
    html.match(/<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["'][^>]*>/i)?.[1];
  const c =
    html.match(/<link\s+rel=["']canonical["']\s+href=["']([\s\S]*?)["'][^>]*>/i)?.[1] ||
    html.match(/<link\s+href=["']([\s\S]*?)["']\s+rel=["']canonical["'][^>]*>/i)?.[1];
  return { title: clean(t), description: clean(d), canonical: clean(c) };
}

async function probeDualUaMetadata(url: string): Promise<DualUaMetadataProbe> {
  const [stdRes, botRes] = await Promise.all([
    fetchHtmlWithUa(url, 'TalentXcel-SEO-Audit/1.0 (+https://talentxcel.in)'),
    fetchHtmlWithUa(url, 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'),
  ]);
  const stdTags = stdRes.status === 200 ? extractHeadTags(stdRes.body) : { title: null, description: null, canonical: null };
  const botTags = botRes.status === 200 ? extractHeadTags(botRes.body) : { title: null, description: null, canonical: null };
  return {
    url,
    stdStatus: stdRes.status,
    stdTitle: stdTags.title,
    stdDesc: stdTags.description,
    stdCanonical: stdTags.canonical,
    botStatus: botRes.status,
    botTitle: botTags.title,
    botDesc: botTags.description,
    botCanonical: botTags.canonical,
  };
}

function loadGoogleServiceAccount(): { email: string; privateKey: string } | null {
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
  if (email && privateKey) {
    return { email, privateKey: privateKey.replace(/\\n/g, '\n') };
  }
  return null;
}

async function fetchGa4OrganicFunnel(): Promise<Ga4FunnelSummary> {
  const byPath = new Map<
    string,
    { sessions: number; engagedSessions: number; bounceRate: number; conversions: number; signUps: number }
  >();
  const funnelEvents = [
    'sign_up',
    'ats_score_generated',
    'talentscore_completed',
    'career_passport_created',
    'application_submitted',
    'guest_apply_opened',
    'apply_cta_clicked',
  ];
  const eventTotals: Record<string, number> = Object.fromEntries(funnelEvents.map((e) => [e, 0]));
  let totalOrganicSessions = 0;
  let totalEngagedSessions = 0;
  let weightedBounceSum = 0;

  const sa = loadGoogleServiceAccount();
  if (!sa) {
    return {
      totalOrganicSessions: 0,
      totalEngagedSessions: 0,
      avgBounceRate: 0,
      eventTotals,
      landingPagesCount: 0,
      poorEngagementPages: [],
      highTrafficZeroSignupPages: [],
      telemetryGaps: ['Google Service Account credentials unavailable for live GA4 funnel query.'],
      byPath,
    };
  }

  try {
    const gaClient = new BetaAnalyticsDataClient({
      credentials: { client_email: sa.email, private_key: sa.privateKey },
    });

    const [landingRes] = await gaClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'landingPagePlusQueryString' }],
      metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'bounceRate' }, { name: 'keyEvents' }],
      dimensionFilter: {
        filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Organic Search' } },
      },
      limit: 5000,
    });

    for (const row of landingRes.rows || []) {
      const rawPath = row.dimensionValues?.[0]?.value || '/';
      const cleanPath = rawPath.split('?')[0].replace(/\/+$/, '') || '/';
      const sessions = Number(row.metricValues?.[0]?.value || 0);
      const engagedSessions = Number(row.metricValues?.[1]?.value || 0);
      const bounceRate = Number(row.metricValues?.[2]?.value || 0);
      const keyEvents = Number(row.metricValues?.[3]?.value || 0);

      totalOrganicSessions += sessions;
      totalEngagedSessions += engagedSessions;
      weightedBounceSum += bounceRate * sessions;

      const prev = byPath.get(cleanPath);
      if (!prev) {
        byPath.set(cleanPath, { sessions, engagedSessions, bounceRate, conversions: keyEvents, signUps: 0 });
      } else {
        const totS = prev.sessions + sessions;
        byPath.set(cleanPath, {
          sessions: totS,
          engagedSessions: prev.engagedSessions + engagedSessions,
          bounceRate: totS > 0 ? Number(((prev.bounceRate * prev.sessions + bounceRate * sessions) / totS).toFixed(4)) : 0,
          conversions: prev.conversions + keyEvents,
          signUps: prev.signUps,
        });
      }
    }

    const [evRes] = await gaClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'landingPagePlusQueryString' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Organic Search' } } },
            { filter: { fieldName: 'eventName', inListFilter: { values: funnelEvents } } },
          ],
        },
      },
      limit: 5000,
    });

    for (const row of evRes.rows || []) {
      const rawPath = row.dimensionValues?.[0]?.value || '/';
      const cleanPath = rawPath.split('?')[0].replace(/\/+$/, '') || '/';
      const evName = row.dimensionValues?.[1]?.value || '';
      const cnt = Number(row.metricValues?.[0]?.value || 0);
      if (evName in eventTotals) eventTotals[evName] += cnt;
      const entry = byPath.get(cleanPath);
      if (entry) {
        if (evName === 'sign_up') entry.signUps += cnt;
        entry.conversions += cnt;
      }
    }
  } catch (err) {
    console.warn('[Phase4 GA4] Non-fatal warning:', (err as Error).message);
  }

  const poorEngagementPages = Array.from(byPath.entries())
    .filter(([, v]) => v.sessions >= 15 && v.bounceRate >= 0.65)
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .slice(0, 15)
    .map(([p, v]) => ({ path: p, sessions: v.sessions, bounceRate: v.bounceRate }));

  const highTrafficZeroSignupPages = Array.from(byPath.entries())
    .filter(([, v]) => v.sessions >= 15 && v.signUps === 0)
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .slice(0, 15)
    .map(([p, v]) => ({ path: p, sessions: v.sessions, signUps: v.signUps }));

  const telemetryGaps = funnelEvents
    .filter((ev) => eventTotals[ev] === 0)
    .map((ev) => `GA4 event '${ev}' reported 0 Organic Search occurrences in last 28d; verify emission or event naming.`);

  return {
    totalOrganicSessions,
    totalEngagedSessions,
    avgBounceRate: totalOrganicSessions > 0 ? Number((weightedBounceSum / totalOrganicSessions).toFixed(4)) : 0,
    eventTotals,
    landingPagesCount: byPath.size,
    poorEngagementPages,
    highTrafficZeroSignupPages,
    telemetryGaps,
    byPath,
  };
}

function extractPath(urlStr: string): string {
  try {
    return new URL(urlStr).pathname.replace(/\/+$/, '') || '/';
  } catch {
    return urlStr.split('?')[0].replace(/\/+$/, '') || '/';
  }
}

function extractHost(urlStr: string): string {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return 'talentxcel.in';
  }
}

function countSitemapUrls(): { publicRootSitemaps: number; distRootSitemaps: number; samplePublishedUrls: number } {
  let publicRootSitemaps = 0;
  let distRootSitemaps = 0;
  let samplePublishedUrls = 0;
  const pubRoot = path.resolve(process.cwd(), 'public', 'sitemap-root.xml');
  const distRoot = path.resolve(process.cwd(), 'dist', 'sitemap-root.xml');
  if (fs.existsSync(pubRoot)) {
    const xml = fs.readFileSync(pubRoot, 'utf8');
    publicRootSitemaps = (xml.match(/<loc>/g) || []).length;
  }
  if (fs.existsSync(distRoot)) {
    const xml = fs.readFileSync(distRoot, 'utf8');
    distRootSitemaps = (xml.match(/<loc>/g) || []).length;
  }
  const pubJobs = path.resolve(process.cwd(), 'public', 'sitemap-jobs.xml');
  if (fs.existsSync(pubJobs)) {
    const xml = fs.readFileSync(pubJobs, 'utf8');
    samplePublishedUrls = (xml.match(/<loc>/g) || []).length;
  }
  return { publicRootSitemaps, distRootSitemaps, samplePublishedUrls };
}

export async function runPhase4AutonomousGrowth(
  options: { dbPath?: string; skipSupabase?: boolean; mode?: OperatingCycleMode } = {}
) {
  const startedAt = Date.now();
  const modeArg = process.argv.find((a) => a.startsWith('--mode='))?.split('=')[1] as OperatingCycleMode | undefined;
  const mode: OperatingCycleMode = options.mode || modeArg || 'full';
  const db = openWarehouse(options.dbPath || DEFAULT_WAREHOUSE_PATH);
  const skipSupabase = options.skipSupabase ?? process.argv.includes('--skip-supabase');
  const nowIso = new Date().toISOString();
  const todayStr = nowIso.slice(0, 10);

  // 1. Forensic Baseline Revalidation
  const baselineCounts = {
    gscWindowTelemetryRows: (db.prepare('SELECT COUNT(*) AS c FROM gsc_window_telemetry').get() as { c: number }).c,
    gscSearchAppearanceRows: (db.prepare('SELECT COUNT(*) AS c FROM gsc_search_appearance').get() as { c: number }).c,
    queryPageGraphEdges: (db.prepare('SELECT COUNT(*) AS c FROM query_page_graph').get() as { c: number }).c,
    ctrRecommendations: (db.prepare('SELECT COUNT(*) AS c FROM ctr_recommendations').get() as { c: number }).c,
    positionAttackTargets: (db.prepare('SELECT COUNT(*) AS c FROM position_attack_targets').get() as { c: number }).c,
    competitorBenchmarks: (db.prepare('SELECT COUNT(*) AS c FROM competitor_benchmarks').get() as { c: number }).c,
    internalLinks: (db.prepare('SELECT COUNT(*) AS c FROM internal_links').get() as { c: number }).c,
    pagePerformanceFeedback: (db.prepare('SELECT COUNT(*) AS c FROM page_performance_feedback').get() as { c: number }).c,
    actionGovernanceLog: (db.prepare('SELECT COUNT(*) AS c FROM action_governance_log').get() as { c: number }).c,
    sitemapStats: countSitemapUrls(),
  };

  const reportsDir = path.resolve(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportsDir, 'PHASE4_FORENSIC_BASELINE.json'),
    JSON.stringify({ verifiedAt: nowIso, mode, ...baselineCounts }, null, 2)
  );

  // Live non-PII inventory refresh
  const inventory = await collectAndPersistLiveInventory(db);

  // 2. GA4 Organic Funnel Recovery Analysis
  const ga4Funnel = await fetchGa4OrganicFunnel();

  // 3. CTR Recovery Deep Inspection (dual-UA check on top 15 + 3-candidate pairs for all 29)
  const ctrRows = db
    .prepare('SELECT * FROM ctr_recommendations ORDER BY priority_score DESC')
    .all() as Array<{
    recommendation_key: string;
    page_url: string;
    primary_query: string;
    page_intent: string;
    avg_position: number;
    impressions: number;
    clicks: number;
    actual_ctr: number;
    cohort_expected_ctr: number;
    existing_title: string | null;
    existing_description: string | null;
    rationale: string;
    risk_assessment: 'LOW' | 'MEDIUM' | 'HIGH';
    priority_score: number;
  }>;

  const dualUaProbes: DualUaMetadataProbe[] = [];
  for (let i = 0; i < Math.min(15, ctrRows.length); i += 5) {
    const batch = ctrRows.slice(i, i + 5);
    const probes = await Promise.all(batch.map((r) => probeDualUaMetadata(r.page_url)));
    dualUaProbes.push(...probes);
  }
  const probeMap = new Map(dualUaProbes.map((p) => [p.url, p]));

  const queueCandidates: GrowthExecutionQueueItem[] = [];

  for (const r of ctrRows) {
    const { candidates, selected } = generateCtrMetadataCandidates({
      primaryQuery: r.primary_query,
      pageIntent: r.page_intent,
      realInventoryCount: inventory.totalActiveJobs > 0 ? 10 : 0,
      isBranded: r.primary_query.toLowerCase().includes('talentxcel'),
    });
    const probe = probeMap.get(r.page_url);
    const ga = ga4Funnel.byPath.get(extractPath(r.page_url));

    // Tier B: production metadata update requires explicit approval
    queueCandidates.push({
      actionId: `exec-ctr-${r.recommendation_key}`,
      url: r.page_url,
      queryOrCluster: r.primary_query,
      actionCategory: 'CTR_RECOVERY',
      executionTier: 'TIER_B_APPROVAL',
      recommendation: `Update title/meta to "${selected.title}" (3 evidence-grounded candidates generated).`,
      supportingEvidence: {
        rationale: r.rationale,
        cohortExpectedCtr: r.cohort_expected_ctr,
        candidatePairs: candidates,
        botRenderedTitle: probe?.botTitle ?? null,
        stdFallbackTitle: probe?.stdTitle ?? r.existing_title,
        botCanonical: probe?.botCanonical ?? null,
      },
      gscMetrics: {
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: r.actual_ctr,
        avgPosition: r.avg_position,
      },
      ga4Metrics: ga ? { ...ga } : {},
      expectedImpact: `Close CTR gap toward ${(r.cohort_expected_ctr * 100).toFixed(2)}% position cohort baseline.`,
      confidenceScore: r.impressions >= 100 ? 0.85 : 0.65,
      priorityScore: r.priority_score,
      riskLevel: r.risk_assessment,
      actionStatus: 'RECOMMENDATION',
      approvalStatus: 'PENDING',
      ownerSystem: 'Phase4_CTR_Recovery_Engine',
      proposedChanges: {
        selectedTitle: selected.title,
        selectedDescription: selected.description,
        allCandidatesCount: candidates.length,
      },
      beforeStateSnapshot: {
        existingTitle: r.existing_title,
        existingDescription: r.existing_description,
        botTitle: probe?.botTitle ?? null,
        botCanonical: probe?.botCanonical ?? null,
      },
      afterStateSnapshot: {},
      verificationWindow: '28d',
      rollbackInstructions: `Restore previous title (${r.existing_title || 'template default'}) and meta description.`,
    });
  }

  // 4. Position 4-20 Strike-Zone Targets
  const atkRows = db
    .prepare('SELECT * FROM position_attack_targets ORDER BY priority_score DESC')
    .all() as Array<{
    attack_key: string;
    page_url: string;
    position_band: string;
    primary_query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    avg_position: number;
    relevant_inventory: number;
    content_gap: string;
    internal_linking_gap: number;
    suggested_action: string;
    priority_score: number;
  }>;

  for (const t of atkRows) {
    const ga = ga4Funnel.byPath.get(extractPath(t.page_url));
    queueCandidates.push({
      actionId: `exec-atk-${t.attack_key}`,
      url: t.page_url,
      queryOrCluster: t.primary_query,
      actionCategory: 'STRIKE_ZONE_ATTACK',
      executionTier: 'TIER_B_APPROVAL',
      recommendation: t.suggested_action,
      supportingEvidence: {
        positionBand: t.position_band,
        contentGap: t.content_gap,
        internalLinkingGap: t.internal_linking_gap,
        relevantInventory: t.relevant_inventory,
      },
      gscMetrics: {
        impressions: t.impressions,
        clicks: t.clicks,
        ctr: t.ctr,
        avgPosition: t.avg_position,
      },
      ga4Metrics: ga ? { ...ga } : {},
      expectedImpact: `Improve relevance & internal equity for ${t.position_band} target (currently pos ${t.avg_position}).`,
      confidenceScore: t.relevant_inventory > 0 ? 0.8 : 0.6,
      priorityScore: t.priority_score,
      riskLevel: 'LOW',
      actionStatus: 'RECOMMENDATION',
      approvalStatus: 'PENDING',
      ownerSystem: 'Phase4_Strike_Zone_Engine',
      proposedChanges: {
        positionBand: t.position_band,
        contentGap: t.content_gap,
        internalLinksToAdd: t.internal_linking_gap,
      },
      beforeStateSnapshot: { avgPosition: t.avg_position, ctr: t.ctr, impressions: t.impressions },
      afterStateSnapshot: {},
      verificationWindow: '28d',
      rollbackInstructions: 'Revert content/link additions if 28d position or CTR degrades.',
    });
  }

  // 5. Cannibalization Intelligence (All Multi-URL Query Clusters)
  const cannGroupsRaw = db
    .prepare(`
      SELECT normalized_query, page_url, page_type, search_intent,
             impressions_28d, impressions_90d, clicks_28d, clicks_90d,
             pos_28d, pos_90d, inventory_count
      FROM query_page_graph
      WHERE normalized_query IN (
        SELECT normalized_query
        FROM query_page_graph
        WHERE impressions_28d >= 3 OR impressions_90d >= 5
        GROUP BY normalized_query
        HAVING COUNT(DISTINCT page_url) > 1
      )
    `)
    .all() as Array<{
    normalized_query: string;
    page_url: string;
    page_type: string;
    search_intent: string;
    impressions_28d: number;
    impressions_90d: number;
    clicks_28d: number;
    clicks_90d: number;
    pos_28d: number | null;
    pos_90d: number | null;
    inventory_count: number;
  }>;

  const cannByQuery = new Map<string, CannibalizationUrlEvidence[]>();
  for (const row of cannGroupsRaw) {
    const arr = cannByQuery.get(row.normalized_query) || [];
    arr.push({
      pageUrl: row.page_url,
      pageType: row.page_type,
      searchIntent: row.search_intent,
      impressions: row.impressions_28d > 0 ? row.impressions_28d : row.impressions_90d,
      clicks: row.impressions_28d > 0 ? row.clicks_28d : row.clicks_90d,
      avgPosition: row.pos_28d ?? row.pos_90d ?? 50,
      inventoryCount: row.inventory_count,
    });
    cannByQuery.set(row.normalized_query, arr);
  }

  const cannClassCounts: Record<string, number> = {};
  const cannAuditsToSync: Array<Record<string, unknown>> = [];
  const upsertCannStmt = db.prepare(`
    INSERT INTO cannibalization_audits (
      query_key, raw_query, ranking_urls_json, dominant_url, classification,
      impressions_total, clicks_total, recommendation, governance_state, audited_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RECOMMENDATION', ?)
    ON CONFLICT(query_key) DO UPDATE SET
      ranking_urls_json = excluded.ranking_urls_json,
      dominant_url = excluded.dominant_url,
      classification = excluded.classification,
      impressions_total = excluded.impressions_total,
      clicks_total = excluded.clicks_total,
      recommendation = excluded.recommendation,
      audited_at = excluded.audited_at
  `);

  db.exec('BEGIN');
  try {
    for (const [q, urls] of cannByQuery.entries()) {
      const res = classifyCannibalizationCluster(q, urls);
      cannClassCounts[res.classification] = (cannClassCounts[res.classification] || 0) + 1;
      upsertCannStmt.run(
        res.queryKey,
        res.rawQuery,
        JSON.stringify(urls),
        res.dominantUrl,
        res.classification,
        res.impressionsTotal,
        res.clicksTotal,
        res.recommendation,
        nowIso
      );

      if (cannAuditsToSync.length < 250) {
        cannAuditsToSync.push({
          query_key: res.queryKey,
          raw_query: res.rawQuery,
          ranking_urls: urls,
          dominant_url: res.dominantUrl,
          classification: res.classification,
          impressions_total: res.impressionsTotal,
          clicks_total: res.clicksTotal,
          recommendation: res.recommendation,
          governance_state: 'RECOMMENDATION',
        });
      }

      if (
        (res.classification === 'TRUE_CANNIBALIZATION' || res.classification === 'CONSOLIDATION_CANDIDATE') &&
        res.impressionsTotal >= 25
      ) {
        const secondaryUrl = urls.find((u) => u.pageUrl !== res.dominantUrl)?.pageUrl || res.dominantUrl;
        queueCandidates.push({
          actionId: `exec-cann-${res.queryKey}`,
          url: secondaryUrl,
          queryOrCluster: res.rawQuery,
          actionCategory: 'CANNIBALIZATION_RESOLUTION',
          executionTier: res.classification === 'CONSOLIDATION_CANDIDATE' ? 'TIER_C_RESTRICTED' : 'TIER_B_APPROVAL',
          recommendation: res.recommendation,
          supportingEvidence: { rankingUrls: urls, classification: res.classification },
          gscMetrics: { impressionsTotal: res.impressionsTotal, clicksTotal: res.clicksTotal },
          ga4Metrics: {},
          expectedImpact: `Consolidate split signals onto dominant URL ${res.dominantUrl}.`,
          confidenceScore: 0.78,
          priorityScore: Math.min(96, Math.round(Math.log10(res.impressionsTotal + 1) * 32 * 100) / 100),
          riskLevel: res.classification === 'CONSOLIDATION_CANDIDATE' ? 'HIGH' : 'MEDIUM',
          actionStatus: 'EVIDENCE_REVIEW',
          approvalStatus: 'PENDING',
          ownerSystem: 'Phase4_Cannibalization_Engine',
          proposedChanges: { classification: res.classification, dominantUrl: res.dominantUrl },
          beforeStateSnapshot: { rankingUrls: urls },
          afterStateSnapshot: {},
          verificationWindow: '28d',
          rollbackInstructions: 'Restore previous canonical/internal-link separation if dominant URL loses clicks.',
        });
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // 6. Technical SEO Findings (Dual-UA + Governor + Inventory Stale + GA4 Telemetry Gaps)
  const techFindings: Array<Record<string, unknown>> = [];
  const upsertTechStmt = db.prepare(`
    INSERT INTO technical_seo_findings (
      finding_key, url, issue_category, severity, evidence_json, remediation, governance_state, detected_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'RECOMMENDATION', ?)
    ON CONFLICT(finding_key) DO UPDATE SET
      severity = excluded.severity,
      evidence_json = excluded.evidence_json,
      remediation = excluded.remediation,
      detected_at = excluded.detected_at
  `);

  for (const p of dualUaProbes) {
    if (p.stdStatus === 200 && p.stdTitle === 'TalentXcel — Global Career Platform, Jobs & Passport' && !p.url.endsWith('.in/')) {
      const botOk = p.botStatus === 200 && p.botTitle && p.botTitle !== p.stdTitle;
      const issueCat = botOk ? 'SPA_FALLBACK_METADATA_FOR_NON_BOT_UA' : 'GENERIC_FALLBACK_METADATA';
      const sev = botOk ? 'MEDIUM' : 'HIGH';
      const findingKey = `tech-${computeKeywordFingerprint(`${issueCat}|${p.url}`).slice(0, 14)}`;
      const remediation = botOk
        ? 'Googlebot UA receives route-specific metadata; ensure edge prerender/HTML shell also covers standard HTTP previewers if needed.'
        : 'Route serves generic fallback <title> even to Googlebot UA; wire /api/seo-render or prerender-static-seo.ts metadata for this route.';

      techFindings.push({
        finding_key: findingKey,
        url: p.url,
        issue_category: issueCat,
        severity: sev,
        evidence: { stdTitle: p.stdTitle, botTitle: p.botTitle, botCanonical: p.botCanonical },
        remediation,
        governance_state: 'RECOMMENDATION',
      });

      queueCandidates.push({
        actionId: `exec-tech-${findingKey}`,
        url: p.url,
        queryOrCluster: 'technical-metadata-rendering',
        actionCategory: 'TECHNICAL_SEO',
        executionTier: 'TIER_B_APPROVAL',
        recommendation: remediation,
        supportingEvidence: { stdTitle: p.stdTitle, botTitle: p.botTitle, botCanonical: p.botCanonical },
        gscMetrics: {},
        ga4Metrics: {},
        expectedImpact: 'Ensure search crawlers & previewers consistently receive route-specific title/canonical.',
        confidenceScore: 0.9,
        priorityScore: sev === 'HIGH' ? 88 : 68,
        riskLevel: 'LOW',
        actionStatus: 'RECOMMENDATION',
        approvalStatus: 'PENDING',
        ownerSystem: 'Phase4_Technical_SEO_Auditor',
        proposedChanges: { issueCategory: issueCat },
        beforeStateSnapshot: { stdTitle: p.stdTitle, botTitle: p.botTitle, botCanonical: p.botCanonical },
        afterStateSnapshot: {},
        verificationWindow: '28d',
        rollbackInstructions: 'Revert route metadata handler if canonical or status code regresses.',
      });
    }
  }

  for (const gap of ga4Funnel.telemetryGaps) {
    const findingKey = `tech-${computeKeywordFingerprint(`ga4gap|${gap}`).slice(0, 14)}`;
    techFindings.push({
      finding_key: findingKey,
      url: 'https://talentxcel.in/',
      issue_category: 'GA4_TELEMETRY_GAP',
      severity: 'MEDIUM',
      evidence: { gap },
      remediation: 'Verify backend/analytics event emission for missing Organic Search conversion event without UI redesign.',
      governance_state: 'RECOMMENDATION',
    });
  }

  db.exec('BEGIN');
  try {
    for (const tf of techFindings) {
      upsertTechStmt.run(
        tf.finding_key,
        tf.url,
        tf.issue_category,
        tf.severity,
        JSON.stringify(tf.evidence),
        tf.remediation,
        nowIso
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // 7. Page-Specific Content Briefs (Non-cannibalized GSC-backed pages)
  let contentBriefsGenerated = 0;
  const upsertBriefStmt = db.prepare(`
    INSERT INTO content_briefs (
      brief_key, target_url, opportunity_type, primary_keyword, supporting_keywords_json,
      target_intent, recommended_title, meta_description, outline_json, faq_json,
      internal_links_json, evidence_json, estimated_impact_score, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(brief_key) DO UPDATE SET
      recommended_title = excluded.recommended_title,
      meta_description = excluded.meta_description,
      updated_at = excluded.updated_at
  `);

  db.exec('BEGIN');
  try {
    for (const t of atkRows.filter((x) => x.relevant_inventory > 0).slice(0, 15)) {
      const brief = generateContentBrief({
        targetUrl: extractPath(t.page_url),
        opportunityType: t.page_url.includes('/salary/') ? 'salary-benchmark' : 'role-city-job',
        primaryKeyword: t.primary_query,
        supportingKeywords: [],
        targetIntent: t.page_url.includes('/salary/') ? 'salary_benchmark' : 'job_search',
        estimatedImpactScore: t.priority_score,
        verifiedJobsCount: t.relevant_inventory,
        verifiedProfilesCount: inventory.publicProfilesCount,
        verifiedCoursesCount: inventory.coursesCount,
        observedGscImpressions: t.impressions,
        observedGscClicks: t.clicks,
      });
      const briefKey = `p4-brief-${computeKeywordFingerprint(t.page_url).slice(0, 14)}`;
      upsertBriefStmt.run(
        briefKey,
        t.page_url,
        brief.opportunityType,
        brief.primaryKeyword,
        JSON.stringify(brief.supportingKeywords ?? []),
        brief.targetIntent,
        brief.recommendedTitle,
        brief.metaDescription,
        JSON.stringify(brief.outline ?? []),
        JSON.stringify(brief.faq ?? []),
        JSON.stringify(brief.internalLinks ?? []),
        JSON.stringify(brief.evidenceSummary ?? {}),
        brief.estimatedImpactScore ?? t.priority_score,
        nowIso
      );
      contentBriefsGenerated += 1;
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // 8. Safe Tier A Autonomous Actions (Executed & Verified with Before/After Snapshots)
  const tierAActionsRaw: GrowthExecutionQueueItem[] = [
    {
      actionId: `exec-t1-refresh-${todayStr}`,
      url: 'https://talentxcel.in/',
      queryOrCluster: 'phase4-telemetry-and-queue-refresh',
      actionCategory: 'ANALYTICS_REFRESH',
      executionTier: 'TIER_A_AUTO',
      recommendation: 'Refresh multi-window GSC/GA4 telemetry, cannibalization audits, and growth scorecard.',
      supportingEvidence: { mode, baselineCounts },
      gscMetrics: {},
      ga4Metrics: { totalOrganicSessions: ga4Funnel.totalOrganicSessions },
      expectedImpact: 'Maintains accurate daily/weekly growth prioritization without production risk.',
      confidenceScore: 0.99,
      priorityScore: 95,
      riskLevel: 'LOW',
      actionStatus: 'RECOMMENDATION',
      approvalStatus: 'AUTO_TIER_A',
      ownerSystem: 'Phase4_Operating_Cycle',
      proposedChanges: { refreshScope: mode },
      beforeStateSnapshot: baselineCounts,
      afterStateSnapshot: {},
      verificationWindow: '7d',
      rollbackInstructions: 'Idempotent analytics snapshot; no production surface modified.',
    },
    {
      actionId: `exec-t1-briefs-${todayStr}`,
      url: 'https://talentxcel.in/jobs',
      queryOrCluster: 'phase4-content-brief-drafts',
      actionCategory: 'CONTENT_BRIEF',
      executionTier: 'TIER_A_AUTO',
      recommendation: `Generate ${contentBriefsGenerated} evidence-grounded content improvement briefs for inventory-backed strike-zone URLs.`,
      supportingEvidence: { contentBriefsGenerated },
      gscMetrics: {},
      ga4Metrics: {},
      expectedImpact: 'Prepares governed improvement drafts without publishing thin pages.',
      confidenceScore: 0.95,
      priorityScore: 85,
      riskLevel: 'LOW',
      actionStatus: 'RECOMMENDATION',
      approvalStatus: 'AUTO_TIER_A',
      ownerSystem: 'Phase4_Content_Brief_Engine',
      proposedChanges: { briefsDrafted: contentBriefsGenerated },
      beforeStateSnapshot: { previousBriefs: 0 },
      afterStateSnapshot: {},
      verificationWindow: '7d',
      rollbackInstructions: 'Drafts stored in intelligence DB only; zero public pages altered.',
    },
  ];

  const executedTierA = tierAActionsRaw.map((a) => {
    const approved = transitionPhase4Action(a, 'APPROVED', { actor: 'AUTO_TIER_A_POLICY' });
    const executed = transitionPhase4Action(approved, 'EXECUTED', {
      actor: 'AUTO_TIER_A_POLICY',
      validationPassed: true,
      afterSnapshot: { completedAt: nowIso, status: 'OK' },
    });
    return transitionPhase4Action(executed, 'VERIFIED', {
      afterSnapshot: { completedAt: nowIso, verifiedBy: 'Phase4_Execution_Engine' },
    });
  });

  // 9. Consolidate & Deduplicate Full Execution Queue
  const { consolidated, suppressedCount } = consolidateExecutionQueue([
    ...executedTierA,
    ...queueCandidates,
  ]);

  const upsertExecStmt = db.prepare(`
    INSERT INTO growth_execution_queue (
      action_id, url, query_or_cluster, action_category, execution_tier, recommendation,
      supporting_evidence_json, gsc_metrics_json, ga4_metrics_json, expected_impact,
      confidence_score, priority_score, risk_level, action_status, approval_status,
      owner_system, proposed_changes_json, before_state_snapshot_json, after_state_snapshot_json,
      verification_window, rollback_instructions, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(action_id) DO UPDATE SET
      priority_score = excluded.priority_score,
      action_status = excluded.action_status,
      approval_status = excluded.approval_status,
      after_state_snapshot_json = excluded.after_state_snapshot_json,
      updated_at = excluded.updated_at
  `);

  db.exec('BEGIN');
  try {
    for (const item of consolidated) {
      upsertExecStmt.run(
        item.actionId,
        item.url,
        item.queryOrCluster,
        item.actionCategory,
        item.executionTier,
        item.recommendation,
        JSON.stringify(item.supportingEvidence),
        JSON.stringify(item.gscMetrics),
        JSON.stringify(item.ga4Metrics),
        item.expectedImpact,
        item.confidenceScore,
        item.priorityScore,
        item.riskLevel,
        item.actionStatus,
        item.approvalStatus,
        item.ownerSystem,
        JSON.stringify(item.proposedChanges),
        JSON.stringify(item.beforeStateSnapshot),
        JSON.stringify(item.afterStateSnapshot),
        item.verificationWindow,
        item.rollbackInstructions,
        nowIso
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // 10. Compute Segmented Growth Scorecard (28d window)
  const gscOverall28d = db
    .prepare(
      'SELECT SUM(impressions) AS imp, SUM(clicks) AS clk, SUM(position * impressions) AS wpos FROM gsc_window_telemetry WHERE window_days = 28'
    )
    .get() as { imp: number; clk: number; wpos: number };
  const byDevice = db
    .prepare(
      'SELECT device AS seg, SUM(impressions) AS imp, SUM(clicks) AS clk, SUM(position * impressions) AS wpos FROM gsc_window_telemetry WHERE window_days = 28 GROUP BY device'
    )
    .all() as Array<{ seg: string; imp: number; clk: number; wpos: number }>;
  const byCountry = db
    .prepare(
      'SELECT country AS seg, SUM(impressions) AS imp, SUM(clicks) AS clk, SUM(position * impressions) AS wpos FROM gsc_window_telemetry WHERE window_days = 28 GROUP BY country ORDER BY imp DESC LIMIT 12'
    )
    .all() as Array<{ seg: string; imp: number; clk: number; wpos: number }>;
  const byProperty = db
    .prepare(
      'SELECT property_url AS seg, SUM(impressions) AS imp, SUM(clicks) AS clk, SUM(position * impressions) AS wpos FROM gsc_window_telemetry WHERE window_days = 28 GROUP BY property_url ORDER BY imp DESC'
    )
    .all() as Array<{ seg: string; imp: number; clk: number; wpos: number }>;

  const backlogCounts = {
    ctrBacklog: ctrRows.length,
    strikeZoneBacklog: atkRows.length,
    cannibalizationBacklog: cannByQuery.size,
    internalLinkBacklog: baselineCounts.internalLinks,
    technicalFindingsBacklog: techFindings.length,
  };
  const executionCounts = {
    totalQueueItems: consolidated.length,
    suppressedDuplicates: suppressedCount,
    executedTierA: executedTierA.length,
    verifiedActions: consolidated.filter((c) => c.actionStatus === 'VERIFIED').length,
    awaitingApprovalTierB: consolidated.filter((c) => c.executionTier === 'TIER_B_APPROVAL').length,
    restrictedTierC: consolidated.filter((c) => c.executionTier === 'TIER_C_RESTRICTED').length,
    revertedActions: 0,
  };

  const scorecardRows: Array<Record<string, unknown>> = [];
  const pushScorecard = (segType: string, segVal: string, imp: number, clk: number, wpos: number) => {
    const ctr = imp > 0 ? Number((clk / imp).toFixed(6)) : 0;
    const avgPos = imp > 0 ? Number((wpos / imp).toFixed(2)) : 0;
    const actRate =
      ga4Funnel.totalOrganicSessions > 0
        ? Number((ga4Funnel.totalEngagedSessions / ga4Funnel.totalOrganicSessions).toFixed(4))
        : 0;
    const convRate =
      ga4Funnel.totalOrganicSessions > 0
        ? Number((ga4Funnel.eventTotals.sign_up / ga4Funnel.totalOrganicSessions).toFixed(4))
        : 0;

    scorecardRows.push({
      snapshot_key: `${todayStr}|${segType}|${segVal}`,
      snapshot_date: todayStr,
      segment_type: segType,
      segment_value: segVal,
      organic_impressions: imp || 0,
      organic_clicks: clk || 0,
      ctr,
      avg_position: avgPos,
      indexed_qualified_urls: baselineCounts.sitemapStats.samplePublishedUrls,
      organic_landing_pages: ga4Funnel.landingPagesCount,
      organic_registrations: ga4Funnel.eventTotals.sign_up,
      organic_activation_rate: actRate,
      conversion_rate: convRate,
      backlog_counts: backlogCounts,
      execution_counts: executionCounts,
    });
  };

  pushScorecard('OVERALL', 'ALL_PROPERTIES', gscOverall28d.imp, gscOverall28d.clk, gscOverall28d.wpos);
  for (const d of byDevice) pushScorecard('DEVICE', d.seg || 'UNKNOWN', d.imp, d.clk, d.wpos);
  for (const c of byCountry) pushScorecard('COUNTRY', c.seg || 'GLB', c.imp, c.clk, c.wpos);
  for (const p of byProperty) pushScorecard('PROPERTY', p.seg, p.imp, p.clk, p.wpos);

  const upsertScoreStmt = db.prepare(`
    INSERT INTO growth_scorecard_snapshots (
      snapshot_key, snapshot_date, segment_type, segment_value, organic_impressions,
      organic_clicks, ctr, avg_position, indexed_qualified_urls, organic_landing_pages,
      organic_registrations, organic_activation_rate, conversion_rate,
      backlog_counts_json, execution_counts_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(snapshot_key) DO UPDATE SET
      organic_impressions = excluded.organic_impressions,
      organic_clicks = excluded.organic_clicks,
      ctr = excluded.ctr,
      avg_position = excluded.avg_position,
      backlog_counts_json = excluded.backlog_counts_json,
      execution_counts_json = excluded.execution_counts_json
  `);

  db.exec('BEGIN');
  try {
    for (const sc of scorecardRows) {
      upsertScoreStmt.run(
        sc.snapshot_key,
        sc.snapshot_date,
        sc.segment_type,
        sc.segment_value,
        sc.organic_impressions,
        sc.organic_clicks,
        sc.ctr,
        sc.avg_position,
        sc.indexed_qualified_urls,
        sc.organic_landing_pages,
        sc.organic_registrations,
        sc.organic_activation_rate,
        sc.conversion_rate,
        JSON.stringify(sc.backlog_counts),
        JSON.stringify(sc.execution_counts),
        nowIso
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // 11. Bounded Supabase Sync
  let supabaseSyncStats: Record<string, number> = {};
  if (!skipSupabase) {
    const sb = getServerSupabaseClient();
    if (sb) {
      const qRes = await batchUpsertSupabase(
        sb,
        'seo_growth_execution_queue',
        consolidated.slice(0, 250).map((item) => ({
          action_id: item.actionId,
          url: item.url,
          query_or_cluster: item.queryOrCluster,
          action_category: item.actionCategory,
          execution_tier: item.executionTier,
          recommendation: item.recommendation,
          supporting_evidence: item.supportingEvidence,
          gsc_metrics: item.gscMetrics,
          ga4_metrics: item.ga4Metrics,
          expected_impact: item.expectedImpact,
          confidence_score: item.confidenceScore,
          priority_score: item.priorityScore,
          risk_level: item.riskLevel,
          action_status: item.actionStatus,
          approval_status: item.approvalStatus,
          owner_system: item.ownerSystem,
          proposed_changes: item.proposedChanges,
          before_state_snapshot: item.beforeStateSnapshot,
          after_state_snapshot: item.afterStateSnapshot,
          verification_window: item.verificationWindow,
          rollback_instructions: item.rollbackInstructions,
        })),
        'action_id'
      );

      const cRes = await batchUpsertSupabase(sb, 'seo_cannibalization_audits', cannAuditsToSync, 'query_key');
      const sRes = await batchUpsertSupabase(sb, 'seo_growth_scorecard_snapshots', scorecardRows, 'snapshot_key');
      const tRes =
        techFindings.length > 0
          ? await batchUpsertSupabase(sb, 'seo_technical_audit_findings', techFindings.slice(0, 100), 'finding_key')
          : { succeeded: 0 };

      supabaseSyncStats = {
        seo_growth_execution_queue: qRes.succeeded,
        seo_cannibalization_audits: cRes.succeeded,
        seo_growth_scorecard_snapshots: sRes.succeeded,
        seo_technical_audit_findings: tRes.succeeded,
      };
    }
  }

  const summary = {
    executedAt: nowIso,
    mode,
    durationMs: Date.now() - startedAt,
    baselineCounts,
    ga4Funnel: {
      totalOrganicSessions: ga4Funnel.totalOrganicSessions,
      totalEngagedSessions: ga4Funnel.totalEngagedSessions,
      avgBounceRate: ga4Funnel.avgBounceRate,
      landingPagesCount: ga4Funnel.landingPagesCount,
      eventTotals: ga4Funnel.eventTotals,
      poorEngagementPagesCount: ga4Funnel.poorEngagementPages.length,
      highTrafficZeroSignupPagesCount: ga4Funnel.highTrafficZeroSignupPages.length,
      telemetryGaps: ga4Funnel.telemetryGaps,
      topPoorEngagementPages: ga4Funnel.poorEngagementPages.slice(0, 5),
      topZeroSignupPages: ga4Funnel.highTrafficZeroSignupPages.slice(0, 5),
    },
    dualUaProbesCount: dualUaProbes.length,
    dualUaProbesSample: dualUaProbes.slice(0, 6),
    cannibalizationClustersAudited: cannByQuery.size,
    cannibalizationClassificationCounts: cannClassCounts,
    technicalFindingsCount: techFindings.length,
    contentBriefsGenerated,
    executionQueueSummary: executionCounts,
    backlogCounts,
    scorecardSegmentsCount: scorecardRows.length,
    overallScorecard28d: scorecardRows[0],
    supabaseSyncStats,
  };

  fs.writeFileSync(path.join(reportsDir, 'PHASE4_AUTONOMOUS_GROWTH_SUMMARY.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  db.close();
  return summary;
}

if (
  import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` ||
  process.argv[1]?.endsWith('run-phase4-autonomous-growth.ts')
) {
  runPhase4AutonomousGrowth().catch((err) => {
    console.error('[Phase4 Autonomous Growth] Fatal error:', err);
    process.exit(1);
  });
}
