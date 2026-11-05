// backlink-engine/src/scripts/inspectHistoricalDetails.cjs
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'data', 'backlink_engine.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

console.log('=== ALL 13 B2B DIRECTORY PROFILES ===');
const b2b = db.prepare("SELECT * FROM b2b_directory_profiles").all();
b2b.forEach((r, idx) => {
  console.log(`[${idx+1}] id=${r.id} | platform=${r.platform_id} (${r.platform_name}) | domain=${r.platform_domain} | status=${r.profile_status} | submitted_at=${r.submitted_at} | cost=$${r.cost_usd} | url=${r.submission_url}`);
});

console.log('\n=== IIT & BITS IN CAMPAIGN_OUTREACH ===');
const campus = db.prepare("SELECT id, domain, institution_or_org_name, outreach_status, contacted_at, created_at, recipient_email FROM campaign_outreach WHERE domain LIKE '%iit%' OR domain LIKE '%bits%'").all();
console.log(`Found ${campus.length} campus rows:`);
campus.forEach(c => {
  console.log(` - ID: ${c.id} | Domain: ${c.domain.padEnd(15)} | Org: ${c.institution_or_org_name} | Status: ${c.outreach_status} | Contacted: ${c.contacted_at} | Email: ${c.recipient_email}`);
});

console.log('\n=== BACKLINKS TABLE AUDIT ===');
const blStats = db.prepare("SELECT status, count(*) as count FROM backlinks GROUP BY status").all();
console.log('Backlinks table count by status:', blStats);

const sampleBl = db.prepare("SELECT id, domain_id, url, target_url, anchor_text, status, verified_at, http_status FROM backlinks LIMIT 5").all();
console.log('Sample backlinks:', sampleBl);

// Let's check domains in backlinks table
const blDomains = db.prepare(`
  SELECT d.domain, b.status, count(*) as count 
  FROM backlinks b 
  JOIN domains d ON b.domain_id = d.id 
  GROUP BY d.domain, b.status
`).all();
console.log('Backlinks by domain in database:', blDomains);

db.close();
