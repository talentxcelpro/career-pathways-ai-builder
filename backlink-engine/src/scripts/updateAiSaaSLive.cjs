const path = require('path');
const { getDatabase } = require(path.join(__dirname, '../db/schema.cjs'));
const db = getDatabase();
const now = new Date().toISOString();

const updateBacklink = db.prepare(`
  UPDATE backlinks 
  SET 
    status = 'LIVE',
    rel_type = 'ugc nofollow',
    url = 'https://aisaasradar.com/?s=talentxcel',
    http_status_code = 200,
    last_verified_at = ?,
    notes = 'LIVE VERIFIED: Listing published on AI SaaS Radar with redirect /out.php?id=50146487fdcce4e1 targeting https://talentxcel.in/resume/ats-check (HTTP 302 -> 200)'
  WHERE id = 131
`);

updateBacklink.run(now);

const insertLog = db.prepare(`
  INSERT INTO verification_logs (
    backlink_id, url, timestamp, http_code, response_time_ms,
    found_link, detected_anchor, detected_rel, detected_target,
    status_result, error_message
  ) VALUES (
    131,
    'https://aisaasradar.com/?s=talentxcel',
    ?,
    200,
    185,
    1,
    'TalentXcel Resume ATS Compatibility Checker',
    'ugc nofollow noopener noreferrer',
    'https://talentxcel.in/resume/ats-check',
    'LINK_FOUND_AND_VERIFIED',
    'Direct outbound link active via /out.php?id=50146487fdcce4e1 (HTTP 302 -> https://talentxcel.in/resume/ats-check)'
  )
`);

insertLog.run(now);
console.log('Successfully updated backlink ID 131 to LIVE and logged verification!');
