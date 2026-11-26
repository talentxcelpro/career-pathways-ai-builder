// scripts/search-intelligence/run-phase2-intelligence-cycle.ts
// Phases 9, 10, 11, 12 Global SEO Opportunity Engine, Live Inventory Mapping & Governance Refresh.
// Classifies prioritized opportunities across 8 distinct operational buckets, maps against real DB
// inventory without leaking candidate PII, preserves SEOPageGovernor & ContentGovernor rules, and emits reports.

import fs from 'node:fs';
import path from 'node:path';
import { classifyKeyword } from '../../src/lib/seo/demandIntelligence/classifier';
import { scoreOpportunity } from '../../src/lib/seo/demandIntelligence/opportunityScorer';
import { evaluatePageQualification } from '../../src/lib/seo/demandIntelligence/pageQualifier';
import { collectAndPersistLiveInventory } from './inventoryMatcher';
import {
  DEFAULT_CANDIDATES_DB_PATH,
  DEFAULT_WAREHOUSE_PATH,
  openCandidatesWarehouse,
  openWarehouse,
} from './sqliteWarehouse';
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

export async function runPhase2IntelligenceCycle(options: { dbPath?: string; skipSupabase?: boolean } = {}) {
  const startTime = Date.now();
  const db = openWarehouse(options.dbPath || DEFAULT_WAREHOUSE_PATH);
  const skipSupabase = options.skipSupabase ?? process.argv.includes('--skip-supabase');

  // 1. Live Inventory Refresh (strictly non-PII counts for public_profiles; live jobs/companies/courses/catalogs)
  const inventory = await collectAndPersistLiveInventory(db);

  // 2. Collect verified GSC queries + top geo hubs + inventory-matched clusters
  const gscQueries = db
    .prepare(`
      SELECT normalized_query, MAX(query) AS query, MAX(country) AS country,
             SUM(impressions) AS impressions, SUM(prior_impressions) AS prior_impressions,
             SUM(clicks) AS clicks, AVG(position) AS avg_pos, SUM(ga4_conversions) AS ga4_conversions
      FROM gsc_telemetry
      GROUP BY normalized_query
      ORDER BY impressions DESC
      LIMIT 400
    `)
    .all() as Array<{
      normalized_query: string;
      query: string;
      country: string;
      impressions: number;
      prior_impressions: number;
      clicks: number;
      avg_pos: number;
      ga4_conversions: number;
    }>;

  const topAuditedValid = db
    .prepare(`
      SELECT k.raw_keyword, k.normalized_keyword, k.country_code, k.city_slug, k.industry_slug, k.job_role_slug,
             k.skill_slug, k.search_intent, k.recommended_destination, q.quality_lifecycle_state, q.quality_score
      FROM keywords k
      JOIN keyword_quality_audit q ON q.keyword_hash = k.keyword_hash
      WHERE q.quality_lifecycle_state IN ('QUALIFIED', 'OPPORTUNITY', 'GSC_OBSERVED', 'SOURCE_OBSERVED', 'INVENTORY_MATCHED', 'VALIDATED')
      ORDER BY CASE q.quality_lifecycle_state WHEN 'QUALIFIED' THEN 1 WHEN 'OPPORTUNITY' THEN 2 WHEN 'SOURCE_OBSERVED' THEN 3 WHEN 'INVENTORY_MATCHED' THEN 4 ELSE 5 END, q.quality_score DESC
      LIMIT 350
    `)
    .all() as Array<{
      raw_keyword: string;
      normalized_keyword: string;
      country_code: string;
      city_slug: string | null;
      industry_slug: string | null;
      job_role_slug: string | null;
      skill_slug: string | null;
      search_intent: string;
      recommended_destination: string;
      quality_lifecycle_state: string;
      quality_score: number;
    }>;

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

  const upsertOppPayload: Array<Record<string, unknown>> = [];
  const upsertQualPayload: Array<Record<string, unknown>> = [];
  const seenDest = new Set<string>();

  const lookupInventory = (cl: NonNullable<ReturnType<typeof classifyKeyword>>): number => {
    if (cl.recommendedDestination === '/jobs/remote') return inventory.remoteJobsCount;
    if (cl.recommendedDestination.startsWith('/jobs/fresher')) return inventory.fresherJobsCount;
    if (cl.recommendedDestination.startsWith('/jobs/internship')) return inventory.internshipJobsCount;
    if (cl.recommendedDestination.startsWith('/government-jobs')) return inventory.govtJobsCount;
    if (cl.jobRoleSlug && cl.citySlug) {
      const bareCity = cl.citySlug.replace(/-[a-z]{2}$/, '');
      return (
        inventory.jobsByRoleCity.get(`${cl.jobRoleSlug}|${cl.citySlug}`) ??
        inventory.jobsByRoleCity.get(`${cl.jobRoleSlug}|${bareCity}`) ??
        0
      );
    }
    if (cl.jobRoleSlug) return inventory.jobsByRoleSlug.get(cl.jobRoleSlug) ?? 0;
    if (cl.citySlug) {
      const bareCity = cl.citySlug.replace(/-[a-z]{2}$/, '');
      return inventory.jobsByCitySlug.get(cl.citySlug) ?? inventory.jobsByCitySlug.get(bareCity) ?? 0;
    }
    if (cl.skillSlug) return inventory.jobsBySkillSlug.get(cl.skillSlug) ?? 0;
    if (cl.industrySlug) return inventory.jobsByIndustrySlug.get(cl.industrySlug) ?? 0;
    if (['/jobs', '/jobs/location/india'].includes(cl.recommendedDestination)) return inventory.totalActiveJobs;
    if (['/companies', '/employer'].includes(cl.recommendedDestination)) return inventory.companiesCount;
    if (cl.recommendedDestination.startsWith('/colleges')) return inventory.institutionsCatalogCount;
    if (cl.recommendedDestination.startsWith('/learning')) return inventory.coursesCount;
    if (cl.recommendedDestination.startsWith('/network')) return inventory.publicProfilesCount;
    return 0;
  };

  const evaluateItem = (params: {
    keyword: string;
    impressions: number;
    priorImpressions: number;
    clicks: number;
    avgPos: number | null;
    ga4Conversions: number;
    lifecycleState: string;
  }) => {
    const cl = classifyKeyword(params.keyword);
    if (!cl) return;
    const inv = lookupInventory(cl);
    const hasGsc = params.impressions > 0;

    const score = scoreOpportunity({
      classified: cl,
      searchVolumeStatus: hasGsc ? 'verified' : 'unknown',
      gscImpressions: hasGsc ? params.impressions : null,
      gscClicks: hasGsc ? params.clicks : null,
      gscCtr: hasGsc ? params.clicks / params.impressions : null,
      gscPosition: params.avgPos,
      ga4Conversions: params.ga4Conversions || null,
      liveInventoryCount: inv,
    });

    let bucket: OpportunityQueueBucket = 'NEEDS_DATA';
    if (hasGsc && inv >= 3) bucket = 'HIGH_CONFIDENCE';
    else if (params.priorImpressions > 0 && params.impressions >= params.priorImpressions * 1.4) bucket = 'EMERGING';
    else if (inv >= 10) bucket = 'INVENTORY_RICH';
    else if (cl.isExplicitGeo && cl.countryCode !== 'IN' && cl.countryCode !== 'GLB') bucket = 'GEOGRAPHIC_EXPANSION';
    else if (['resume_ats', 'assessment_score', 'career_passport', 'salary_benchmark', 'interview_prep', 'career_roadmap'].includes(cl.searchIntent)) {
      bucket = 'CAREER';
    } else if (cl.skillSlug) bucket = 'SKILL';
    else if (cl.industrySlug) bucket = 'INDUSTRY';

    const entry = {
      keyword: cl.normalizedKeyword,
      destination: cl.recommendedDestination,
      bucket,
      score: score.compositeScore,
      confidence: score.dataConfidence,
      demandStatus: score.demandStatus,
      gscImpressions: params.impressions,
      inventoryCount: inv,
      country: cl.countryCode,
      lifecycleState: params.lifecycleState,
    };
    if (queueBuckets[bucket].length < 25) queueBuckets[bucket].push(entry);

    if (!seenDest.has(cl.recommendedDestination) && upsertQualPayload.length < 300) {
      seenDest.add(cl.recommendedDestination);
      const isUtil = ['ats-check', 'resume-template', 'talentscore-assessment', 'career-passport', 'recruiter-os', 'employer-brand', 'salary-benchmark'].includes(cl.opportunityType);
      const qual = evaluatePageQualification({
        pageUrl: cl.recommendedDestination,
        pageType: cl.opportunityType,
        primaryKeyword: cl.normalizedKeyword,
        clusterKey: cl.clusterKey,
        realInventoryCount: inv,
        profileAggregateCount: inventory.publicProfilesCount,
        courseCount: inventory.coursesCount,
        uniqueContentScore: isUtil || inv >= 3 ? 85 : 42,
        relevanceScore: score.talentxcelRelevanceScore,
        opportunityScore: score.compositeScore,
        hasUtilityExperience: isUtil,
      });

      upsertQualPayload.push({
        page_url: qual.pageUrl,
        page_type: qual.pageType,
        primary_keyword: qual.primaryKeyword,
        real_inventory_count: inv,
        unique_content_score: isUtil || inv >= 3 ? 85 : 42,
        relevance_score: score.talentxcelRelevanceScore,
        indexation_score: qual.indexationScore,
        cannibalization_target: qual.cannibalizationTarget,
        qualification_status: qual.qualificationStatus,
        qualification_reason: qual.reason,
      });

      upsertOppPayload.push({
        opportunity_key: `p2-${bucket.toLowerCase()}-${cl.keywordHash.slice(0, 12)}`,
        opportunity_type: cl.opportunityType,
        gsc_opportunity_code: hasGsc ? (bucket === 'EMERGING' ? 'D' : 'B') : null,
        recommended_destination: cl.recommendedDestination,
        opportunity_score: score.compositeScore,
        confidence_score: score.dataConfidence,
        priority: score.compositeScore >= 75 && hasGsc ? 'P0' : score.compositeScore >= 60 ? 'P1' : 'P2',
        qualification_status: qual.qualificationStatus,
        evidence: { bucket, demandStatus: score.demandStatus, gscImpressions: params.impressions, inventoryCount: inv },
        score_breakdown: score,
        recommended_action: `[${bucket}] ${hasGsc ? `Optimize ${cl.recommendedDestination} (${params.impressions} imp)` : `Hold ${cl.recommendedDestination} at ${qual.qualificationStatus} until verified demand + >=3 inventory`}`,
      });
    }
  };

  for (const g of gscQueries) {
    evaluateItem({
      keyword: g.query,
      impressions: g.impressions,
      priorImpressions: g.prior_impressions,
      clicks: g.clicks,
      avgPos: g.avg_pos,
      ga4Conversions: g.ga4_conversions,
      lifecycleState: 'GSC_OBSERVED',
    });
  }

  for (const k of topAuditedValid) {
    evaluateItem({
      keyword: k.raw_keyword,
      impressions: 0,
      priorImpressions: 0,
      clicks: 0,
      avgPos: null,
      ga4Conversions: 0,
      lifecycleState: k.quality_lifecycle_state,
    });
  }

  let syncSummary: Record<string, unknown> = { skipped: skipSupabase };
  if (!skipSupabase) {
    const sb = getServerSupabaseClient();
    const qRes = await batchUpsertSupabase(sb, 'seo_page_qualification', upsertQualPayload, 'page_url');
    const oRes = await batchUpsertSupabase(sb, 'seo_opportunities', upsertOppPayload, 'opportunity_key');
    syncSummary = {
      qualificationsSynced: qRes.succeeded,
      opportunitiesSynced: oRes.succeeded,
      errors: [...qRes.errors, ...oRes.errors],
    };
  }

  const candDb = openCandidatesWarehouse(DEFAULT_CANDIDATES_DB_PATH);
  const cand5M = (candDb.prepare('SELECT COUNT(*) AS c FROM keyword_universe_candidates').get() as { c: number }).c;
  candDb.close();

  const taxStats = {
    countries: (db.prepare('SELECT COUNT(*) AS c FROM geo_countries').get() as { c: number }).c,
    regions: (db.prepare('SELECT COUNT(*) AS c FROM geo_regions').get() as { c: number }).c,
    cities: (db.prepare('SELECT COUNT(*) AS c FROM geo_cities').get() as { c: number }).c,
    employmentHubs: (db.prepare('SELECT COUNT(*) AS c FROM geo_cities WHERE is_employment_hub = 1').get() as { c: number }).c,
    jobTitles: (db.prepare('SELECT COUNT(*) AS c FROM job_title_taxonomy').get() as { c: number }).c,
    skills: (db.prepare('SELECT COUNT(*) AS c FROM skills_taxonomy').get() as { c: number }).c,
    industries: (db.prepare('SELECT COUNT(*) AS c FROM industry_taxonomy').get() as { c: number }).c,
    candidates5M: cand5M,
    audited1M: (db.prepare('SELECT COUNT(*) AS c FROM keyword_quality_audit').get() as { c: number }).c,
    gscGrain: (db.prepare('SELECT COUNT(*) AS c FROM gsc_telemetry').get() as { c: number }).c,
  };

  const report = {
    executedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    taxonomyScale: taxStats,
    liveInventorySummary: {
      totalActiveJobs: inventory.totalActiveJobs,
      publicProfilesCount: inventory.publicProfilesCount,
      companiesCount: inventory.companiesCount,
      coursesCount: inventory.coursesCount,
      institutionsCatalogCount: inventory.institutionsCatalogCount,
    },
    opportunityQueueCountsByBucket: Object.fromEntries(
      Object.entries(queueBuckets).map(([k, v]) => [k, v.length])
    ),
    opportunityQueuesSample: queueBuckets,
    governanceQualificationCounts: upsertQualPayload.reduce<Record<string, number>>((acc, q) => {
      const st = String(q.qualification_status);
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {}),
    supabaseSync: syncSummary,
  };

  const reportsDir = path.resolve(process.cwd(), 'reports');
  fs.writeFileSync(path.join(reportsDir, 'PHASE2_OPPORTUNITY_INTELLIGENCE_REPORT.json'), JSON.stringify(report, null, 2));
  db.close();
  return report;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('run-phase2-intelligence-cycle.ts')) {
  runPhase2IntelligenceCycle()
    .then((r) => console.log('Phase 2 Intelligence Cycle Complete:', JSON.stringify(r.taxonomyScale), JSON.stringify(r.governanceQualificationCounts)))
    .catch((e) => {
      console.error('Phase 2 cycle failed:', e);
      process.exit(1);
    });
}
