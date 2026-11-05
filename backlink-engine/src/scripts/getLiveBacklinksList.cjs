const path = require('path');
const { getDatabase } = require(path.join(__dirname, '../db/schema.cjs'));
const db = getDatabase();

const liveBacklinks = db.prepare(`
  SELECT id, referring_domain, url, target_url, anchor_text, rel_type, http_status_code, status 
  FROM backlinks 
  WHERE status = 'LIVE'
`).all();

console.log('Total LIVE records in backlinks table:', liveBacklinks.length);
const byDomain = {};
liveBacklinks.forEach(b => {
  byDomain[b.referring_domain] = (byDomain[b.referring_domain] || 0) + 1;
});
console.log('Breakdown by domain:', byDomain);

console.log('\n--- Non-Rentry Live Backlinks (Full Paths) ---');
liveBacklinks.filter(b => b.referring_domain !== 'rentry.co').forEach(b => {
  console.log(`[ID ${b.id}] Domain: ${b.referring_domain}`);
  console.log(`  Source URL: ${b.url}`);
  console.log(`  Target URL: ${b.target_url}`);
  console.log(`  Anchor: ${b.anchor_text}`);
  console.log(`  Rel: ${b.rel_type}`);
});

console.log('\n--- Sample Rentry Live Backlinks (First 5 and Last 5 of 120 Pages) ---');
const rentry = liveBacklinks.filter(b => b.referring_domain === 'rentry.co');
rentry.slice(0, 5).forEach(b => console.log(`  ${b.url} -> ${b.target_url}`));
console.log('  ...');
rentry.slice(-5).forEach(b => console.log(`  ${b.url} -> ${b.target_url}`));
