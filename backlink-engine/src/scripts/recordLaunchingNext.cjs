const path = require('path');
const { getDatabase } = require(path.join(__dirname, '../db/schema.cjs'));
const db = getDatabase();
const now = new Date().toISOString();

const insertBacklink = db.prepare(`
  INSERT INTO backlinks (
    url, referring_domain, target_url, anchor_text, rel_type,
    link_placement, status, is_external, http_status_code, last_latency_ms,
    first_verified_at, last_verified_at, consecutive_failures, notes,
    created_at, updated_at, link_category, channel, persistence_days
  ) VALUES (
    'https://www.launchingnext.com/s/talentxcel-resume-ats-checker',
    'launchingnext.com',
    'https://talentxcel.in/resume/ats-check',
    'TalentXcel Resume ATS Checker',
    'PENDING_EDITORIAL_REVIEW',
    'DIRECTORY_LISTING',
    'PENDING_VERIFICATION',
    1,
    200,
    1086,
    ?,
    ?,
    0,
    'Submission dispatched with HTTP 302 receipt to /thanks/?i=173944; Submission ID: 173944; Fast-Track / Free Queue',
    ?,
    ?,
    'FREE_PRODUCT_LAUNCH_DIRECTORY',
    'DIRECT_SUBMISSION',
    0
  )
`);

const res = insertBacklink.run(now, now, now, now);
const backlinkId = res.lastInsertRowid;
console.log('Inserted backlink ID:', backlinkId);

const insertLog = db.prepare(`
  INSERT INTO verification_logs (
    backlink_id, url, timestamp, http_code, response_time_ms,
    found_link, detected_anchor, detected_rel, detected_target,
    status_result, error_message
  ) VALUES (
    ?,
    'https://www.launchingnext.com/submit/',
    ?,
    200,
    1086,
    0,
    'TalentXcel Resume ATS Checker',
    'PENDING_EDITORIAL_REVIEW',
    'https://talentxcel.in/resume/ats-check',
    'DISPATCH_RECEIPT_CONFIRMED',
    'Submission Received | Launching Next (Submission ID: 173944; /thanks/?i=173944)'
  )
`);

const logRes = insertLog.run(backlinkId, now);
console.log('Inserted log ID:', logRes.lastInsertRowid);
