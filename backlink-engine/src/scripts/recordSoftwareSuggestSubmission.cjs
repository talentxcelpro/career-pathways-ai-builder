// backlink-engine/src/scripts/recordSoftwareSuggestSubmission.cjs
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);

const now = new Date().toISOString();

db.prepare(`UPDATE acquisition_targets SET current_status = ?, notes = ? WHERE id = ?`).run(
  'SUBMITTED_PENDING_REVIEW',
  `SUBMITTED ${now}. POST /registerverifyvendor/vendorsave HTTP 200 response: {status:true, comp_id:1578622, hubspot_comp_id:359202092784, message:'The Verification email has been sent to your email address.'}. Business email: founder@talentxcel.in. Verification email awaited. Company: TalentXcel. Website: https://talentxcel.in.`,
  'TGT_013'
);

console.log('Recorded SoftwareSuggest (TGT_013) submission.');
const row = db.prepare(`SELECT id, platform_name, current_status FROM acquisition_targets WHERE id = 'TGT_013'`).get();
console.log(row);
