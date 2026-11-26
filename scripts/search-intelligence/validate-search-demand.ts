// scripts/search-intelligence/validate-search-demand.ts
// Phase 8 Empirical Search Demand Validation Engine.
// Separates candidate intelligence from observed demand using GSC, GA4, public autocomplete
// (bounded polite queries without any anti-bot/CAPTCHA bypass), and real TalentXcel DB inventory.

import fs from 'node:fs';
import path from 'node:path';
import type { EvidenceStatus } from '../../src/lib/seo/demandIntelligence/expansionPolicy';
import { computeKeywordFingerprint } from '../../src/lib/seo/demandIntelligence/normalizer';
import {
  DEFAULT_CANDIDATES_DB_PATH,
  DEFAULT_WAREHOUSE_PATH,
  openCandidatesWarehouse,
  openWarehouse,
} from './sqliteWarehouse';
import { batchUpsertSupabase, getServerSupabaseClient } from './supabaseSync';

const AUTOCOMPLETE_SEED_PROBES = [
  'ats resume checker',
  'talent score test',
  'software engineer jobs in bangalore',
  'data analyst jobs in noida',
  'fresher software engineer jobs india',
  'python developer jobs remote',
  'full stack developer salary india',
  'hr recruiter jobs in dubai',
  'react developer interview questions',
  'digital career passport',
  'ai engineer jobs in india',
  'cybersecurity analyst jobs london',
  'nurse jobs in uk',
  'accountant jobs in dubai',
  'devops engineer salary bangalore',
  'data scientist jobs hyderabad',
  'project manager jobs toronto',
  'internship software engineering india',
  'government jobs india 2026',
  'campus placement preparation online',
];

async function queryPublicSuggest(query: string): Promise<string[] | null> {
  try {
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`
    );
    if (!res.ok) return null; // Never bypass rate limits or blocks
    const parsed = (await res.json()) as [string, string[]];
    return Array.isArray(parsed?.[1]) ? parsed[1] : [];
  } catch {
    return null;
  }
}

export async function runSearchDemandValidation(options: { dbPath?: string; skipSupabase?: boolean } = {}) {
  const startTime = Date.now();
  const db = openWarehouse(options.dbPath || DEFAULT_WAREHOUSE_PATH);
  const candDb = openCandidatesWarehouse(DEFAULT_CANDIDATES_DB_PATH);
  const skipSupabase = options.skipSupabase ?? process.argv.includes('--skip-supabase');

  // 1. Polite bounded public Google Autocomplete check (no circumvention; aborts cleanly on HTTP error)
  const observedSuggestions: Array<{ probe: string; suggestion: string; hash: string }> = [];
  let consecutiveFailures = 0;

  for (const probe of AUTOCOMPLETE_SEED_PROBES) {
    if (consecutiveFailures >= 3) break;
    const list = await queryPublicSuggest(probe);
    if (!list) {
      consecutiveFailures += 1;
      continue;
    }
    consecutiveFailures = 0;
    for (const s of list) {
      const clean = s.trim().toLowerCase();
      if (clean) {
        observedSuggestions.push({
          probe,
          suggestion: clean,
          hash: computeKeywordFingerprint(clean),
        });
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  const updateCandSuggest = candDb.prepare(`
    UPDATE keyword_universe_candidates
    SET evidence_status = 'PUBLIC_SUGGEST_VERIFIED', quality_lifecycle_state = 'SOURCE_OBSERVED'
    WHERE keyword_hash = ?
  `);
  const updateAuditSuggest = db.prepare(`
    UPDATE keyword_quality_audit
    SET quality_lifecycle_state = 'SOURCE_OBSERVED'
    WHERE keyword_hash = ? AND quality_lifecycle_state IN ('GENERATED', 'NORMALIZED', 'VALIDATED', 'DEDUPLICATED')
  `);

  db.exec('BEGIN');
  candDb.exec('BEGIN');
  try {
    for (const item of observedSuggestions) {
      updateCandSuggest.run(item.hash);
      updateAuditSuggest.run(item.hash);
    }
    candDb.exec('COMMIT');
    db.exec('COMMIT');
  } catch (e) {
    candDb.exec('ROLLBACK');
    db.exec('ROLLBACK');
    throw e;
  }

  // 2. Summarize genuine evidence breakdown across SQLite intelligence + candidates
  const gscVerifiedCount = (db.prepare('SELECT COUNT(DISTINCT normalized_query) AS c FROM gsc_telemetry').get() as { c: number }).c;
  const gscTotalImp = (db.prepare('SELECT COALESCE(SUM(impressions),0) AS i FROM gsc_telemetry').get() as { i: number }).i;
  const gscTotalClicks = (db.prepare('SELECT COALESCE(SUM(clicks),0) AS clk FROM gsc_telemetry').get() as { clk: number }).clk;
  const ga4PagesCount = (db.prepare('SELECT COUNT(DISTINCT page_url) AS c FROM gsc_telemetry WHERE ga4_sessions > 0').get() as { c: number }).c;
  const totalAudited1M = (db.prepare('SELECT COUNT(*) AS c FROM keyword_quality_audit').get() as { c: number }).c;
  const totalCandidates5M = (candDb.prepare('SELECT COUNT(*) AS c FROM keyword_universe_candidates').get() as { c: number }).c;
  candDb.close();

  const evidenceSummary: Record<EvidenceStatus, number> = {
    GSC_VERIFIED: gscVerifiedCount,
    GA4_VERIFIED: ga4PagesCount,
    PUBLIC_SUGGEST_VERIFIED: observedSuggestions.length,
    FIRST_PARTY_INVENTORY_BACKED: (
      db.prepare("SELECT COUNT(*) AS c FROM keyword_quality_audit WHERE quality_lifecycle_state IN ('INVENTORY_MATCHED', 'OPPORTUNITY', 'QUALIFIED')").get() as { c: number }
    ).c,
    UNKNOWN: totalAudited1M + totalCandidates5M - gscVerifiedCount,
  };

  if (!skipSupabase) {
    const sb = getServerSupabaseClient();
    await batchUpsertSupabase(
      sb,
      'keyword_sources',
      [
        {
          source_name: 'google_public_autocomplete',
          source_type: 'PUBLIC_SUGGEST_VERIFIED',
          collection_method: 'POLITE_RATE_LIMITED_SUGGEST_PROBE',
          source_confidence: 0.72,
          is_verified_demand: true,
          source_metadata: { probesRun: AUTOCOMPLETE_SEED_PROBES.length, suggestionsCaptured: observedSuggestions.length, note: 'Exact volume marked UNKNOWN' },
        },
      ],
      'source_name'
    );
  }

  const report = {
    validatedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    evidenceStatusBreakdown: evidenceSummary,
    gscMetrics: { distinctQueries: gscVerifiedCount, totalImpressions: gscTotalImp, totalClicks: gscTotalClicks },
    ga4LandingPagesWithTraffic: ga4PagesCount,
    publicAutocompleteSampleSuggestions: observedSuggestions.slice(0, 25),
    antiFabricationGuarantee: '0 search volumes, 0 CPCs, and 0 difficulty scores fabricated; all unverified candidates retain UNKNOWN status.',
  };

  const reportsDir = path.resolve(process.cwd(), 'reports');
  fs.writeFileSync(path.join(reportsDir, 'PHASE2_SEARCH_DEMAND_VALIDATION_REPORT.json'), JSON.stringify(report, null, 2));
  db.close();
  return report;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('validate-search-demand.ts')) {
  runSearchDemandValidation()
    .then((r) => console.log('Demand validation complete:', JSON.stringify(r.evidenceStatusBreakdown)))
    .catch((e) => {
      console.error('Demand validation failed:', e);
      process.exit(1);
    });
}
