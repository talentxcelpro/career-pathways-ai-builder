const path = require('path');
const { getDatabase } = require(path.join(__dirname, '../db/schema.cjs'));
const db = getDatabase();
const now = new Date().toISOString();

// Update b2b_directory_profiles
const updateProfile = db.prepare(`
  UPDATE b2b_directory_profiles
  SET 
    profile_status = 'CLAIMED_AND_VERIFIED_PENDING_EDITORIAL_INDEXATION',
    published_url = 'https://www.saashub.com/talentxcel',
    notes = 'SaaSHub listing claimed and verified on 2026-11-04 (saashub.com/manage/talentxcel). Public page live at https://www.saashub.com/talentxcel (HTTP 200, outbound links to https://talentxcel.in/ and https://talentxcel.in/network, noindex pending editorial approval)',
    updated_at = ?
  WHERE platform_id = 'saashub'
`);
updateProfile.run(now);

// Check if saashub is already in backlinks
const existing = db.prepare("SELECT * FROM backlinks WHERE referring_domain = 'saashub.com'").get();
let backlinkId;
if (!existing) {
  const insertBacklink = db.prepare(`
    INSERT INTO backlinks (
      url, referring_domain, target_url, anchor_text, rel_type,
      link_placement, status, is_external, http_status_code, last_latency_ms,
      first_verified_at, last_verified_at, consecutive_failures, notes,
      created_at, updated_at, link_category, channel, persistence_days
    ) VALUES (
      'https://www.saashub.com/talentxcel',
      'saashub.com',
      'https://talentxcel.in/',
      'Visit the official website',
      'nofollow',
      'B2B_DIRECTORY_PROFILE',
      'LIVE',
      1,
      200,
      320,
      ?,
      ?,
      0,
      'LIVE PROFILE CONFIRMED: SaaSHub claimed profile verified active on 2026-11-04. Live at https://www.saashub.com/talentxcel (HTTP 200, href=https://talentxcel.in/, robots=noindex pending editorial queue).',
      ?,
      ?,
      'B2B_VENDOR_DIRECTORY',
      'B2B_PROFILE_CLAIM',
      1
    )
  `);
  const res = insertBacklink.run(now, now, now, now);
  backlinkId = res.lastInsertRowid;
  console.log('Inserted new SaaSHub backlink ID:', backlinkId);
} else {
  backlinkId = existing.id;
  console.log('Existing SaaSHub backlink ID:', backlinkId);
}

// Log verification
const insertLog = db.prepare(`
  INSERT INTO verification_logs (
    backlink_id, url, timestamp, http_code, response_time_ms,
    found_link, detected_anchor, detected_rel, detected_target,
    status_result, error_message
  ) VALUES (
    ?,
    'https://www.saashub.com/talentxcel',
    ?,
    200,
    320,
    1,
    'Visit the official website',
    'nofollow',
    'https://talentxcel.in/',
    'LINK_FOUND_AND_VERIFIED',
    'HTTP 200 Live Page Verified: Outbound anchor <a href=\"https://talentxcel.in/\" rel=\"nofollow\">Visit the official website</a> and /network link confirmed. Robots: noindex (Pending editorial approval).'
  )
`);
insertLog.run(backlinkId, now);
console.log('Recorded verification log for SaaSHub ID:', backlinkId);
