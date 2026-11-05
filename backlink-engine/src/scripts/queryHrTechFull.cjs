const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'data', 'backlink_engine.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

console.log('=== HRTECH TARGETS IN acquisition_targets ===');
const rows = db.prepare(`
  SELECT id, platform_name, root_domain, category, submission_url, current_status 
  FROM acquisition_targets 
  WHERE category LIKE '%HR%' 
     OR category LIKE '%Recruit%' 
     OR category LIKE '%Career%' 
     OR category LIKE '%Job%' 
     OR category LIKE '%Staff%'
     OR platform_name LIKE '%HR%' 
     OR platform_name LIKE '%Recruit%' 
     OR platform_name LIKE '%Talent%' 
     OR platform_name LIKE '%Career%'
`).all();

console.log(`Found ${rows.length} rows in acquisition_targets:`);
rows.forEach(r => {
  console.log(`  [${r.id}] ${r.platform_name.padEnd(25)} | domain: ${r.root_domain.padEnd(25)} | category: ${r.category.padEnd(25)} | status: ${r.current_status}`);
});

console.log('\n=== HRTECH / RECRUITMENT IN domains TABLE ===');
const dRows = db.prepare(`
  SELECT id, domain, root_domain, name, category, subcategory, authority_tier 
  FROM domains 
  WHERE category LIKE '%HR%' 
     OR category LIKE '%Recruitment%' 
     OR category LIKE '%Career%' 
     OR category LIKE '%Staffing%' 
     OR subcategory LIKE '%HR%' 
     OR subcategory LIKE '%Recruit%'
  LIMIT 25
`).all();

console.log(`Found ${dRows.length} sample rows in domains table:`);
dRows.forEach(d => {
  console.log(`  [${d.id}] ${(d.name || d.domain).padEnd(30)} | root: ${d.root_domain.padEnd(25)} | cat: ${d.category} / ${d.subcategory}`);
});

db.close();
