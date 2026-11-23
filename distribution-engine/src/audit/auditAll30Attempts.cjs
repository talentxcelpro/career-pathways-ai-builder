/**
 * distribution-engine/src/audit/auditAll30Attempts.cjs
 * Forensic re-classification of all 30 attempts in execution_ledger.
 */

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(process.cwd(), 'distribution-engine/data/distribution_engine.db');
const db = new DatabaseSync(DB_PATH);

// Fetch all 30 records
const rows = db.prepare('SELECT * FROM execution_ledger ORDER BY ledger_id ASC').all();

console.log(`Found ${rows.length} records in execution_ledger.\n`);

const classified = rows.map(r => {
  let category = '';
  let explanation = '';
  let isLegitimateSubmissionAttempt = false;
  let isGenericContactProbe = false;
  let isBlocked = false;
  let isMalformedOrInvalid = false;
  let isRejected = false;
  let isGenuinelyAccepted = false;

  // 1-9: Editorial pitches via email
  if (r.execution_method === 'EMAIL_PITCH') {
    isBlocked = true;
    category = 'BLOCKED_CREDENTIALS';
    explanation = 'Staged editorial email pitch. Blocked prior to network transmission due to unconfigured email provider (AWS SES / SMTP).';
  }
  // 10: DEV.to API
  else if (r.execution_method === 'API') {
    isBlocked = true;
    category = 'BLOCKED_CREDENTIALS';
    explanation = 'API publishing route. Blocked prior to transmission due to unconfigured DEVTO_API_KEY.';
  }
  // 11-20: Self-Service Community Probes
  else if (r.ledger_id >= 11 && r.ledger_id <= 20) {
    if (r.submission_outcome === 'BLOCKED_CAPTCHA_GATED' || r.submission_outcome === 'FAILED_HTTP_UNREACHABLE') {
      isBlocked = true;
      category = 'BLOCKED_BOT_CHALLENGE';
      explanation = `Community publishing pathway blocked by anti-bot challenge or Cloudflare Turnstile (${r.platform_name}).`;
    } else if (r.submission_outcome === 'BLOCKED_AUTH_REQUIRED') {
      isBlocked = true;
      category = 'BLOCKED_AUTH_REQUIRED';
      explanation = `Community posting requires interactive user login session (${r.platform_name}).`;
    } else {
      isRejected = true;
      category = 'REJECTED_BY_HOST';
      explanation = `HTTP error returned during community endpoint probe (${r.http_status_code}).`;
    }
  }
  // 21-30: Batch 10 Actionable Probes
  else if (r.ledger_id >= 21 && r.ledger_id <= 30) {
    if (r.platform_id === 'REAL_0596') { // Work In Tech UK
      isMalformedOrInvalid = true;
      isGenericContactProbe = true;
      category = 'INVALID_EMPTY_ENDPOINT';
      explanation = 'Generic contact endpoint returned empty 0-byte HTTP 200 response (Caddy server null route). No form, no editorial desk, no content receipt.';
    } else if (r.http_status_code === 405) {
      isGenericContactProbe = true;
      isMalformedOrInvalid = true;
      category = 'GENERIC_CONTACT_PROBE_405';
      explanation = 'Generic contact page does not accept direct HTTP POST (Method Not Allowed).';
    } else if (r.http_status_code === 404) {
      isGenericContactProbe = true;
      isMalformedOrInvalid = true;
      category = 'GENERIC_CONTACT_PROBE_404';
      explanation = 'Generic contact/submission URL was invalid or relocated (HTTP 404 Not Found on POST).';
    } else if (r.http_status_code === 403) {
      isBlocked = true;
      category = 'BLOCKED_WAF_FORBIDDEN';
      explanation = 'Generic contact endpoint protected by WAF / CSRF validation (HTTP 403 Forbidden).';
    } else if (r.http_status_code === 408) {
      isMalformedOrInvalid = true;
      category = 'TIMEOUT_408';
      explanation = 'Connection timed out after 12s.';
    }
  }

  return {
    ledger_id: r.ledger_id,
    platform_id: r.platform_id,
    platform_name: r.platform_name,
    target_destination: r.external_destination,
    execution_method: r.execution_method,
    http_status_code: r.http_status_code,
    original_outcome: r.submission_outcome,
    audited_category: category,
    explanation: explanation,
    is_generic_contact_probe: isGenericContactProbe,
    is_blocked: isBlocked,
    is_malformed_or_invalid: isMalformedOrInvalid,
    is_rejected: isRejected,
    is_genuinely_accepted: isGenuinelyAccepted
  };
});

// Update Work In Tech UK in the database
db.prepare(`
  UPDATE execution_ledger
  SET submission_outcome = 'INVALID_EMPTY_ENDPOINT',
      evidence_notes = 'Forensic audit confirmed destination returns empty 0-byte response on Caddy server. No form, no editorial desk, zero confirmation.'
  WHERE ledger_id = 30
`).run();

db.prepare(`
  UPDATE platforms
  SET submission_status = 'REJECTED_NO_PATHWAY',
      notes = coalesce(notes, '') || ' | Audited in Phase 3.1: Empty 0-byte endpoint on Caddy'
  WHERE platform_id = 'REAL_0596'
`).run();

// Export audited breakdown
const outDir = path.join(process.cwd(), 'distribution-engine/data/exports/audit');
fs.writeFileSync(path.join(outDir, 'audited_30_attempts_classification.json'), JSON.stringify(classified, null, 2));

console.log('Audited 30 attempts breakdown:');
const summary = {
  total: classified.length,
  generic_contact_probes: classified.filter(c => c.is_generic_contact_probe).length,
  blocked: classified.filter(c => c.is_blocked).length,
  malformed_or_invalid: classified.filter(c => c.is_malformed_or_invalid).length,
  rejected: classified.filter(c => c.is_rejected).length,
  genuinely_accepted: classified.filter(c => c.is_genuinely_accepted).length
};
console.table(summary);
