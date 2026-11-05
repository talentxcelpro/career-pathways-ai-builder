const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('backlink-engine/data/backlink_engine.db');

const now = new Date().toISOString();

// Insert backlink record
const backlinkStmt = db.prepare(`
  INSERT INTO backlinks (
    url, referring_domain, target_url, anchor_text, rel_type,
    link_placement, status, is_external, http_status_code, last_latency_ms,
    first_verified_at, last_verified_at, consecutive_failures, notes,
    created_at, updated_at, link_category, channel, persistence_days
  ) VALUES (
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?
  )
`);

const res = backlinkStmt.run(
  'https://aisaasradar.com/tool/talentxcel',
  'aisaasradar.com',
  'https://talentxcel.in/resume/ats-check',
  'TalentXcel Resume ATS Compatibility Checker',
  'PENDING_EDITORIAL_REVIEW',
  'DIRECTORY_LISTING',
  'PENDING_VERIFICATION',
  1,
  200,
  245,
  now,
  now,
  0,
  'Submission dispatched with HTTP 200 receipt; radar_sess=44ce43b68c1f837a66a44286f3b49477; Review turnaround: 3-5 days',
  now,
  now,
  'FREE_AI_DIRECTORY',
  'DIRECT_SUBMISSION',
  0
);

const newBacklinkId = res.lastInsertRowid;
console.log('Inserted backlink with ID:', newBacklinkId);

// Insert verification log
const logStmt = db.prepare(`
  INSERT INTO verification_logs (
    backlink_id, url, timestamp, http_code, response_time_ms,
    found_link, detected_anchor, detected_rel, detected_target,
    status_result, error_message
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

logStmt.run(
  newBacklinkId,
  'https://aisaasradar.com/submit-process.php',
  now,
  200,
  245,
  0,
  'TalentXcel Resume ATS Compatibility Checker',
  'PENDING_EDITORIAL_REVIEW',
  'https://talentxcel.in/resume/ats-check',
  'DISPATCH_RECEIPT_CONFIRMED',
  'Submission Received | AI SaaS Radar; radar_sess=44ce43b68c1f837a66a44286f3b49477; Review: 3-5 days'
);

console.log('Inserted verification_log for backlink ID:', newBacklinkId);
