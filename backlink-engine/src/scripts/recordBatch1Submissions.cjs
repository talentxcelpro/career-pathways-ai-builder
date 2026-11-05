// backlink-engine/src/scripts/recordBatch1Submissions.cjs
// Records confirmed submissions into the acquisition_targets DB
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);

const now = new Date().toISOString();

const updates = [
  {
    id: 'TGT_001',
    current_status: 'SUBMITTED_PENDING_REVIEW',
    notes: `SUBMITTED ${now}. API endpoint POST /api/submissions HTTP 200 {"ok":true,"demo":false}. Product: TalentXcel ATS Resume Diagnostic Scanner. Website: https://talentxcel.in/resume/ats-check. Capabilities: applicant-tracking, sourcing. Countries: IN, US, SG, AE, GB.`
  },
  {
    id: 'TGT_024',
    current_status: 'SUBMITTED_PENDING_REVIEW',
    notes: `SUBMITTED ${now}. Google Form submission via TechPluto embedded form https://docs.google.com/forms/d/e/1FAIpQLScmzHxA16yQUsr_pCwIjlMd3jvvValvon9zXs2NevoFosQ8Cg/viewform HTTP 200. Startup name: TalentXcel. URL: https://talentxcel.in. Editorial review pending.`
  }
];

const stmt = db.prepare(`UPDATE acquisition_targets SET current_status = ?, notes = ? WHERE id = ?`);

for (const u of updates) {
  stmt.run(u.current_status, u.notes, u.id);
  console.log(`Updated ${u.id} -> ${u.current_status}`);
}

// verify
const rows = db.prepare(`SELECT id, platform_name, current_status FROM acquisition_targets WHERE id IN ('TGT_001','TGT_024')`).all();
console.log('Verification:');
rows.forEach(r => console.log(`  ${r.id} | ${r.platform_name} | ${r.current_status}`));
console.log('Done.');
