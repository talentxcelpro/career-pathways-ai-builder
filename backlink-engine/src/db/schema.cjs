// backlink-engine/src/db/schema.cjs
// Native Node.js SQLite Database Architecture for TalentXcel Backlink Acquisition Engine
// Enforces strict separation of Discovered Domains, Qualified Prospects, Outreach-Ready Leads,
// Dispatched Outreach, Replies, Approved Listings, Published Backlinks, and Verified Referring Domains.

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const config = require('../config.cjs');

function getDatabase() {
  if (!fs.existsSync(config.PATHS.DATA)) {
    fs.mkdirSync(config.PATHS.DATA, { recursive: true });
  }

  const db = new DatabaseSync(config.PATHS.DB);

  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA synchronous = NORMAL;');

  initSchema(db);
  return db;
}

function initSchema(db) {
  db.exec(`
    -- 1. Referring Domains Registry (Candidates & Prospects)
    CREATE TABLE IF NOT EXISTS domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT UNIQUE NOT NULL,
      root_domain TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      geo_market TEXT NOT NULL DEFAULT 'India',
      tld_type TEXT,
      authority_tier TEXT NOT NULL DEFAULT 'TIER_3_ACCREDITED',
      authority_evidence TEXT,
      spam_score INTEGER DEFAULT 0,
      pipeline_stage TEXT NOT NULL DEFAULT 'DISCOVERED_DOMAIN', -- DISCOVERED_DOMAIN, QUALIFIED_PROSPECT, OUTREACH_READY, DISPATCHED, APPROVED, VERIFIED_REFERRING_DOMAIN
      qualification_status TEXT NOT NULL DEFAULT 'DISCOVERED', -- DISCOVERED, QUALIFIED, DISQUALIFIED
      disqualification_reason TEXT,
      primary_modality TEXT NOT NULL DEFAULT 'DIRECTORY_LISTING',
      contact_email TEXT,
      contact_page_url TEXT,
      placement_page_url TEXT,
      placement_page_status TEXT DEFAULT 'UNCHECKED', -- UNCHECKED, HTTP_200_VERIFIED, DOMAIN_200_PORTAL_VERIFIED, NETWORK_ERROR, HTTP_404_ERROR
      placement_page_latency_ms INTEGER,
      placement_page_checked_at TEXT,
      tpo_officer_name TEXT,
      discovery_source TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);
    CREATE INDEX IF NOT EXISTS idx_domains_category ON domains(category);
    CREATE INDEX IF NOT EXISTS idx_domains_pipeline ON domains(pipeline_stage);
    CREATE INDEX IF NOT EXISTS idx_domains_qstatus ON domains(qualification_status);
    CREATE INDEX IF NOT EXISTS idx_domains_placement_status ON domains(placement_page_status);

    -- 2. Outreach & Campaign Pipeline (Campus TPO & Partner Outreach)
    CREATE TABLE IF NOT EXISTS campaign_outreach (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain_id INTEGER NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
      domain TEXT NOT NULL,
      campaign_name TEXT NOT NULL,
      institution_or_org_name TEXT NOT NULL,
      recipient_role TEXT NOT NULL DEFAULT 'Training & Placement Officer / Head of Corporate Relations',
      recipient_email TEXT NOT NULL,
      placement_source_url TEXT,
      offer_details TEXT NOT NULL,
      pitch_subject TEXT NOT NULL,
      pitch_body TEXT NOT NULL,
      outreach_status TEXT NOT NULL DEFAULT 'OUTREACH_READY', -- OUTREACH_READY, DISPATCHED, DELIVERED, REPLIED, APPROVED, PUBLISHED, DECLINED
      contacted_at TEXT,
      response_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_outreach_domain ON campaign_outreach(domain);
    CREATE INDEX IF NOT EXISTS idx_outreach_status ON campaign_outreach(outreach_status);
    CREATE INDEX IF NOT EXISTS idx_outreach_campaign ON campaign_outreach(campaign_name);

    -- 3. B2B Directory Profiles (10 Premier High-Trust Directories)
    CREATE TABLE IF NOT EXISTS b2b_directory_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id TEXT UNIQUE NOT NULL, -- startup-india, crunchbase, clutch, goodfirms, softwaresuggest, producthunt, capterra, g2, wellfound, f6s
      platform_name TEXT NOT NULL,
      platform_domain TEXT NOT NULL,
      submission_url TEXT NOT NULL,
      listing_tier TEXT NOT NULL DEFAULT 'Free Organic Profile',
      cost_usd REAL DEFAULT 0.0,
      cost_inr REAL DEFAULT 0.0,
      eligibility_criteria TEXT NOT NULL,
      verification_requirements TEXT NOT NULL,
      profile_status TEXT NOT NULL DEFAULT 'PROFILE_READY_FOR_SUBMISSION', -- PROFILE_READY_FOR_SUBMISSION, SUBMITTED_PENDING_REVIEW, APPROVED_LIVE, REJECTED
      company_name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      short_description TEXT NOT NULL,
      full_description TEXT NOT NULL,
      primary_target_url TEXT NOT NULL,
      deep_link_url TEXT,
      target_anchor_text TEXT NOT NULL,
      primary_categories TEXT NOT NULL,
      verification_contact_email TEXT NOT NULL,
      submitted_at TEXT,
      published_url TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_b2b_platform ON b2b_directory_profiles(platform_id);
    CREATE INDEX IF NOT EXISTS idx_b2b_status ON b2b_directory_profiles(profile_status);

    -- 4. Acquired & Monitored Backlinks (Strictly External Referring Domains)
    CREATE TABLE IF NOT EXISTS backlinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE NOT NULL, -- The exact external published page containing the link
      referring_domain TEXT NOT NULL,
      target_url TEXT NOT NULL DEFAULT 'https://talentxcel.in',
      anchor_text TEXT,
      rel_type TEXT NOT NULL DEFAULT 'follow', -- follow, nofollow, ugc, sponsored
      link_category TEXT NOT NULL DEFAULT 'SELF_PUBLISHED_CITATION', -- SELF_PUBLISHED_CITATION, EARNED_EDITORIAL_LINK, BUSINESS_PROFILE_LINK, INSTITUTIONAL_RESOURCE_LINK, EMPLOYER_PARTNER_LINK, TRAINING_PARTNER_LINK
      channel TEXT NOT NULL DEFAULT 'RESEARCH_CITATIONS', -- EMPLOYER_PARTNERS, COLLEGES_UNIVERSITIES, TRAINING_EDUCATORS, BUSINESS_SAAS_DIRECTORIES, EDITORIAL_CONTRIBUTIONS, RESEARCH_CITATIONS
      link_placement TEXT DEFAULT 'CONTENT_EDITORIAL', -- CONTENT_EDITORIAL, RESOURCE_LIST, PROFILE_LINK, AUTHOR_BIO, OPEN_MARKDOWN_PASTE
      status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION', -- LIVE, LOST, MODIFIED, BROKEN, PENDING_VERIFICATION
      is_external INTEGER NOT NULL DEFAULT 1, -- 1=External (Valid Backlink), 0=Internal/Self-referential (Invalid)
      http_status_code INTEGER,
      last_latency_ms INTEGER,
      persistence_days INTEGER DEFAULT 0,
      first_verified_at TEXT,
      last_verified_at TEXT,
      consecutive_failures INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_backlinks_ref_domain ON backlinks(referring_domain);
    CREATE INDEX IF NOT EXISTS idx_backlinks_status ON backlinks(status);
    CREATE INDEX IF NOT EXISTS idx_backlinks_category ON backlinks(link_category);
    CREATE INDEX IF NOT EXISTS idx_backlinks_channel ON backlinks(channel);
    CREATE INDEX IF NOT EXISTS idx_backlinks_external ON backlinks(is_external);

    -- 4b. 50 Prioritized Cohort Opportunities (First Milestone of 1,000 Backlink Programme)
    CREATE TABLE IF NOT EXISTS cohort_50_opportunities (
      id TEXT PRIMARY KEY,
      platform_name TEXT NOT NULL,
      root_domain TEXT NOT NULL,
      channel TEXT NOT NULL,
      category TEXT NOT NULL,
      target_product_or_resource TEXT NOT NULL,
      official_submission_or_contact_url TEXT NOT NULL,
      free_tier_terms TEXT NOT NULL,
      cost_usd REAL DEFAULT 0.0,
      cost_inr REAL DEFAULT 0.0,
      eligibility_requirements TEXT NOT NULL,
      quarantine_or_safeguard_notes TEXT,
      opportunity_status TEXT NOT NULL DEFAULT 'QUALIFIED_STAGED',
      disqualification_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_c50_channel ON cohort_50_opportunities(channel);
    CREATE INDEX IF NOT EXISTS idx_c50_status ON cohort_50_opportunities(opportunity_status);

    -- 5. Audit & Verification Trail
    CREATE TABLE IF NOT EXISTS verification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      backlink_id INTEGER REFERENCES backlinks(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      http_code INTEGER,
      response_time_ms INTEGER,
      found_link INTEGER NOT NULL, -- 1 = true, 0 = false
      detected_anchor TEXT,
      detected_rel TEXT,
      detected_target TEXT,
      status_result TEXT NOT NULL, -- LIVE, LOST, MODIFIED, ERROR, SOURCE_PAGE_VERIFIED
      error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_vlogs_timestamp ON verification_logs(timestamp);

    -- 6. Strict 8-Metric Telemetry History
    CREATE TABLE IF NOT EXISTS engine_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      qualified_prospects INTEGER NOT NULL,
      outreach_ready_prospects INTEGER NOT NULL,
      dispatched_outreach INTEGER NOT NULL,
      replies INTEGER NOT NULL,
      approved_listings INTEGER NOT NULL,
      published_backlinks INTEGER NOT NULL,
      verified_referring_domains INTEGER NOT NULL,
      acquisition_cost_inr REAL DEFAULT 0.0,
      acquisition_cost_usd REAL DEFAULT 0.0,
      metadata_json TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON engine_metrics(timestamp);
  `);
}

module.exports = {
  getDatabase
};
