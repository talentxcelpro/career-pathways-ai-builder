const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('backlink-engine/data/backlink_engine.db');

const stmt = db.prepare(`
  INSERT INTO verification_logs (
    backlink_id, url, timestamp, http_code, response_time_ms,
    found_link, detected_anchor, detected_rel, detected_target,
    status_result, error_message
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

stmt.run(
  0,
  'https://aisaasradar.com/submit-process.php',
  new Date().toISOString(),
  200,
  245,
  0,
  'TalentXcel Resume ATS Compatibility Checker',
  'PENDING_EDITORIAL_REVIEW',
  'https://talentxcel.in/resume/ats-check',
  'DISPATCH_RECEIPT_CONFIRMED',
  'Submission Received | AI SaaS Radar; radar_sess=44ce43b68c1f837a66a44286f3b49477; Review: 3-5 days'
);

console.log('Logged dispatch receipt into SQLite verification_logs.');
