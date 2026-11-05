// backlink-engine/src/scripts/auditPilotQA.cjs
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, '..', '..', 'data', 'backlink_engine.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

console.log('=== 1. DATABASE TABLES & RECORD COUNTS ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
for (const t of tables) {
  const count = db.prepare(`SELECT count(*) as count FROM "${t.name}"`).get();
  console.log(`Table: ${t.name.padEnd(25)} Count: ${count.count}`);
}

console.log('\n=== 2. HISTORICAL OUTREACH & CAMPAIGN DATA ===');
try {
  const campaigns = db.prepare("SELECT * FROM campaign_outreach LIMIT 10").all();
  console.log('Sample campaign outreach:', campaigns);
} catch (e) {
  console.log('campaign_outreach error:', e.message);
}

try {
  const b2b = db.prepare("SELECT * FROM b2b_directory_profiles").all();
  console.log('B2B directory profiles:', b2b);
} catch (e) {
  console.log('b2b error:', e.message);
}

try {
  const backlinkStats = db.prepare("SELECT status, count(*) as count FROM backlinks GROUP BY status").all();
  console.log('Backlink stats by status:', backlinkStats);
} catch (e) {
  console.log('backlinks error:', e.message);
}

console.log('\n=== 3. SPECIFIC DOMAIN INSPECTIONS (Batch 1, IITs, BITS, etc.) ===');
const checkDomains = [
  'rentry.co', 'hrstack.tech', 'softwaresuggest.com', 'techpluto.com',
  'saashub.com', 'launchingnext.com', 'pitchwall.co',
  'iitm.ac.in', 'iitd.ac.in', 'iitb.ac.in', 'iitk.ac.in', 'bits-pilani.ac.in'
];

for (const d of checkDomains) {
  const dom = db.prepare("SELECT * FROM domains WHERE domain LIKE ?").all(`%${d}%`);
  const bl = db.prepare("SELECT * FROM backlinks WHERE url LIKE ?").all(`%${d}%`);
  const camp = db.prepare("SELECT * FROM campaign_outreach WHERE target_domain LIKE ? OR contact_email LIKE ?").all(`%${d}%`, `%${d}%`);
  console.log(`Domain: ${d.padEnd(20)} -> Domains: ${dom.length}, Backlinks: ${bl.length}, Outreach: ${camp.length}`);
  if (bl.length > 0) {
    console.log(`   Backlink: [${bl[0].status}] ${bl[0].url} -> target: ${bl[0].target_url}`);
  }
  if (camp.length > 0) {
    console.log(`   Outreach: status=${camp[0].status}, stage=${camp[0].outreach_stage}, sent=${camp[0].sent_at}`);
  }
}

console.log('\n=== 4. B2B DIRECTORIES DISPATCH DETAILS ===');
const b2bRows = db.prepare("SELECT * FROM b2b_directory_profiles").all();
b2bRows.forEach(r => {
  console.log(`B2B Directory: ${r.platform_name || r.name} | domain: ${r.domain} | status: ${r.status} | submission_url: ${r.submission_url || r.url}`);
});

db.close();
