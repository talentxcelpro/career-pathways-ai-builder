const { DatabaseSync } = require('node:sqlite');

const CANONICAL_STATUSES = Object.freeze([
  'DISCOVERED', 'QUALIFIED', 'READY', 'SUBMITTED', 'PENDING_APPROVAL',
  'PUBLISHED', 'VERIFIED_LIVE', 'REJECTED', 'FAILED', 'LOST'
]);

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS autonomous_opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain_id INTEGER REFERENCES domains(id),
      root_domain TEXT NOT NULL,
      source_url TEXT,
      target_url TEXT NOT NULL DEFAULT 'https://talentxcel.in',
      category TEXT,
      relevance_score INTEGER NOT NULL DEFAULT 0,
      quality_score INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'DISCOVERED',
      policy_decision TEXT NOT NULL DEFAULT 'REVIEW',
      policy_evidence_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(root_domain, source_url, target_url)
    );
    CREATE INDEX IF NOT EXISTS idx_auto_opp_status ON autonomous_opportunities(status);
    CREATE INDEX IF NOT EXISTS idx_auto_opp_root ON autonomous_opportunities(root_domain);
    CREATE INDEX IF NOT EXISTS idx_auto_opp_domain_id ON autonomous_opportunities(domain_id);

    CREATE TABLE IF NOT EXISTS autonomous_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL REFERENCES autonomous_opportunities(id),
      idempotency_key TEXT NOT NULL UNIQUE,
      method TEXT NOT NULL,
      endpoint TEXT,
      status TEXT NOT NULL DEFAULT 'READY',
      receipt_json TEXT NOT NULL DEFAULT '{}',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      submitted_at TEXT,
      published_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_auto_sub_status ON autonomous_submissions(status);
    CREATE INDEX IF NOT EXISTS idx_auto_sub_opp ON autonomous_submissions(opportunity_id);

    CREATE TABLE IF NOT EXISTS autonomous_policy_decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL REFERENCES autonomous_opportunities(id),
      decision TEXT NOT NULL,
      reasons_json TEXT NOT NULL,
      evidence_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS autonomous_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      idempotency_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'QUEUED',
      available_at TEXT NOT NULL,
      leased_until TEXT,
      lease_token TEXT,
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_auto_jobs_ready ON autonomous_jobs(status, available_at);

    CREATE TABLE IF NOT EXISTS autonomous_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      event_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_auto_audit_created ON autonomous_audit_log(created_at);

    CREATE TABLE IF NOT EXISTS autonomous_rate_buckets (
      bucket_key TEXT PRIMARY KEY,
      window_started_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS autonomous_capabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL REFERENCES autonomous_opportunities(id),
      submission_url TEXT,
      api_available INTEGER NOT NULL DEFAULT 0,
      registration_required INTEGER NOT NULL DEFAULT 0,
      automation_permitted INTEGER,
      editorial_required INTEGER NOT NULL DEFAULT 0,
      payment_required INTEGER NOT NULL DEFAULT 0,
      captcha_detected INTEGER NOT NULL DEFAULT 0,
      login_required INTEGER NOT NULL DEFAULT 0,
      expected_rel TEXT,
      confidence REAL NOT NULL DEFAULT 0,
      evidence_json TEXT NOT NULL DEFAULT '{}',
      discovered_at TEXT NOT NULL,
      UNIQUE(opportunity_id)
    );

    CREATE TABLE IF NOT EXISTS autonomous_content_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL REFERENCES autonomous_opportunities(id),
      content_type TEXT NOT NULL,
      audience TEXT NOT NULL,
      body TEXT NOT NULL,
      facts_json TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(opportunity_id, content_type, audience),
      UNIQUE(content_hash)
    );

    CREATE TABLE IF NOT EXISTS autonomous_approval_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL REFERENCES autonomous_opportunities(id),
      submission_id INTEGER REFERENCES autonomous_submissions(id),
      state TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
      packet_json TEXT NOT NULL,
      requested_at TEXT NOT NULL,
      decided_at TEXT,
      decided_by TEXT,
      decision_notes TEXT,
      UNIQUE(opportunity_id)
    );
    CREATE INDEX IF NOT EXISTS idx_auto_approval_state ON autonomous_approval_queue(state);

    CREATE TABLE IF NOT EXISTS autonomous_simulation_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL REFERENCES autonomous_opportunities(id),
      scenario TEXT NOT NULL,
      result_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS autonomous_verification_observations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER REFERENCES autonomous_opportunities(id),
      backlink_id INTEGER REFERENCES backlinks(id),
      source_url TEXT NOT NULL,
      fetched_url TEXT,
      http_status INTEGER,
      canonical_url TEXT,
      redirect_chain_json TEXT NOT NULL DEFAULT '[]',
      found_link INTEGER NOT NULL DEFAULT 0,
      destination_url TEXT,
      anchor_text TEXT,
      rel_attributes TEXT,
      outcome TEXT NOT NULL,
      evidence_json TEXT NOT NULL DEFAULT '{}',
      is_simulation INTEGER NOT NULL DEFAULT 0,
      observed_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_auto_verify_opp ON autonomous_verification_observations(opportunity_id);

    CREATE TABLE IF NOT EXISTS autonomous_live_pilot_evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER REFERENCES autonomous_opportunities(id),
      candidate_key TEXT NOT NULL UNIQUE,
      platform_name TEXT NOT NULL,
      root_domain TEXT NOT NULL,
      submission_url TEXT,
      selection_rank INTEGER NOT NULL,
      eligibility TEXT NOT NULL,
      failure_class TEXT,
      evidence_json TEXT NOT NULL,
      evaluated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_auto_pilot_eligibility ON autonomous_live_pilot_evaluations(eligibility);

    CREATE TABLE IF NOT EXISTS autonomous_account_authorizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL REFERENCES autonomous_opportunities(id),
      account_label TEXT NOT NULL,
      authorization_state TEXT NOT NULL DEFAULT 'PENDING_OWNER_AUTHORIZATION',
      required_scope TEXT NOT NULL,
      credential_source TEXT NOT NULL DEFAULT 'ENVIRONMENT_OR_SECURE_MANAGER',
      evidence_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(opportunity_id)
    );
    CREATE INDEX IF NOT EXISTS idx_auto_account_auth_state ON autonomous_account_authorizations(authorization_state);

    CREATE TABLE IF NOT EXISTS autonomous_reconciliation_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      qualified_count INTEGER NOT NULL,
      public_permitted_count INTEGER NOT NULL,
      account_required_count INTEGER NOT NULL,
      editorial_count INTEGER NOT NULL,
      paid_count INTEGER NOT NULL,
      restricted_count INTEGER NOT NULL,
      unknown_count INTEGER NOT NULL,
      report_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS autonomous_classifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL REFERENCES autonomous_opportunities(id),
      classification TEXT NOT NULL CHECK(classification IN ('public_permitted','account_required','editorial','paid','restricted','unknown')),
      evidence_url TEXT,
      discovered_at TEXT NOT NULL,
      http_status INTEGER,
      confidence REAL NOT NULL DEFAULT 0,
      reason TEXT NOT NULL,
      submission_url TEXT,
      registrable_root_domain TEXT NOT NULL,
      cohort TEXT,
      relevance_score INTEGER NOT NULL DEFAULT 0,
      quality_score INTEGER NOT NULL DEFAULT 0,
      evidence_json TEXT NOT NULL DEFAULT '{}',
      UNIQUE(opportunity_id)
    );
    CREATE INDEX IF NOT EXISTS idx_auto_classification_kind ON autonomous_classifications(classification);
    CREATE INDEX IF NOT EXISTS idx_auto_classification_root ON autonomous_classifications(registrable_root_domain);

    CREATE TABLE IF NOT EXISTS autonomous_duplicate_domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registrable_root_domain TEXT NOT NULL UNIQUE,
      canonical_opportunity_id INTEGER REFERENCES autonomous_opportunities(id),
      duplicate_count INTEGER NOT NULL,
      duplicate_opportunity_ids_json TEXT NOT NULL,
      evidence_json TEXT NOT NULL DEFAULT '{}',
      detected_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS autonomous_opportunity_rankings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL REFERENCES autonomous_opportunities(id),
      cohort TEXT NOT NULL,
      rank INTEGER NOT NULL,
      score REAL NOT NULL,
      rationale_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      UNIQUE(opportunity_id)
    );

    CREATE TABLE IF NOT EXISTS autonomous_discovered_opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registrable_root_domain TEXT NOT NULL UNIQUE,
      source_url TEXT NOT NULL,
      discovery_source TEXT NOT NULL,
      classification TEXT NOT NULL DEFAULT 'unknown',
      evidence_json TEXT NOT NULL DEFAULT '{}',
      discovered_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS autonomous_acquisition_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      target_published_count INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PLANNING',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS autonomous_acquisition_targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL REFERENCES autonomous_acquisition_campaigns(id),
      opportunity_id INTEGER REFERENCES autonomous_opportunities(id),
      root_domain TEXT NOT NULL,
      submission_url TEXT,
      category TEXT,
      relevance_score INTEGER NOT NULL DEFAULT 0,
      quality_score INTEGER NOT NULL DEFAULT 0,
      http_status INTEGER,
      payment_status TEXT NOT NULL DEFAULT 'UNKNOWN',
      account_requirement TEXT NOT NULL DEFAULT 'UNKNOWN',
      editorial_requirement TEXT NOT NULL DEFAULT 'UNKNOWN',
      instructions TEXT,
      destination_url TEXT NOT NULL,
      proposed_anchor TEXT NOT NULL,
      evidence_json TEXT NOT NULL DEFAULT '{}',
      confidence REAL NOT NULL DEFAULT 0,
      priority_score REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'DISCOVERED',
      owner_action TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(campaign_id, root_domain)
    );
    CREATE INDEX IF NOT EXISTS idx_acq_target_status ON autonomous_acquisition_targets(campaign_id,status);
    CREATE TABLE IF NOT EXISTS autonomous_acquisition_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL REFERENCES autonomous_acquisition_campaigns(id),
      asset_key TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      facts_json TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(campaign_id,asset_key)
    );
  `);
}

function canonicalStatus(status) {
  const map = {
    DISCOVERED_DOMAIN: 'DISCOVERED', DISCOVERED: 'DISCOVERED',
    QUALIFIED_PROSPECT: 'QUALIFIED', QUALIFIED: 'QUALIFIED',
    OUTREACH_READY: 'READY', PROFILE_READY_FOR_SUBMISSION: 'READY', READY: 'READY',
    DISPATCHED: 'SUBMITTED', SUBMITTED: 'SUBMITTED',
    APPROVED: 'PUBLISHED', PUBLISHED: 'PUBLISHED', LIVE: 'VERIFIED_LIVE',
    VERIFIED_REFERRING_DOMAIN: 'VERIFIED_LIVE', LOST: 'LOST',
    REJECTED: 'REJECTED', FAILED: 'FAILED'
  };
  return map[status] || 'DISCOVERED';
}

module.exports = { migrate, canonicalStatus, CANONICAL_STATUSES };
