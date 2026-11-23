// distribution-engine/src/db/schema.cjs
// SQLite schema definition for the TalentXcel Global Free Content Distribution Engine
// Utilizes Node.js native DatabaseSync (v22+) for fast, self-contained, zero-dependency persistence.

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const config = require('../../config.cjs');

function getDatabase(dbPath = config.PATHS.DB) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);

  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA synchronous = NORMAL;');

  initSchema(db);
  return db;
}

function initSchema(db) {
  db.exec(`
    -- 1. Main Platforms Registry
    CREATE TABLE IF NOT EXISTS platforms (
      platform_id TEXT PRIMARY KEY,
      platform_name TEXT NOT NULL,
      domain TEXT NOT NULL,
      canonical_domain TEXT NOT NULL,
      platform_url TEXT NOT NULL,
      submission_url TEXT,
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      platform_type TEXT NOT NULL,
      category TEXT NOT NULL,
      niche TEXT NOT NULL,
      submission_method TEXT NOT NULL DEFAULT 'FORM', -- 'FORM', 'EMAIL', 'COMMUNITY_POST', 'DIRECTORY_ENTRY', 'API'
      content_types_accepted TEXT DEFAULT '["ARTICLE"]', -- JSON array
      free_submission INTEGER NOT NULL DEFAULT 1, -- 1=True, 0=False
      free_verified INTEGER NOT NULL DEFAULT 0,    -- 1=True, 0=False
      account_required INTEGER NOT NULL DEFAULT 0, -- 1=True, 0=False
      editorial_requirements TEXT,
      promotion_policy TEXT,
      link_policy TEXT DEFAULT 'FOLLOW',          -- 'FOLLOW', 'NOFOLLOW', 'UGC', 'NO_LINKS'
      domain_quality_score REAL DEFAULT 0.0,
      relevance_score REAL DEFAULT 0.0,
      activity_score REAL DEFAULT 0.0,
      spam_risk_score REAL DEFAULT 0.0,
      overall_score REAL DEFAULT 0.0,
      contact_email TEXT,
      contact_url TEXT,
      discovery_source TEXT NOT NULL,
      discovery_query TEXT,
      discovered_at TEXT NOT NULL,
      last_verified_at TEXT,
      verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED', -- 'UNVERIFIED', 'VERIFIED_ACCESSIBLE', 'VERIFIED_FREE_SUBMISSION', 'VERIFIED_PAID_ONLY', 'VERIFIED_REJECTED'
      submission_status TEXT NOT NULL DEFAULT 'DISCOVERED',   -- One of 13 WORKFLOW_STATES
      submission_date TEXT,
      publication_url TEXT,
      publication_date TEXT,
      campaign_id TEXT,
      notes TEXT,
      duplicate_group TEXT,
      review_required INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_platforms_domain ON platforms(domain);
    CREATE INDEX IF NOT EXISTS idx_platforms_canonical ON platforms(canonical_domain);
    CREATE INDEX IF NOT EXISTS idx_platforms_status ON platforms(submission_status);
    CREATE INDEX IF NOT EXISTS idx_platforms_verification ON platforms(verification_status);
    CREATE INDEX IF NOT EXISTS idx_platforms_overall_score ON platforms(overall_score);
    CREATE INDEX IF NOT EXISTS idx_platforms_free_verified ON platforms(free_verified);
    CREATE INDEX IF NOT EXISTS idx_platforms_type ON platforms(platform_type);
    CREATE INDEX IF NOT EXISTS idx_platforms_country ON platforms(country);

    -- 2. Verification & Validation Audit Log
    CREATE TABLE IF NOT EXISTS platform_verification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id TEXT NOT NULL REFERENCES platforms(platform_id) ON DELETE CASCADE,
      checked_at TEXT NOT NULL,
      http_status INTEGER,
      response_time_ms INTEGER,
      ssl_valid INTEGER DEFAULT 1,
      publishing_model TEXT,
      accepts_community INTEGER DEFAULT 1,
      free_tier_confirmed INTEGER DEFAULT 0,
      promo_allowed INTEGER DEFAULT 1,
      link_allowed INTEGER DEFAULT 1,
      evidence_snippet TEXT,
      raw_guidelines TEXT,
      verdict TEXT NOT NULL,
      confidence_score REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_verif_platform ON platform_verification_logs(platform_id);

    -- 3. TalentXcel Content Concepts Library (50+ concepts)
    CREATE TABLE IF NOT EXISTS content_concepts (
      concept_id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      primary_audience TEXT NOT NULL,
      search_intent TEXT NOT NULL,
      community_relevance TEXT NOT NULL,
      suggested_format TEXT NOT NULL,
      original_angle TEXT NOT NULL,
      target_audience TEXT NOT NULL,
      suggested_cta TEXT NOT NULL,
      talentxcel_destination TEXT NOT NULL,
      thesis_outline TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_concepts_category ON content_concepts(category_id);

    -- 4. Contextual Content Variations (10 variants per concept)
    CREATE TABLE IF NOT EXISTS content_variations (
      variation_id TEXT PRIMARY KEY,
      concept_id TEXT NOT NULL REFERENCES content_concepts(concept_id) ON DELETE CASCADE,
      format_id TEXT NOT NULL,
      headline TEXT NOT NULL,
      hook TEXT NOT NULL,
      body_text TEXT NOT NULL,
      target_community TEXT NOT NULL,
      contextual_cta TEXT NOT NULL,
      destination_url TEXT NOT NULL,
      compliance_rules TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_variations_concept ON content_variations(concept_id);
    CREATE INDEX IF NOT EXISTS idx_variations_format ON content_variations(format_id);

    -- 5. Submission Drafts (Staged packages for platforms)
    CREATE TABLE IF NOT EXISTS submission_drafts (
      draft_id TEXT PRIMARY KEY,
      platform_id TEXT NOT NULL REFERENCES platforms(platform_id) ON DELETE CASCADE,
      concept_id TEXT REFERENCES content_concepts(concept_id),
      variation_id TEXT REFERENCES content_variations(variation_id),
      submission_type TEXT NOT NULL, -- 'ARTICLE', 'DIRECTORY_PROFILE', 'COMMUNITY_POST', 'RESOURCE_RECOMMENDATION'
      title TEXT NOT NULL,
      content_body TEXT NOT NULL,
      bio_or_description TEXT,
      target_url TEXT NOT NULL,
      anchor_text TEXT,
      staging_status TEXT NOT NULL DEFAULT 'DRAFT_STAGED', -- 'DRAFT_STAGED', 'READY_FOR_SUBMISSION', 'SUBMITTED', 'ARCHIVED'
      prepared_at TEXT NOT NULL,
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_drafts_platform ON submission_drafts(platform_id);
    CREATE INDEX IF NOT EXISTS idx_drafts_status ON submission_drafts(staging_status);

    -- 6. Editorial Outreach Tracking Table (Ethical, individual 1-to-1 tracking)
    CREATE TABLE IF NOT EXISTS editorial_outreach (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id TEXT NOT NULL REFERENCES platforms(platform_id) ON DELETE CASCADE,
      contact_name TEXT,
      contact_email TEXT NOT NULL,
      contact_source TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      outreach_date TEXT NOT NULL,
      reply_received INTEGER DEFAULT 0,
      reply_date TEXT,
      reply_notes TEXT,
      status TEXT NOT NULL DEFAULT 'OUTREACH_STAGED', -- 'OUTREACH_STAGED', 'SENT', 'REPLIED', 'ACCEPTED', 'REJECTED', 'FOLLOW_UP_SCHEDULED'
      follow_up_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_outreach_platform ON editorial_outreach(platform_id);
    CREATE INDEX IF NOT EXISTS idx_outreach_status ON editorial_outreach(status);

    -- 7. Engine Metrics & Snapshots
    CREATE TABLE IF NOT EXISTS metrics_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snapshot_time TEXT NOT NULL,
      total_discovered INTEGER NOT NULL,
      unique_domains INTEGER NOT NULL,
      verified_free INTEGER NOT NULL,
      rejected_count INTEGER NOT NULL,
      high_quality_count INTEGER NOT NULL, -- overall_score >= 70
      prepared_submissions INTEGER NOT NULL,
      dispatched_submissions INTEGER NOT NULL,
      published_count INTEGER NOT NULL,
      estimated_referrals INTEGER DEFAULT 0
    );
  `);
}

module.exports = {
  getDatabase,
  initSchema
};
