// scripts/search-intelligence/discover-keywords.ts
// Phase 4 & 5 Global Keyword Discovery Engine:
// Expands compliant job titles, modifiers, skills, 30 industries, global geo hubs, and
// LinkedIn / Naukri / Indeed-inspired vocabularies into Tier 1 SQLite with explicit source attribution.

import { classifyKeyword } from '../../src/lib/seo/demandIntelligence/classifier';
import { scoreOpportunity } from '../../src/lib/seo/demandIntelligence/opportunityScorer';
import {
  GLOBAL_GEO_HUBS,
  GLOBAL_SKILLS_CATALOG,
  UNIFIED_30_INDUSTRIES,
  UNIFIED_ROLE_TAXONOMY,
  generateCompliantDiscoverySeeds,
} from '../../src/lib/seo/demandIntelligence/taxonomies';
import { DEFAULT_WAREHOUSE_PATH, openWarehouse } from './sqliteWarehouse';
import { batchUpsertSupabase, getServerSupabaseClient } from './supabaseSync';
import type { SourceAttribution } from '../../src/lib/seo/demandIntelligence/types';

export async function runKeywordDiscovery(options: { dbPath?: string; skipSupabase?: boolean } = {}) {
  const db = openWarehouse(options.dbPath || DEFAULT_WAREHOUSE_PATH);
  const skipSupabase = options.skipSupabase ?? process.argv.includes('--skip-supabase');

  const candidates: Array<{ keyword: string; source: string; sourceType: SourceAttribution }> = [];

  // 1. Compliant LinkedIn / Naukri / Indeed-inspired taxonomies
  for (const s of generateCompliantDiscoverySeeds()) {
    candidates.push({ keyword: s.keyword, source: s.source, sourceType: s.sourceType });
  }

  // 2. Skill intelligence across core TalentXcel skills
  for (const sk of GLOBAL_SKILLS_CATALOG) {
    const sName = sk.name.toLowerCase();
    candidates.push(
      { keyword: `${sName} jobs`, source: 'skill_taxonomy_expander', sourceType: 'TAXONOMY_EXPANSION_LINKEDIN_INSPIRED' },
      { keyword: `${sName} salary india`, source: 'skill_taxonomy_expander', sourceType: 'TAXONOMY_EXPANSION_NAUKRI_INSPIRED' },
      { keyword: `${sName} interview questions`, source: 'skill_taxonomy_expander', sourceType: 'TAXONOMY_EXPANSION_NAUKRI_INSPIRED' }
    );
  }

  // 3. 30 Industry Hubs + Career Guides
  for (const ind of UNIFIED_30_INDUSTRIES) {
    const indName = ind.name.toLowerCase();
    candidates.push(
      { keyword: `${indName} jobs in india`, source: 'industry_taxonomy_30', sourceType: 'TAXONOMY_EXPANSION_NAUKRI_INSPIRED' },
      { keyword: `${indName} career guide`, source: 'industry_taxonomy_30', sourceType: 'TAXONOMY_EXPANSION_LINKEDIN_INSPIRED' }
    );
  }

  // 4. First-party active roles from canonical_roles / jobs (non-PII titles only)
  if (!skipSupabase) {
    try {
      const sb = getServerSupabaseClient();
      const { data: roles } = await sb.from('canonical_roles').select('slug, title').limit(150);
      for (const r of roles || []) {
        const title = (r.title || '').toLowerCase();
        if (title) {
          candidates.push(
            { keyword: `${title} jobs`, source: 'talentxcel_canonical_roles', sourceType: 'VERIFIED_FIRST_PARTY_DB' },
            { keyword: `${title} salary benchmark`, source: 'talentxcel_canonical_roles', sourceType: 'VERIFIED_FIRST_PARTY_DB' }
          );
        }
      }
    } catch {
      // Offline / skip safely
    }
  }

  const nowIso = new Date().toISOString();
  const insertStmt = db.prepare(`
    INSERT INTO keywords (
      keyword_hash, raw_keyword, normalized_keyword, dedup_key,
      source, source_type, country_code, city_slug, language,
      industry_slug, job_role_slug, skill_slug, seniority, employment_type, work_mode,
      search_intent, opportunity_type, cluster_key, recommended_destination, recommended_canonical_url,
      is_classified, classification_confidence, entities_json, relations_json,
      search_volume_status, opportunity_score, demand_confidence, score_breakdown_json,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unknown', ?, ?, ?, 'CLUSTERED', ?, ?)
    ON CONFLICT(keyword_hash) DO NOTHING
  `);

  let inserted = 0;
  let skippedExisting = 0;

  db.exec('BEGIN');
  try {
    for (const c of candidates) {
      const cl = classifyKeyword(c.keyword, { source: c.source, sourceType: c.sourceType });
      if (!cl) continue;
      const scored = scoreOpportunity({ classified: cl, searchVolumeStatus: 'unknown' });
      const info = insertStmt.run(
        cl.keywordHash,
        cl.rawKeyword,
        cl.normalizedKeyword,
        cl.dedupKey,
        cl.source,
        cl.sourceType,
        cl.countryCode,
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
      if (info.changes > 0) inserted += 1;
      else skippedExisting += 1;
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  if (!skipSupabase) {
    const sb = getServerSupabaseClient();
    await batchUpsertSupabase(
      sb,
      'keyword_sources',
      [
        {
          source_name: 'linkedin_inspired_taxonomy',
          source_type: 'TAXONOMY_EXPANSION_LINKEDIN_INSPIRED',
          collection_method: 'COMPLIANT_VOCABULARY_TAXONOMY',
          source_confidence: 0.35,
          is_verified_demand: false,
          source_metadata: { note: 'Compliant public career terminology inspiration; no scraping' },
        },
        {
          source_name: 'naukri_inspired_taxonomy',
          source_type: 'TAXONOMY_EXPANSION_NAUKRI_INSPIRED',
          collection_method: 'COMPLIANT_VOCABULARY_TAXONOMY',
          source_confidence: 0.35,
          is_verified_demand: false,
          source_metadata: { note: 'Indian employment & fresher terminology taxonomy' },
        },
        {
          source_name: 'indeed_inspired_taxonomy',
          source_type: 'TAXONOMY_EXPANSION_INDEED_INSPIRED',
          collection_method: 'COMPLIANT_VOCABULARY_TAXONOMY',
          source_confidence: 0.35,
          is_verified_demand: false,
          source_metadata: { note: 'Global job search modifiers taxonomy' },
        },
      ],
      'source_name'
    );
  }

  db.close();
  return {
    candidatesEvaluated: candidates.length,
    insertedNewKeywords: inserted,
    alreadyPresent: skippedExisting,
    taxonomiesActive: {
      industries: UNIFIED_30_INDUSTRIES.length,
      roles: UNIFIED_ROLE_TAXONOMY.length,
      skills: GLOBAL_SKILLS_CATALOG.length,
      geoHubs: GLOBAL_GEO_HUBS.length,
    },
  };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('discover-keywords.ts')) {
  runKeywordDiscovery()
    .then((res) => console.log('Discovery complete:', JSON.stringify(res, null, 2)))
    .catch((e) => {
      console.error('Discovery failed:', e);
      process.exit(1);
    });
}
