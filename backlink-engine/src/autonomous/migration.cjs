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
