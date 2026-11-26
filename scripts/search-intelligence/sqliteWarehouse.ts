// scripts/search-intelligence/sqliteWarehouse.ts
// Tier 1 analytical warehouse built on Node 25 native node:sqlite (WAL mode).
// Stores all 1M+ keyword candidates, clusters, observations, inventory snapshots,
// opportunities, qualifications, internal links, and restartable checkpoints locally with zero cloud DB bloat.

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const DEFAULT_WAREHOUSE_PATH = path.resolve(
  process.cwd(),
  'seo-intelligence-engine/data/search_demand_intelligence.db'
);

export const DEFAULT_CANDIDATES_DB_PATH = path.resolve(
  process.cwd(),
  'seo-intelligence-engine/data/expanded_universe_5m.db'
);

export function openCandidatesWarehouse(dbPath = DEFAULT_CANDIDATES_DB_PATH): DatabaseSync {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA temp_store = MEMORY;
    PRAGMA cache_size = -128000;
    CREATE TABLE IF NOT EXISTS keyword_universe_candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword_hash TEXT NOT NULL,
      keyword TEXT NOT NULL,
      semantic_group_key TEXT NOT NULL,
      search_intent TEXT NOT NULL,
      title_id TEXT,
      skill_id TEXT,
      industry_slug TEXT,
      country_code TEXT NOT NULL,
      region_key TEXT,
      geoname_id INTEGER,
      modifier TEXT,
      evidence_status TEXT NOT NULL DEFAULT 'UNKNOWN',
      quality_lifecycle_state TEXT NOT NULL DEFAULT 'GENERATED',
      recommended_destination TEXT NOT NULL,
      provenance TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS checkpoints (
      job_name TEXT PRIMARY KEY,
      cursor_offset INTEGER NOT NULL DEFAULT 0,
      processed_count INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL
    );
  `);
  return db;
}

export function openWarehouse(dbPath = DEFAULT_WAREHOUSE_PATH): DatabaseSync {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA temp_store = MEMORY;
    PRAGMA cache_size = -64000;
    PRAGMA foreign_keys = ON;
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_name TEXT NOT NULL UNIQUE,
      source_type TEXT NOT NULL,
      collection_method TEXT NOT NULL,
      source_confidence REAL NOT NULL,
      is_verified_demand INTEGER NOT NULL DEFAULT 0,
      source_metadata TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clusters (
      cluster_key TEXT PRIMARY KEY,
      cluster_name TEXT NOT NULL,
      cluster_type TEXT NOT NULL,
      parent_cluster_key TEXT,
      primary_keyword TEXT NOT NULL,
      country_code TEXT NOT NULL,
      language TEXT NOT NULL,
      intent TEXT NOT NULL,
      recommended_hub_url TEXT NOT NULL,
      member_count INTEGER NOT NULL DEFAULT 0,
      cluster_quality REAL NOT NULL DEFAULT 0,
      opportunity_score REAL NOT NULL DEFAULT 0,
      sample_keywords_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS keywords (
      keyword_hash TEXT PRIMARY KEY,
      raw_keyword TEXT NOT NULL,
      normalized_keyword TEXT NOT NULL,
      dedup_key TEXT NOT NULL,
      source TEXT NOT NULL,
      source_type TEXT NOT NULL,
      country_code TEXT NOT NULL,
      city_slug TEXT,
      language TEXT NOT NULL,
      industry_slug TEXT,
      job_role_slug TEXT,
      skill_slug TEXT,
      seniority TEXT NOT NULL,
      employment_type TEXT NOT NULL,
      work_mode TEXT NOT NULL,
      search_intent TEXT NOT NULL,
      opportunity_type TEXT NOT NULL,
      cluster_key TEXT NOT NULL,
      recommended_destination TEXT NOT NULL,
      recommended_canonical_url TEXT NOT NULL,
      is_classified INTEGER NOT NULL,
      classification_confidence REAL NOT NULL,
      entities_json TEXT NOT NULL,
      relations_json TEXT NOT NULL,
      csv_intent TEXT,
      csv_cluster TEXT,
      csv_generation_source TEXT,
      csv_suggested_page TEXT,
      search_volume_status TEXT NOT NULL DEFAULT 'unknown',
      opportunity_score REAL NOT NULL DEFAULT 0,
      demand_confidence REAL NOT NULL DEFAULT 0.25,
      score_breakdown_json TEXT,
      status TEXT NOT NULL DEFAULT 'DISCOVERED',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gsc_telemetry (
      grain_key TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      normalized_query TEXT NOT NULL,
      page_url TEXT NOT NULL,
      property_url TEXT NOT NULL,
      country TEXT NOT NULL,
      device TEXT NOT NULL,
      impressions INTEGER NOT NULL,
      prior_impressions INTEGER NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL,
      ctr REAL NOT NULL,
      position REAL NOT NULL,
      ga4_sessions INTEGER NOT NULL DEFAULT 0,
      ga4_conversions INTEGER NOT NULL DEFAULT 0,
      observation_date TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory_snapshots (
      surface_key TEXT PRIMARY KEY,
      surface_type TEXT NOT NULL,
      slug TEXT NOT NULL,
      jobs_count INTEGER NOT NULL DEFAULT 0,
      profiles_count INTEGER NOT NULL DEFAULT 0,
      courses_count INTEGER NOT NULL DEFAULT 0,
      companies_count INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      checked_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      opportunity_key TEXT PRIMARY KEY,
      keyword_hash TEXT,
      cluster_key TEXT,
      opportunity_type TEXT NOT NULL,
      gsc_opportunity_code TEXT,
      recommended_destination TEXT NOT NULL,
      opportunity_score REAL NOT NULL,
      confidence_score REAL NOT NULL,
      priority TEXT NOT NULL,
      qualification_status TEXT NOT NULL,
      recommended_action TEXT NOT NULL,
      evidence_json TEXT NOT NULL,
      score_breakdown_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS page_qualifications (
      page_url TEXT PRIMARY KEY,
      page_type TEXT NOT NULL,
      primary_keyword TEXT NOT NULL,
      cluster_key TEXT NOT NULL,
      real_inventory_count INTEGER NOT NULL,
      unique_content_score REAL NOT NULL,
      relevance_score REAL NOT NULL,
      indexation_score REAL NOT NULL,
      cannibalization_target TEXT,
      qualification_status TEXT NOT NULL,
      qualification_reason TEXT NOT NULL,
      sitemap_eligible INTEGER NOT NULL,
      robots_meta TEXT NOT NULL,
      last_checked_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS internal_links (
      recommendation_key TEXT PRIMARY KEY,
      source_page_url TEXT NOT NULL,
      target_page_url TEXT NOT NULL,
      anchor_text TEXT NOT NULL,
      link_type TEXT NOT NULL,
      priority_score REAL NOT NULL,
      reason TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_briefs (
      brief_key TEXT PRIMARY KEY,
      target_url TEXT NOT NULL,
      opportunity_type TEXT NOT NULL,
      primary_keyword TEXT NOT NULL,
      supporting_keywords_json TEXT NOT NULL,
      target_intent TEXT NOT NULL,
      recommended_title TEXT NOT NULL,
      meta_description TEXT NOT NULL,
      outline_json TEXT NOT NULL,
      faq_json TEXT NOT NULL,
      internal_links_json TEXT NOT NULL,
      evidence_json TEXT NOT NULL,
      estimated_impact_score REAL NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS checkpoints (
      job_name TEXT PRIMARY KEY,
      cursor_offset INTEGER NOT NULL DEFAULT 0,
      processed_count INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL
    );

    -- Phase 2 Expanded Global Taxonomy Tables (GeoNames CC-BY-4.0, O*NET 29.0, ESCO, TalentXcel)
    CREATE TABLE IF NOT EXISTS geo_countries (
      country_code TEXT PRIMARY KEY,
      iso3 TEXT NOT NULL,
      country_name TEXT NOT NULL,
      slug TEXT NOT NULL,
      capital TEXT,
      continent TEXT,
      currency_code TEXT,
      population INTEGER NOT NULL DEFAULT 0,
      languages TEXT,
      provenance TEXT NOT NULL,
      validation_status TEXT NOT NULL DEFAULT 'VALIDATED'
    );

    CREATE TABLE IF NOT EXISTS geo_regions (
      region_key TEXT PRIMARY KEY,
      country_code TEXT NOT NULL,
      region_code TEXT NOT NULL,
      admin_level INTEGER NOT NULL,
      name TEXT NOT NULL,
      ascii_name TEXT NOT NULL,
      geoname_id INTEGER,
      provenance TEXT NOT NULL,
      validation_status TEXT NOT NULL DEFAULT 'VALIDATED'
    );

    CREATE TABLE IF NOT EXISTS geo_cities (
      geoname_id INTEGER PRIMARY KEY,
      canonical_name TEXT NOT NULL,
      ascii_name TEXT NOT NULL,
      slug TEXT NOT NULL,
      country_code TEXT NOT NULL,
      admin1_code TEXT,
      admin2_code TEXT,
      city_type TEXT NOT NULL,
      population INTEGER NOT NULL DEFAULT 0,
      latitude REAL,
      longitude REAL,
      timezone TEXT,
      alternatenames TEXT,
      is_employment_hub INTEGER NOT NULL DEFAULT 0,
      provenance TEXT NOT NULL,
      validation_status TEXT NOT NULL DEFAULT 'VALIDATED'
    );

    CREATE TABLE IF NOT EXISTS job_title_taxonomy (
      title_id TEXT PRIMARY KEY,
      canonical_title TEXT NOT NULL,
      slug TEXT NOT NULL,
      normalized_title TEXT NOT NULL,
      soc_code TEXT,
      isco_code TEXT,
      title_type TEXT NOT NULL,
      seniority TEXT,
      department TEXT,
      industry_slug TEXT,
      synonyms_json TEXT NOT NULL DEFAULT '[]',
      skills_json TEXT NOT NULL DEFAULT '[]',
      provenance TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0.90
    );

    CREATE TABLE IF NOT EXISTS skills_taxonomy (
      skill_id TEXT PRIMARY KEY,
      canonical_skill TEXT NOT NULL,
      slug TEXT NOT NULL,
      normalized_skill TEXT NOT NULL,
      skill_category TEXT NOT NULL,
      esco_uri TEXT,
      onet_element_id TEXT,
      is_hot_tech INTEGER NOT NULL DEFAULT 0,
      synonyms_json TEXT NOT NULL DEFAULT '[]',
      related_skills_json TEXT NOT NULL DEFAULT '[]',
      industries_json TEXT NOT NULL DEFAULT '[]',
      roles_json TEXT NOT NULL DEFAULT '[]',
      provenance TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0.90
    );

    CREATE TABLE IF NOT EXISTS industry_taxonomy (
      industry_slug TEXT PRIMARY KEY,
      industry_name TEXT NOT NULL,
      parent_industry_slug TEXT,
      sector_code TEXT,
      subindustries_json TEXT NOT NULL DEFAULT '[]',
      related_socs_json TEXT NOT NULL DEFAULT '[]',
      provenance TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS keyword_quality_audit (
      keyword_hash TEXT PRIMARY KEY,
      quality_lifecycle_state TEXT NOT NULL,
      quality_score REAL NOT NULL,
      issues_json TEXT NOT NULL DEFAULT '[]',
      semantic_group_key TEXT NOT NULL,
      is_explicit_geo INTEGER NOT NULL DEFAULT 0,
      matched_city_geoname_id INTEGER,
      matched_title_id TEXT,
      matched_skill_id TEXT,
      should_share_page INTEGER NOT NULL DEFAULT 0,
      evaluated_at TEXT NOT NULL
    );

    -- Phase 3 Closed-Loop GSC Growth & Competitor Interception Tables
    CREATE TABLE IF NOT EXISTS gsc_window_telemetry (
      grain_key TEXT PRIMARY KEY,
      property_url TEXT NOT NULL,
      window_days INTEGER NOT NULL,
      captured_date TEXT NOT NULL,
      query TEXT NOT NULL,
      normalized_query TEXT NOT NULL,
      page_url TEXT NOT NULL,
      country TEXT NOT NULL,
      device TEXT NOT NULL,
      clicks INTEGER NOT NULL,
      impressions INTEGER NOT NULL,
      ctr REAL NOT NULL,
      position REAL NOT NULL,
      ga4_sessions INTEGER NOT NULL DEFAULT 0,
      ga4_engaged_sessions INTEGER NOT NULL DEFAULT 0,
      ga4_bounce_rate REAL,
      ga4_conversions INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gsc_search_appearance (
      appearance_key TEXT PRIMARY KEY,
      property_url TEXT NOT NULL,
      window_days INTEGER NOT NULL,
      search_appearance TEXT NOT NULL,
      query TEXT,
      page_url TEXT,
      clicks INTEGER NOT NULL,
      impressions INTEGER NOT NULL,
      ctr REAL NOT NULL,
      position REAL NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS query_page_graph (
      edge_key TEXT PRIMARY KEY,
      normalized_query TEXT NOT NULL,
      page_url TEXT NOT NULL,
      country_code TEXT NOT NULL,
      job_role_slug TEXT,
      skill_slug TEXT,
      industry_slug TEXT,
      search_intent TEXT NOT NULL,
      page_type TEXT NOT NULL,
      inventory_count INTEGER NOT NULL DEFAULT 0,
      qualification_status TEXT NOT NULL,
      impressions_7d INTEGER NOT NULL DEFAULT 0,
      clicks_7d INTEGER NOT NULL DEFAULT 0,
      pos_7d REAL,
      impressions_28d INTEGER NOT NULL DEFAULT 0,
      clicks_28d INTEGER NOT NULL DEFAULT 0,
      ctr_28d REAL,
      pos_28d REAL,
      impressions_90d INTEGER NOT NULL DEFAULT 0,
      clicks_90d INTEGER NOT NULL DEFAULT 0,
      pos_90d REAL,
      impressions_365d INTEGER NOT NULL DEFAULT 0,
      clicks_365d INTEGER NOT NULL DEFAULT 0,
      mobile_impressions INTEGER NOT NULL DEFAULT 0,
      mobile_clicks INTEGER NOT NULL DEFAULT 0,
      ga4_sessions INTEGER NOT NULL DEFAULT 0,
      ga4_bounce_rate REAL,
      ga4_conversions INTEGER NOT NULL DEFAULT 0,
      cannibalization_count INTEGER NOT NULL DEFAULT 1,
      is_intent_mismatch INTEGER NOT NULL DEFAULT 0,
      competitor_domain TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ctr_recommendations (
      recommendation_key TEXT PRIMARY KEY,
      page_url TEXT NOT NULL,
      primary_query TEXT NOT NULL,
      query_evidence_json TEXT NOT NULL,
      page_intent TEXT NOT NULL,
      avg_position REAL NOT NULL,
      impressions INTEGER NOT NULL,
      clicks INTEGER NOT NULL,
      actual_ctr REAL NOT NULL,
      cohort_expected_ctr REAL NOT NULL,
      existing_title TEXT,
      suggested_title TEXT NOT NULL,
      existing_description TEXT,
      suggested_description TEXT NOT NULL,
      rationale TEXT NOT NULL,
      risk_assessment TEXT NOT NULL,
      priority_score REAL NOT NULL,
      governance_state TEXT NOT NULL DEFAULT 'RECOMMENDATION',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS position_attack_targets (
      attack_key TEXT PRIMARY KEY,
      page_url TEXT NOT NULL,
      position_band TEXT NOT NULL,
      query_cluster_json TEXT NOT NULL,
      primary_query TEXT NOT NULL,
      clicks INTEGER NOT NULL,
      impressions INTEGER NOT NULL,
      ctr REAL NOT NULL,
      avg_position REAL NOT NULL,
      relevant_inventory INTEGER NOT NULL,
      content_gap TEXT NOT NULL,
      internal_linking_gap INTEGER NOT NULL,
      competitor_evidence_json TEXT NOT NULL,
      suggested_action TEXT NOT NULL,
      priority_score REAL NOT NULL,
      governance_state TEXT NOT NULL DEFAULT 'RECOMMENDATION',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS competitor_benchmarks (
      benchmark_key TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      talentxcel_target_url TEXT NOT NULL,
      competitor_domain TEXT NOT NULL,
      competitor_url TEXT NOT NULL,
      source_method TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      observed_title TEXT,
      observed_h1 TEXT,
      observed_sections_json TEXT NOT NULL,
      serp_format TEXT NOT NULL,
      topic_coverage_gaps_json TEXT NOT NULL,
      differentiation_angle TEXT NOT NULL,
      captured_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS page_performance_feedback (
      page_url TEXT PRIMARY KEY,
      classification TEXT NOT NULL,
      window_7d_json TEXT NOT NULL,
      window_28d_json TEXT NOT NULL,
      window_90d_json TEXT NOT NULL,
      delta_impressions INTEGER NOT NULL,
      delta_clicks INTEGER NOT NULL,
      delta_ctr REAL NOT NULL,
      delta_position REAL NOT NULL,
      qualification_status TEXT,
      real_inventory_count INTEGER NOT NULL,
      evaluation_note TEXT NOT NULL,
      last_evaluated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS action_governance_log (
      action_id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL,
      target_url TEXT NOT NULL,
      state TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      validation_checks_json TEXT NOT NULL,
      rollback_payload_json TEXT NOT NULL,
      approved_by TEXT,
      executed_at TEXT,
      verified_at TEXT,
      reverted_at TEXT,
      audit_notes TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS growth_execution_queue (
      action_id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      query_or_cluster TEXT NOT NULL,
      action_category TEXT NOT NULL,
      execution_tier TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      supporting_evidence_json TEXT NOT NULL,
      gsc_metrics_json TEXT NOT NULL,
      ga4_metrics_json TEXT NOT NULL,
      expected_impact TEXT NOT NULL,
      confidence_score REAL NOT NULL,
      priority_score REAL NOT NULL,
      risk_level TEXT NOT NULL,
      action_status TEXT NOT NULL,
      approval_status TEXT NOT NULL,
      owner_system TEXT NOT NULL,
      proposed_changes_json TEXT NOT NULL,
      before_state_snapshot_json TEXT NOT NULL,
      after_state_snapshot_json TEXT NOT NULL,
      verification_window TEXT NOT NULL,
      rollback_instructions TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cannibalization_audits (
      query_key TEXT PRIMARY KEY,
      raw_query TEXT NOT NULL,
      ranking_urls_json TEXT NOT NULL,
      dominant_url TEXT,
      classification TEXT NOT NULL,
      impressions_total INTEGER NOT NULL,
      clicks_total INTEGER NOT NULL,
      recommendation TEXT NOT NULL,
      governance_state TEXT NOT NULL,
      audited_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS growth_scorecard_snapshots (
      snapshot_key TEXT PRIMARY KEY,
      snapshot_date TEXT NOT NULL,
      segment_type TEXT NOT NULL,
      segment_value TEXT NOT NULL,
      organic_impressions INTEGER NOT NULL,
      organic_clicks INTEGER NOT NULL,
      ctr REAL NOT NULL,
      avg_position REAL NOT NULL,
      indexed_qualified_urls INTEGER NOT NULL,
      organic_landing_pages INTEGER NOT NULL,
      organic_registrations INTEGER NOT NULL,
      organic_activation_rate REAL NOT NULL,
      conversion_rate REAL NOT NULL,
      backlog_counts_json TEXT NOT NULL,
      execution_counts_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS technical_seo_findings (
      finding_key TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      issue_category TEXT NOT NULL,
      severity TEXT NOT NULL,
      evidence_json TEXT NOT NULL,
      remediation TEXT NOT NULL,
      governance_state TEXT NOT NULL,
      detected_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS keyword_universe_candidates (
      keyword_hash TEXT PRIMARY KEY,
      keyword TEXT NOT NULL,
      normalized_keyword TEXT NOT NULL,
      semantic_group_key TEXT NOT NULL,
      search_intent TEXT NOT NULL,
      title_id TEXT,
      skill_id TEXT,
      industry_slug TEXT,
      country_code TEXT NOT NULL,
      region_key TEXT,
      geoname_id INTEGER,
      modifier TEXT,
      evidence_status TEXT NOT NULL DEFAULT 'UNKNOWN',
      quality_lifecycle_state TEXT NOT NULL DEFAULT 'GENERATED',
      recommended_destination TEXT NOT NULL,
      provenance TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_kw_cluster ON keywords(cluster_key);
    CREATE INDEX IF NOT EXISTS idx_kw_dedup ON keywords(dedup_key);
    CREATE INDEX IF NOT EXISTS idx_kw_opp_score ON keywords(opportunity_score DESC);
    CREATE INDEX IF NOT EXISTS idx_kw_dest ON keywords(recommended_destination);
    CREATE INDEX IF NOT EXISTS idx_gsc_norm ON gsc_telemetry(normalized_query);
    CREATE INDEX IF NOT EXISTS idx_clusters_opp ON clusters(opportunity_score DESC, member_count DESC);
    CREATE INDEX IF NOT EXISTS idx_geo_cities_cc_pop ON geo_cities(country_code, population DESC);
    CREATE INDEX IF NOT EXISTS idx_geo_cities_slug ON geo_cities(slug);
    CREATE INDEX IF NOT EXISTS idx_geo_regions_cc ON geo_regions(country_code);
    CREATE INDEX IF NOT EXISTS idx_job_titles_norm ON job_title_taxonomy(normalized_title);
    CREATE INDEX IF NOT EXISTS idx_skills_norm ON skills_taxonomy(normalized_skill);
    CREATE INDEX IF NOT EXISTS idx_quality_state ON keyword_quality_audit(quality_lifecycle_state, quality_score DESC);
  `);

  return db;
}

export function getCheckpoint(db: DatabaseSync, jobName: string): { cursorOffset: number; processedCount: number; metadata: Record<string, unknown> } | null {
  const row = db
    .prepare('SELECT cursor_offset, processed_count, metadata_json FROM checkpoints WHERE job_name = ?')
    .get(jobName) as { cursor_offset: number; processed_count: number; metadata_json: string } | undefined;
  if (!row) return null;
  return {
    cursorOffset: row.cursor_offset,
    processedCount: row.processed_count,
    metadata: JSON.parse(row.metadata_json || '{}'),
  };
}

export function saveCheckpoint(
  db: DatabaseSync,
  jobName: string,
  cursorOffset: number,
  processedCount: number,
  metadata: Record<string, unknown> = {}
): void {
  db.prepare(`
    INSERT INTO checkpoints (job_name, cursor_offset, processed_count, metadata_json, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(job_name) DO UPDATE SET
      cursor_offset = excluded.cursor_offset,
      processed_count = excluded.processed_count,
      metadata_json = excluded.metadata_json,
      updated_at = excluded.updated_at
  `).run(jobName, cursorOffset, processedCount, JSON.stringify(metadata), new Date().toISOString());
}
