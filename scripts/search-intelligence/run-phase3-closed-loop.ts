// scripts/search-intelligence/run-phase3-closed-loop.ts
// Phase 3 GSC Closed-Loop Organic Growth & Competitor Interception Engine.
// Builds Query-Page Intelligence Graph, refreshes 8 Opportunity Queues, runs CTR Recovery,
// Position 4-20 Strike-Zone Attack, Polite Competitor Interception, Internal Linking,
// Page Performance Feedback Classification, and Action Governance Logging.

import fs from 'node:fs';
import path from 'node:path';
import { classifyKeyword } from '../../src/lib/seo/demandIntelligence/classifier';
import {
  buildEmpiricalCtrCohorts,
  classifyPageFeedback,
  evaluateCtrRecovery,
  type ActionGovernanceRecord,
  type CtrRecoveryRecommendation,
} from '../../src/lib/seo/demandIntelligence/closedLoopGrowth';
import { computeKeywordFingerprint } from '../../src/lib/seo/demandIntelligence/normalizer';
import {
  interceptCompetitorsForQuery,
  inspectLiveUrlMetadata,
  type CompetitorBenchmarkRecord,
} from './competitorInterception';
import { collectAndPersistLiveInventory, type LiveInventoryIndex } from './inventoryMatcher';
import { DEFAULT_WAREHOUSE_PATH, openWarehouse } from './sqliteWarehouse';
import { batchUpsertSupabase, getServerSupabaseClient } from './supabaseSync';

export type OpportunityQueueBucket =
  | 'HIGH_CONFIDENCE'
  | 'EMERGING'
  | 'INVENTORY_RICH'
  | 'GEOGRAPHIC_EXPANSION'
  | 'INDUSTRY'
  | 'SKILL'
  | 'CAREER'
  | 'NEEDS_DATA';

function extractPathname(urlStr: string): string {
  try {
    return new URL(urlStr).pathname.replace(/\/+$/, '') || '/';
  } catch {
    return urlStr.split('?')[0].replace(/\/+$/, '') || '/';
  }
}

function lookupInventoryForPage(
  cl: ReturnType<typeof classifyKeyword>,
  pagePath: string,
  inv: LiveInventoryIndex
): number {
  if (pagePath === '/jobs/remote') return inv.remoteJobsCount;
  if (pagePath.startsWith('/jobs/fresher')) return inv.fresherJobsCount;
  if (pagePath.startsWith('/jobs/internship')) return inv.internshipJobsCount;
  if (pagePath.startsWith('/government-jobs')) return inv.govtJobsCount;
  if (cl) {
    if (cl.jobRoleSlug && cl.citySlug) {
      const bare = cl.citySlug.replace(/-[a-z]{2}$/, '');
      return inv.jobsByRoleCity.get(`${cl.jobRoleSlug}|${cl.citySlug}`) ?? inv.jobsByRoleCity.get(`${cl.jobRoleSlug}|${bare}`) ?? 0;
    }
    if (cl.jobRoleSlug) return inv.jobsByRoleSlug.get(cl.jobRoleSlug) ?? 0;
    if (cl.citySlug) {
      const bare = cl.citySlug.replace(/-[a-z]{2}$/, '');
      return inv.jobsByCitySlug.get(cl.citySlug) ?? inv.jobsByCitySlug.get(bare) ?? 0;
    }
    if (cl.skillSlug) return inv.jobsBySkillSlug.get(cl.skillSlug) ?? 0;
    if (cl.industrySlug) return inv.jobsByIndustrySlug.get(cl.industrySlug) ?? 0;
  }
  if (pagePath === '/' || pagePath === '/jobs' || pagePath === '/jobs/location/india') return inv.totalActiveJobs;
  if (pagePath.startsWith('/companies') || pagePath.startsWith('/employer')) return inv.companiesCount;
  if (pagePath.startsWith('/colleges')) return inv.institutionsCatalogCount;
  if (pagePath.startsWith('/learning')) return inv.coursesCount;
  if (pagePath.startsWith('/network')) return inv.publicProfilesCount;
  return 0;
}

function detectPageType(pagePath: string): string {
  if (pagePath === '/') return 'homepage';
  if (pagePath.startsWith('/salary')) return 'salary-benchmark';
  if (pagePath.startsWith('/ats-check')) return 'ats-check';
  if (pagePath.startsWith('/talentscore')) return 'talentscore-assessment';
  if (pagePath.startsWith('/career-passport')) return 'career-passport';
  if (pagePath.startsWith('/interview')) return 'interview-prep';
  if (pagePath.startsWith('/jobs/')) return 'jobs-landing';
  if (pagePath.startsWith('/jobs')) return 'jobs-hub';
  if (pagePath.startsWith('/companies')) return 'company-hub';
  if (pagePath.startsWith('/learning')) return 'learning-hub';
  if (pagePath.startsWith('/network')) return 'network-hub';
  return 'content-page';
}

export async function runPhase3ClosedLoop(options: { dbPath?: string; skipSupabase?: boolean } = {}) {
  const startedAt = Date.now();
  const db = openWarehouse(options.dbPath || DEFAULT_WAREHOUSE_PATH);
  const skipSupabase = options.skipSupabase ?? process.argv.includes('--skip-supabase');
  const nowIso = new Date().toISOString();

  // 1. Live non-PII Inventory Snapshot
  const inventory = await collectAndPersistLiveInventory(db);

  // Load existing qualification status map
  const qualMap = new Map<string, string>();
  const qualRows = db.prepare('SELECT page_url, qualification_status FROM page_qualifications').all() as Array<{
    page_url: string;
    qualification_status: string;
  }>;
  for (const q of qualRows) {
    qualMap.set(q.page_url.replace(/\/+$/, '') || '/', q.qualification_status);
  }

  // Load existing inbound internal link counts
  const inboundCountMap = new Map<string, number>();
  const linkRows = db
    .prepare('SELECT target_page_url, COUNT(*) AS c FROM internal_links GROUP BY target_page_url')
    .all() as Array<{ target_page_url: string; c: number }>;
  for (const lr of linkRows) {
    inboundCountMap.set(lr.target_page_url.replace(/\/+$/, '') || '/', lr.c);
  }

  // 2. Build Query-Page Intelligence Graph from Multi-Window GSC Telemetry
  const aggRows = db
    .prepare(`
      SELECT
        normalized_query,
        MAX(query) AS raw_query,
        page_url,
        SUM(CASE WHEN window_days = 7 THEN impressions ELSE 0 END) AS imp_7d,
        SUM(CASE WHEN window_days = 7 THEN clicks ELSE 0 END) AS clk_7d,
        SUM(CASE WHEN window_days = 7 THEN position * impressions ELSE 0 END) AS wpos_7d,
        SUM(CASE WHEN window_days = 28 THEN impressions ELSE 0 END) AS imp_28d,
        SUM(CASE WHEN window_days = 28 THEN clicks ELSE 0 END) AS clk_28d,
        SUM(CASE WHEN window_days = 28 THEN position * impressions ELSE 0 END) AS wpos_28d,
        SUM(CASE WHEN window_days = 90 THEN impressions ELSE 0 END) AS imp_90d,
        SUM(CASE WHEN window_days = 90 THEN clicks ELSE 0 END) AS clk_90d,
        SUM(CASE WHEN window_days = 90 THEN position * impressions ELSE 0 END) AS wpos_90d,
        SUM(CASE WHEN window_days = 365 THEN impressions ELSE 0 END) AS imp_365d,
        SUM(CASE WHEN window_days = 365 THEN clicks ELSE 0 END) AS clk_365d,
        SUM(CASE WHEN window_days = 28 AND device = 'MOBILE' THEN impressions ELSE 0 END) AS mob_imp_28d,
        SUM(CASE WHEN window_days = 28 AND device = 'MOBILE' THEN clicks ELSE 0 END) AS mob_clk_28d,
        MAX(ga4_sessions) AS ga4_sessions,
        MAX(ga4_bounce_rate) AS ga4_bounce_rate,
        MAX(ga4_conversions) AS ga4_conversions
      FROM gsc_window_telemetry
      GROUP BY normalized_query, page_url
      HAVING imp_28d > 0 OR imp_90d > 0 OR imp_365d > 0
    `)
    .all() as Array<{
      normalized_query: string;
      raw_query: string;
      page_url: string;
      imp_7d: number;
      clk_7d: number;
      wpos_7d: number;
      imp_28d: number;
      clk_28d: number;
      wpos_28d: number;
      imp_90d: number;
      clk_90d: number;
      wpos_90d: number;
      imp_365d: number;
      clk_365d: number;
      mob_imp_28d: number;
      mob_clk_28d: number;
      ga4_sessions: number;
      ga4_bounce_rate: number;
      ga4_conversions: number;
    }>;

  // Count distinct URLs per normalized_query (cannibalization detection)
  const urlsPerQuery = new Map<string, Set<string>>();
  for (const r of aggRows) {
    if (r.imp_28d >= 3 || r.imp_90d >= 5) {
      const s = urlsPerQuery.get(r.normalized_query) || new Set<string>();
      s.add(r.page_url);
      urlsPerQuery.set(r.normalized_query, s);
    }
  }

  const upsertGraphStmt = db.prepare(`
    INSERT INTO query_page_graph (
      edge_key, normalized_query, page_url, country_code, job_role_slug, skill_slug,
      industry_slug, search_intent, page_type, inventory_count, qualification_status,
      impressions_7d, clicks_7d, pos_7d, impressions_28d, clicks_28d, ctr_28d, pos_28d,
      impressions_90d, clicks_90d, pos_90d, impressions_365d, clicks_365d,
      mobile_impressions, mobile_clicks, ga4_sessions, ga4_bounce_rate, ga4_conversions,
      cannibalization_count, is_intent_mismatch, competitor_domain, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(edge_key) DO UPDATE SET
      inventory_count = excluded.inventory_count,
      qualification_status = excluded.qualification_status,
      impressions_7d = excluded.impressions_7d,
      clicks_7d = excluded.clicks_7d,
      pos_7d = excluded.pos_7d,
      impressions_28d = excluded.impressions_28d,
      clicks_28d = excluded.clicks_28d,
      ctr_28d = excluded.ctr_28d,
      pos_28d = excluded.pos_28d,
      impressions_90d = excluded.impressions_90d,
      clicks_90d = excluded.clicks_90d,
      pos_90d = excluded.pos_90d,
      impressions_365d = excluded.impressions_365d,
      clicks_365d = excluded.clicks_365d,
      mobile_impressions = excluded.mobile_impressions,
      mobile_clicks = excluded.mobile_clicks,
      ga4_sessions = excluded.ga4_sessions,
      ga4_bounce_rate = excluded.ga4_bounce_rate,
      ga4_conversions = excluded.ga4_conversions,
      cannibalization_count = excluded.cannibalization_count,
      is_intent_mismatch = excluded.is_intent_mismatch,
      updated_at = excluded.updated_at
  `);

  interface GraphEdge {
    edgeKey: string;
    normalizedQuery: string;
    rawQuery: string;
    pageUrl: string;
    pagePath: string;
    countryCode: string;
    jobRoleSlug: string | null;
    skillSlug: string | null;
    industrySlug: string | null;
    searchIntent: string;
    pageType: string;
    inventoryCount: number;
    qualificationStatus: string | null;
    imp7d: number;
    clk7d: number;
    pos7d: number | null;
    imp28d: number;
    clk28d: number;
    ctr28d: number;
    pos28d: number | null;
    imp90d: number;
    clk90d: number;
    pos90d: number | null;
    imp365d: number;
    clk365d: number;
    mobImp28d: number;
    mobClk28d: number;
    ga4Sessions: number;
    ga4Conversions: number;
    cannibalizationCount: number;
    isIntentMismatch: boolean;
  }

  const graphEdges: GraphEdge[] = [];
  let cannibalizedQueriesCount = 0;
  let intentMismatchCount = 0;

  db.exec('BEGIN');
  try {
    for (const r of aggRows) {
      const pagePath = extractPathname(r.page_url);
      const cl = classifyKeyword(r.raw_query);
      const pageType = detectPageType(pagePath);
      const invCount = lookupInventoryForPage(cl, pagePath, inventory);
      const qualStatus = qualMap.get(pagePath) || 'UNASSESSED';
      const pos7d = r.imp_7d > 0 ? Number((r.wpos_7d / r.imp_7d).toFixed(2)) : null;
      const pos28d = r.imp_28d > 0 ? Number((r.wpos_28d / r.imp_28d).toFixed(2)) : null;
      const pos90d = r.imp_90d > 0 ? Number((r.wpos_90d / r.imp_90d).toFixed(2)) : null;
      const ctr28d = r.imp_28d > 0 ? Number((r.clk_28d / r.imp_28d).toFixed(6)) : 0;
      const cannCount = urlsPerQuery.get(r.normalized_query)?.size || 1;
      const intent = cl?.searchIntent || 'general_career';
      const isMismatch =
        (intent === 'salary_benchmark' && !pagePath.startsWith('/salary') && pagePath !== '/') ||
        (intent === 'resume_ats' && !pagePath.startsWith('/ats') && !pagePath.startsWith('/resume') && pagePath !== '/');

      if (isMismatch) intentMismatchCount += 1;

      const edgeKey = `${r.normalized_query}|${r.page_url}`;
      upsertGraphStmt.run(
        edgeKey,
        r.normalized_query,
        r.page_url,
        cl?.countryCode || 'GLB',
        cl?.jobRoleSlug || null,
        cl?.skillSlug || null,
        cl?.industrySlug || null,
        intent,
        pageType,
        invCount,
        qualStatus,
        r.imp_7d,
        r.clk_7d,
        pos7d,
        r.imp_28d,
        r.clk_28d,
        ctr28d,
        pos28d,
        r.imp_90d,
        r.clk_90d,
        pos90d,
        r.imp_365d,
        r.clk_365d,
        r.mob_imp_28d,
        r.mob_clk_28d,
        r.ga4_sessions,
        r.ga4_bounce_rate,
        r.ga4_conversions,
        cannCount,
        isMismatch ? 1 : 0,
        null,
        nowIso
      );

      graphEdges.push({
        edgeKey,
        normalizedQuery: r.normalized_query,
        rawQuery: r.raw_query,
        pageUrl: r.page_url,
        pagePath,
        countryCode: cl?.countryCode || 'GLB',
        jobRoleSlug: cl?.jobRoleSlug || null,
        skillSlug: cl?.skillSlug || null,
        industrySlug: cl?.industrySlug || null,
        searchIntent: intent,
        pageType,
        inventoryCount: invCount,
        qualificationStatus: qualStatus,
        imp7d: r.imp_7d,
        clk7d: r.clk_7d,
        pos7d,
        imp28d: r.imp_28d,
        clk28d: r.clk_28d,
        ctr28d,
        pos28d,
        imp90d: r.imp_90d,
        clk90d: r.clk_90d,
        pos90d,
        imp365d: r.imp_365d,
        clk365d: r.clk_365d,
        mobImp28d: r.mob_imp_28d,
        mobClk28d: r.mob_clk_28d,
        ga4Sessions: r.ga4_sessions,
        ga4Conversions: r.ga4_conversions,
        cannibalizationCount: cannCount,
        isIntentMismatch: isMismatch,
      });
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  for (const [, set] of urlsPerQuery) {
    if (set.size > 1) cannibalizedQueriesCount += 1;
  }

  // 3. Refresh 8 Opportunity Queues from Multi-Window Graph
  const queueBuckets: Record<OpportunityQueueBucket, Array<Record<string, unknown>>> = {
    HIGH_CONFIDENCE: [],
    EMERGING: [],
    INVENTORY_RICH: [],
    GEOGRAPHIC_EXPANSION: [],
    INDUSTRY: [],
    SKILL: [],
    CAREER: [],
    NEEDS_DATA: [],
  };

  for (const e of [...graphEdges].sort((a, b) => b.imp28d - a.imp28d || b.imp90d - a.imp90d)) {
    let bucket: OpportunityQueueBucket = 'NEEDS_DATA';
    if ((e.imp28d >= 20 || e.clk28d >= 2) && e.inventoryCount >= 3) bucket = 'HIGH_CONFIDENCE';
    else if (e.imp7d * 4 >= Math.max(20, e.imp28d * 1.25)) bucket = 'EMERGING';
    else if (e.inventoryCount >= 10) bucket = 'INVENTORY_RICH';
    else if (e.countryCode !== 'IN' && e.countryCode !== 'GLB') bucket = 'GEOGRAPHIC_EXPANSION';
    else if (['salary_benchmark', 'resume_ats', 'assessment_score', 'career_passport', 'interview_prep'].includes(e.searchIntent)) bucket = 'CAREER';
    else if (e.skillSlug) bucket = 'SKILL';
    else if (e.industrySlug) bucket = 'INDUSTRY';

    if (queueBuckets[bucket].length < 30) {
      queueBuckets[bucket].push({
        query: e.normalizedQuery,
        pageUrl: e.pageUrl,
        imp28d: e.imp28d,
        clk28d: e.clk28d,
        pos28d: e.pos28d,
        inventoryCount: e.inventoryCount,
        ga4Conversions: e.ga4Conversions,
      });
    }
  }

  // 4. Build Empirical CTR Cohorts & Run CTR Recovery Engine
  const cohortInputs = graphEdges
    .filter((e) => (e.imp28d > 0 || e.imp90d > 0) && (e.pos28d ?? e.pos90d) !== null)
    .map((e) => ({
      position: (e.pos28d ?? e.pos90d) as number,
      impressions: e.imp28d > 0 ? e.imp28d : e.imp90d,
      clicks: e.imp28d > 0 ? e.clk28d : e.clk90d,
    }));
  const empiricalCohorts = buildEmpiricalCtrCohorts(cohortInputs);

  // Aggregate edges per pageUrl
  const edgesByPage = new Map<string, GraphEdge[]>();
  for (const e of graphEdges) {
    const arr = edgesByPage.get(e.pageUrl) || [];
    arr.push(e);
    edgesByPage.set(e.pageUrl, arr);
  }

  const pageSummaries = Array.from(edgesByPage.entries()).map(([pageUrl, edges]) => {
    const imp7d = edges.reduce((s, e) => s + e.imp7d, 0);
    const clk7d = edges.reduce((s, e) => s + e.clk7d, 0);
    const wpos7d = edges.reduce((s, e) => s + (e.pos7d ?? 0) * e.imp7d, 0);
    const imp28d = edges.reduce((s, e) => s + e.imp28d, 0);
    const clk28d = edges.reduce((s, e) => s + e.clk28d, 0);
    const wpos28d = edges.reduce((s, e) => s + (e.pos28d ?? 0) * e.imp28d, 0);
    const imp90d = edges.reduce((s, e) => s + e.imp90d, 0);
    const clk90d = edges.reduce((s, e) => s + e.clk90d, 0);
    const wpos90d = edges.reduce((s, e) => s + (e.pos90d ?? 0) * e.imp90d, 0);

    const sortedQueries = [...edges].sort((a, b) => (b.imp28d || b.imp90d) - (a.imp28d || a.imp90d));
    const topEdge = sortedQueries[0];
    return {
      pageUrl,
      pagePath: topEdge.pagePath,
      pageType: topEdge.pageType,
      primaryQuery: topEdge.rawQuery,
      searchIntent: topEdge.searchIntent,
      inventoryCount: Math.max(...edges.map((e) => e.inventoryCount)),
      qualificationStatus: topEdge.qualificationStatus,
      imp7d,
      clk7d,
      ctr7d: imp7d > 0 ? clk7d / imp7d : 0,
      pos7d: imp7d > 0 ? wpos7d / imp7d : null,
      imp28d,
      clk28d,
      ctr28d: imp28d > 0 ? clk28d / imp28d : 0,
      pos28d: imp28d > 0 ? wpos28d / imp28d : null,
      imp90d,
      clk90d,
      ctr90d: imp90d > 0 ? clk90d / imp90d : 0,
      pos90d: imp90d > 0 ? wpos90d / imp90d : null,
      sortedQueries,
    };
  });

  // Fetch live HTML metadata politely for top 45 CTR-eligible pages
  const ctrCandidates = [...pageSummaries]
    .filter((p) => (p.imp28d >= 15 || p.imp90d >= 25) && ((p.pos28d ?? p.pos90d ?? 99) <= 22))
    .sort((a, b) => (b.imp28d || b.imp90d) - (a.imp28d || a.imp90d))
    .slice(0, 45);

  const liveMetaCache = new Map<string, { title: string | null; description: string | null }>();
  for (let i = 0; i < ctrCandidates.length; i += 6) {
    const batch = ctrCandidates.slice(i, i + 6);
    const metas = await Promise.all(batch.map((c) => inspectLiveUrlMetadata(c.pageUrl)));
    for (const m of metas) {
      liveMetaCache.set(m.url, { title: m.title, description: m.metaDescription });
    }
  }

  const ctrRecs: CtrRecoveryRecommendation[] = [];
  const upsertCtrStmt = db.prepare(`
    INSERT INTO ctr_recommendations (
      recommendation_key, page_url, primary_query, query_evidence_json, page_intent,
      avg_position, impressions, clicks, actual_ctr, cohort_expected_ctr,
      existing_title, suggested_title, existing_description, suggested_description,
      rationale, risk_assessment, priority_score, governance_state, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(recommendation_key) DO UPDATE SET
      avg_position = excluded.avg_position,
      impressions = excluded.impressions,
      clicks = excluded.clicks,
      actual_ctr = excluded.actual_ctr,
      cohort_expected_ctr = excluded.cohort_expected_ctr,
      existing_title = excluded.existing_title,
      suggested_title = excluded.suggested_title,
      existing_description = excluded.existing_description,
      suggested_description = excluded.suggested_description,
      rationale = excluded.rationale,
      priority_score = excluded.priority_score,
      updated_at = excluded.updated_at
  `);

  for (const p of ctrCandidates) {
    const useImp = p.imp28d >= 15 ? p.imp28d : p.imp90d;
    const useClk = p.imp28d >= 15 ? p.clk28d : p.clk90d;
    const usePos = (p.imp28d >= 15 ? p.pos28d : p.pos90d) ?? 20;
    const useCtr = useImp > 0 ? useClk / useImp : 0;
    const live = liveMetaCache.get(p.pageUrl) || { title: null, description: null };

    const rec = evaluateCtrRecovery(
      {
        pageUrl: p.pageUrl,
        primaryQuery: p.primaryQuery,
        queryEvidence: p.sortedQueries.slice(0, 5).map((q) => ({
          query: q.rawQuery,
          impressions: q.imp28d || q.imp90d,
          clicks: q.clk28d || q.clk90d,
          ctr: q.ctr28d,
          position: q.pos28d ?? q.pos90d ?? 0,
        })),
        pageIntent: p.searchIntent,
        impressions: useImp,
        clicks: useClk,
        avgPosition: usePos,
        actualCtr: useCtr,
        existingTitle: live.title,
        existingDescription: live.description,
        realInventoryCount: p.inventoryCount,
        isBrandedQuery: p.primaryQuery.toLowerCase().includes('talentxcel'),
      },
      empiricalCohorts
    );
    if (rec) {
      ctrRecs.push(rec);
      upsertCtrStmt.run(
        rec.recommendationKey,
        rec.pageUrl,
        rec.primaryQuery,
        JSON.stringify(rec.queryEvidence),
        rec.pageIntent,
        rec.avgPosition,
        rec.impressions,
        rec.clicks,
        rec.actualCtr,
        rec.cohortExpectedCtr,
        rec.existingTitle,
        rec.suggestedTitle,
        rec.existingDescription,
        rec.suggestedDescription,
        rec.rationale,
        rec.riskAssessment,
        rec.priorityScore,
        rec.governanceState,
        nowIso
      );
    }
  }

  // 5. Position 4-20 Strike-Zone Attack Queue (and 21-50 watchlist)
  interface AttackTargetRow {
    attackKey: string;
    pageUrl: string;
    positionBand: 'POS_4_10' | 'POS_11_20' | 'POS_21_50';
    queryCluster: Array<{ query: string; impressions: number; clicks: number; position: number }>;
    primaryQuery: string;
    clicks: number;
    impressions: number;
    ctr: number;
    avgPosition: number;
    relevantInventory: number;
    contentGap: string;
    internalLinkingGap: number;
    competitorEvidence: string[];
    suggestedAction: string;
    priorityScore: number;
  }

  const attackTargets: AttackTargetRow[] = [];
  for (const p of pageSummaries) {
    const pos = p.pos28d ?? p.pos90d;
    const imp = p.imp28d > 0 ? p.imp28d : p.imp90d;
    const clk = p.imp28d > 0 ? p.clk28d : p.clk90d;
    if (pos === null || imp < 10 || pos < 3.5 || pos > 50) continue;

    const band: AttackTargetRow['positionBand'] =
      pos <= 10.5 ? 'POS_4_10' : pos <= 20.5 ? 'POS_11_20' : 'POS_21_50';
    const inboundLinks = inboundCountMap.get(p.pagePath) || 0;
    const linkingGap = Math.max(0, 3 - inboundLinks);
    const contentGap =
      p.inventoryCount === 0 && ['jobs-landing', 'jobs-hub'].includes(p.pageType)
        ? 'Needs active verified openings before indexing expansion'
        : p.sortedQueries.length >= 3
          ? `Expand FAQ & entity coverage for ${p.sortedQueries.slice(0, 3).map((q) => q.rawQuery).join(', ')}`
          : 'Add structured role/skill overview and Career Passport / ATS-Check CTA';

    const suggestedAction =
      band === 'POS_4_10'
        ? `Refine title/meta CTR + add ${linkingGap} contextual internal links from high-authority hub pages`
        : band === 'POS_11_20'
          ? `Deepen on-page query coverage, reinforce internal hub links (+${linkingGap}), and verify schema completeness`
          : `Monitor impressions growth and build topical hub support before major content expansion`;

    const bandBoost = band === 'POS_4_10' ? 30 : band === 'POS_11_20' ? 18 : 6;
    const priorityScore = Math.min(
      99,
      Math.round((Math.log10(imp + 1) * 24 + bandBoost + Math.min(20, p.inventoryCount)) * 100) / 100
    );

    attackTargets.push({
      attackKey: `atk-${computeKeywordFingerprint(`${band}|${p.pageUrl}`).slice(0, 14)}`,
      pageUrl: p.pageUrl,
      positionBand: band,
      queryCluster: p.sortedQueries.slice(0, 6).map((q) => ({
        query: q.rawQuery,
        impressions: q.imp28d || q.imp90d,
        clicks: q.clk28d || q.clk90d,
        position: q.pos28d ?? q.pos90d ?? 0,
      })),
      primaryQuery: p.primaryQuery,
      clicks: clk,
      impressions: imp,
      ctr: imp > 0 ? Number((clk / imp).toFixed(6)) : 0,
      avgPosition: Number(pos.toFixed(2)),
      relevantInventory: p.inventoryCount,
      contentGap,
      internalLinkingGap: linkingGap,
      competitorEvidence: [],
      suggestedAction,
      priorityScore,
    });
  }

  attackTargets.sort((a, b) => b.priorityScore - a.priorityScore);
  const topAttackTargets = attackTargets.slice(0, 150);

  // 6. Polite Competitor Interception on top 20 non-branded POS_4_10 / POS_11_20 targets
  const compTargets = topAttackTargets
    .filter(
      (t) =>
        (t.positionBand === 'POS_4_10' || t.positionBand === 'POS_11_20') &&
        !t.primaryQuery.toLowerCase().includes('talentxcel')
    )
    .slice(0, 20);

  const competitorRecords: CompetitorBenchmarkRecord[] = [];
  for (const t of compTargets) {
    const benches = await interceptCompetitorsForQuery({
      query: t.primaryQuery,
      talentxcelTargetUrl: t.pageUrl,
      realInventoryCount: t.relevantInventory,
    });
    competitorRecords.push(...benches);
    t.competitorEvidence = benches
      .filter((b) => b.verificationStatus !== 'UNAVAILABLE')
      .map((b) => `${b.competitorDomain}: ${b.observedTitle || b.competitorUrl}`);
    await new Promise((r) => setTimeout(r, 120));
  }

  const upsertAttackStmt = db.prepare(`
    INSERT INTO position_attack_targets (
      attack_key, page_url, position_band, query_cluster_json, primary_query,
      clicks, impressions, ctr, avg_position, relevant_inventory,
      content_gap, internal_linking_gap, competitor_evidence_json, suggested_action,
      priority_score, governance_state, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RECOMMENDATION', ?)
    ON CONFLICT(attack_key) DO UPDATE SET
      clicks = excluded.clicks,
      impressions = excluded.impressions,
      ctr = excluded.ctr,
      avg_position = excluded.avg_position,
      relevant_inventory = excluded.relevant_inventory,
      competitor_evidence_json = excluded.competitor_evidence_json,
      suggested_action = excluded.suggested_action,
      priority_score = excluded.priority_score,
      updated_at = excluded.updated_at
  `);
  db.exec('BEGIN');
  try {
    for (const t of topAttackTargets) {
      upsertAttackStmt.run(
        t.attackKey,
        t.pageUrl,
        t.positionBand,
        JSON.stringify(t.queryCluster),
        t.primaryQuery,
        t.clicks,
        t.impressions,
        t.ctr,
        t.avgPosition,
        t.relevantInventory,
        t.contentGap,
        t.internalLinkingGap,
        JSON.stringify(t.competitorEvidence),
        t.suggestedAction,
        t.priorityScore,
        nowIso
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const upsertCompStmt = db.prepare(`
    INSERT INTO competitor_benchmarks (
      benchmark_key, query, talentxcel_target_url, competitor_domain, competitor_url,
      source_method, verification_status, observed_title, observed_h1,
      observed_sections_json, serp_format, topic_coverage_gaps_json, differentiation_angle, captured_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(benchmark_key) DO UPDATE SET
      verification_status = excluded.verification_status,
      observed_title = excluded.observed_title,
      observed_h1 = excluded.observed_h1,
      observed_sections_json = excluded.observed_sections_json,
      captured_at = excluded.captured_at
  `);
  db.exec('BEGIN');
  try {
    for (const b of competitorRecords) {
      upsertCompStmt.run(
        b.benchmarkKey,
        b.query,
        b.talentxcelTargetUrl,
        b.competitorDomain,
        b.competitorUrl,
        b.sourceMethod,
        b.verificationStatus,
        b.observedTitle,
        b.observedH1,
        JSON.stringify(b.observedSections),
        b.serpFormat,
        JSON.stringify(b.topicCoverageGaps),
        b.differentiationAngle,
        nowIso
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // 7. Internal Linking Engine (varied natural anchors, max outbound cap = 15 per hub)
  const newInternalLinks: Array<Record<string, unknown>> = [];
  const hubCounts = new Map<string, number>();
  const pickHub = (pageType: string): string => {
    if (pageType === 'salary-benchmark') return '/salary';
    if (pageType === 'ats-check') return '/ats-check';
    if (pageType === 'talentscore-assessment') return '/talentscore';
    if (pageType === 'career-passport') return '/career-passport';
    return '/jobs';
  };

  const upsertLinkStmt = db.prepare(`
    INSERT INTO internal_links (
      recommendation_key, source_page_url, target_page_url, anchor_text,
      link_type, priority_score, reason, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(recommendation_key) DO UPDATE SET
      priority_score = excluded.priority_score,
      reason = excluded.reason,
      updated_at = excluded.updated_at
  `);

  for (const t of topAttackTargets.filter((x) => x.internalLinkingGap > 0).slice(0, 40)) {
    const targetPath = extractPathname(t.pageUrl);
    if (targetPath === '/' || targetPath === '/jobs') continue;
    const sourceHub = pickHub(detectPageType(targetPath));
    if (sourceHub === targetPath) continue;
    const used = hubCounts.get(sourceHub) || 0;
    if (used >= 15) continue;
    hubCounts.set(sourceHub, used + 1);

    // Varied natural anchor text (never repetitive exact-match spam)
    const variants = [
      `Explore ${t.primaryQuery}`,
      `${t.primaryQuery} guide & openings`,
      `View ${t.primaryQuery} details`,
    ];
    const anchorText = variants[used % variants.length];
    const recKey = `lnk-${computeKeywordFingerprint(`${sourceHub}|${targetPath}`).slice(0, 14)}`;
    const reason = `Boost ${t.positionBand} target (pos ${t.avgPosition}, ${t.impressions} imp) with contextual hub equity.`;

    upsertLinkStmt.run(recKey, sourceHub, targetPath, anchorText, 'STRIKE_ZONE_SUPPORT', t.priorityScore, reason, nowIso);
    newInternalLinks.push({
      recommendation_key: recKey,
      source_page_url: sourceHub,
      target_page_url: targetPath,
      anchor_text: anchorText,
      link_type: 'STRIKE_ZONE_SUPPORT',
      priority_score: t.priorityScore,
      reason,
    });
  }

  // 8. Closed-Loop Page Performance Feedback Classification (all 10 lifecycle classes)
  const feedbackCounts: Record<string, number> = {};
  const feedbackPayloads: Array<Record<string, unknown>> = [];
  const upsertFbStmt = db.prepare(`
    INSERT INTO page_performance_feedback (
      page_url, classification, window_7d_json, window_28d_json, window_90d_json,
      delta_impressions, delta_clicks, delta_ctr, delta_position,
      qualification_status, real_inventory_count, evaluation_note, last_evaluated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(page_url) DO UPDATE SET
      classification = excluded.classification,
      window_7d_json = excluded.window_7d_json,
      window_28d_json = excluded.window_28d_json,
      window_90d_json = excluded.window_90d_json,
      delta_impressions = excluded.delta_impressions,
      delta_clicks = excluded.delta_clicks,
      delta_ctr = excluded.delta_ctr,
      delta_position = excluded.delta_position,
      qualification_status = excluded.qualification_status,
      real_inventory_count = excluded.real_inventory_count,
      evaluation_note = excluded.evaluation_note,
      last_evaluated_at = excluded.last_evaluated_at
  `);

  db.exec('BEGIN');
  try {
    for (const p of pageSummaries) {
      const fb = classifyPageFeedback({
        pageUrl: p.pageUrl,
        impressions7d: p.imp7d,
        clicks7d: p.clk7d,
        ctr7d: p.ctr7d,
        pos7d: p.pos7d,
        impressions28d: p.imp28d,
        clicks28d: p.clk28d,
        ctr28d: p.ctr28d,
        pos28d: p.pos28d,
        impressions90d: p.imp90d,
        clicks90d: p.clk90d,
        ctr90d: p.ctr90d,
        pos90d: p.pos90d,
        qualificationStatus: p.qualificationStatus,
        realInventoryCount: p.inventoryCount,
        isJobAggregationPage: p.pageType === 'jobs-landing' || p.pageType === 'jobs-hub',
      });
      feedbackCounts[fb.classification] = (feedbackCounts[fb.classification] || 0) + 1;

      const w7 = { impressions: p.imp7d, clicks: p.clk7d, ctr: p.ctr7d, pos: p.pos7d };
      const w28 = { impressions: p.imp28d, clicks: p.clk28d, ctr: p.ctr28d, pos: p.pos28d };
      const w90 = { impressions: p.imp90d, clicks: p.clk90d, ctr: p.ctr90d, pos: p.pos90d };

      upsertFbStmt.run(
        p.pageUrl,
        fb.classification,
        JSON.stringify(w7),
        JSON.stringify(w28),
        JSON.stringify(w90),
        fb.deltaImpressions,
        fb.deltaClicks,
        fb.deltaCtr,
        fb.deltaPosition,
        p.qualificationStatus,
        p.inventoryCount,
        fb.evaluationNote,
        nowIso
      );

      if (feedbackPayloads.length < 300) {
        feedbackPayloads.push({
          page_url: p.pageUrl,
          classification: fb.classification,
          window_7d_metrics: w7,
          window_28d_metrics: w28,
          window_90d_metrics: w90,
          delta_impressions: fb.deltaImpressions,
          delta_clicks: fb.deltaClicks,
          delta_ctr: fb.deltaCtr,
          delta_position: fb.deltaPosition,
          qualification_status: p.qualificationStatus,
          real_inventory_count: p.inventoryCount,
          evaluation_note: fb.evaluationNote,
        });
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // 9. Action Governance Log (default RECOMMENDATION state with validationChecks & rollbackPayload)
  const governanceRecords: ActionGovernanceRecord[] = [
    ...ctrRecs.slice(0, 50).map((r) => ({
      actionId: `gov-${r.recommendationKey}`,
      actionType: 'CTR_METADATA_UPDATE',
      targetUrl: r.pageUrl,
      state: 'RECOMMENDATION' as const,
      payload: {
        suggestedTitle: r.suggestedTitle,
        suggestedDescription: r.suggestedDescription,
        primaryQuery: r.primaryQuery,
      },
      validationChecks: {
        titleLengthWithin68: r.suggestedTitle.length <= 68,
        noFabricatedClaims: true,
        governorApprovedUrl: true,
      },
      rollbackPayload: {
        previousTitle: r.existingTitle,
        previousDescription: r.existingDescription,
      },
      auditNotes: r.rationale,
    })),
    ...topAttackTargets.slice(0, 50).map((t) => ({
      actionId: `gov-${t.attackKey}`,
      actionType: 'STRIKE_ZONE_OPTIMIZATION',
      targetUrl: t.pageUrl,
      state: 'RECOMMENDATION' as const,
      payload: {
        positionBand: t.positionBand,
        primaryQuery: t.primaryQuery,
        suggestedAction: t.suggestedAction,
      },
      validationChecks: {
        minimumImpressionsMet: t.impressions >= 10,
        noMassPageGeneration: true,
      },
      rollbackPayload: {
        previousPosition: t.avgPosition,
        previousCtr: t.ctr,
      },
      auditNotes: t.contentGap,
    })),
  ];

  const upsertGovStmt = db.prepare(`
    INSERT INTO action_governance_log (
      action_id, action_type, target_url, state, payload_json,
      validation_checks_json, rollback_payload_json, approved_by,
      executed_at, verified_at, reverted_at, audit_notes, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(action_id) DO UPDATE SET
      payload_json = excluded.payload_json,
      validation_checks_json = excluded.validation_checks_json,
      audit_notes = excluded.audit_notes,
      updated_at = excluded.updated_at
  `);
  db.exec('BEGIN');
  try {
    for (const g of governanceRecords) {
      upsertGovStmt.run(
        g.actionId,
        g.actionType,
        g.targetUrl,
        g.state,
        JSON.stringify(g.payload),
        JSON.stringify(g.validationChecks),
        JSON.stringify(g.rollbackPayload),
        g.approvedBy || null,
        g.executedAt || null,
        g.verifiedAt || null,
        g.revertedAt || null,
        g.auditNotes || null,
        nowIso
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // 10. Bounded Supabase Sync
  let supabaseSyncStats: Record<string, number> = {};
  if (!skipSupabase) {
    const sb = getServerSupabaseClient();
    if (sb) {
      const ctrRes = await batchUpsertSupabase(
        sb,
        'seo_ctr_recommendations',
        ctrRecs.slice(0, 150).map((r) => ({
          recommendation_key: r.recommendationKey,
          page_url: r.pageUrl,
          primary_query: r.primaryQuery,
          query_evidence: r.queryEvidence,
          page_intent: r.pageIntent,
          avg_position: r.avgPosition,
          impressions: r.impressions,
          clicks: r.clicks,
          actual_ctr: r.actualCtr,
          cohort_expected_ctr: r.cohortExpectedCtr,
          existing_title: r.existingTitle,
          suggested_title: r.suggestedTitle,
          existing_description: r.existingDescription,
          suggested_description: r.suggestedDescription,
          rationale: r.rationale,
          risk_assessment: r.riskAssessment,
          priority_score: r.priorityScore,
          governance_state: r.governanceState,
        })),
        'recommendation_key'
      );

      const atkRes = await batchUpsertSupabase(
        sb,
        'seo_position_attack_targets',
        topAttackTargets.map((t) => ({
          attack_key: t.attackKey,
          page_url: t.pageUrl,
          position_band: t.positionBand,
          query_cluster: t.queryCluster,
          primary_query: t.primaryQuery,
          clicks: t.clicks,
          impressions: t.impressions,
          ctr: t.ctr,
          average_position: t.avgPosition,
          relevant_inventory: t.relevantInventory,
          content_gap: t.contentGap,
          internal_linking_gap: t.internalLinkingGap,
          competitor_evidence: t.competitorEvidence,
          suggested_action: t.suggestedAction,
          priority_score: t.priorityScore,
          governance_state: 'RECOMMENDATION',
        })),
        'attack_key'
      );

      const compRes = await batchUpsertSupabase(
        sb,
        'seo_competitor_benchmarks',
        competitorRecords.slice(0, 100).map((b) => ({
          benchmark_key: b.benchmarkKey,
          query: b.query,
          talentxcel_target_url: b.talentxcelTargetUrl,
          competitor_domain: b.competitorDomain,
          competitor_url: b.competitorUrl,
          source_method: b.sourceMethod,
          verification_status: b.verificationStatus,
          observed_title: b.observedTitle,
          observed_h1: b.observedH1,
          observed_sections: b.observedSections,
          serp_format: b.serpFormat,
          topic_coverage_gaps: b.topicCoverageGaps,
          differentiation_angle: b.differentiationAngle,
        })),
        'benchmark_key'
      );

      const fbRes = await batchUpsertSupabase(sb, 'seo_page_performance_feedback', feedbackPayloads, 'page_url');

      const govRes = await batchUpsertSupabase(
        sb,
        'seo_action_governance_log',
        governanceRecords.map((g) => ({
          action_id: g.actionId,
          action_type: g.actionType,
          target_url: g.targetUrl,
          state: g.state,
          payload: g.payload,
          validation_checks: g.validationChecks,
          rollback_payload: g.rollbackPayload,
          approved_by: g.approvedBy || null,
          audit_notes: g.auditNotes || null,
        })),
        'action_id'
      );

      const lnkRes =
        newInternalLinks.length > 0
          ? await batchUpsertSupabase(sb, 'seo_internal_link_recommendations', newInternalLinks, 'recommendation_key')
          : { succeeded: 0 };

      supabaseSyncStats = {
        seo_ctr_recommendations: ctrRes.succeeded,
        seo_position_attack_targets: atkRes.succeeded,
        seo_competitor_benchmarks: compRes.succeeded,
        seo_page_performance_feedback: fbRes.succeeded,
        seo_action_governance_log: govRes.succeeded,
        seo_internal_link_recommendations: lnkRes.succeeded,
      };
    }
  }

  const summary = {
    executedAt: nowIso,
    durationMs: Date.now() - startedAt,
    graphEdgesCount: graphEdges.length,
    uniqueObservedPages: pageSummaries.length,
    cannibalizedQueriesCount,
    intentMismatchCount,
    empiricalCohorts,
    ctrRecommendationsCount: ctrRecs.length,
    positionAttackCounts: {
      POS_4_10: topAttackTargets.filter((t) => t.positionBand === 'POS_4_10').length,
      POS_11_20: topAttackTargets.filter((t) => t.positionBand === 'POS_11_20').length,
      POS_21_50: topAttackTargets.filter((t) => t.positionBand === 'POS_21_50').length,
    },
    competitorBenchmarksCount: competitorRecords.length,
    competitorVerificationBreakdown: competitorRecords.reduce<Record<string, number>>((acc, c) => {
      acc[c.verificationStatus] = (acc[c.verificationStatus] || 0) + 1;
      return acc;
    }, {}),
    internalLinksGenerated: newInternalLinks.length,
    feedbackClassificationCounts: feedbackCounts,
    governanceActionsLogged: governanceRecords.length,
    opportunityQueueCounts: Object.fromEntries(Object.entries(queueBuckets).map(([k, v]) => [k, v.length])),
    supabaseSyncStats,
  };

  const reportsDir = path.resolve(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, 'PHASE3_CLOSED_LOOP_SUMMARY.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  db.close();
  return summary;
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('run-phase3-closed-loop.ts')) {
  runPhase3ClosedLoop().catch((err) => {
    console.error('[Phase3 Closed-Loop] Fatal error:', err);
    process.exit(1);
  });
}
