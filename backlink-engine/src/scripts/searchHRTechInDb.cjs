// backlink-engine/src/scripts/searchHRTechInDb.cjs
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'data', 'backlink_engine.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

console.log('=== SEARCHING HRTECH / RECRUITMENT / CAREER TARGETS IN DATABASE ===');

// Check acquisition_targets
try {
  const hrTargets = db.prepare(`
    SELECT id, platform_name, domain, category, official_submission_url, current_status 
    FROM acquisition_targets 
    WHERE category LIKE '%HR%' 
       OR category LIKE '%Recruit%' 
       OR category LIKE '%Career%' 
       OR category LIKE '%Resume%'
       OR platform_name LIKE '%HR%'
       OR platform_name LIKE '%Recruit%'
       OR platform_name LIKE '%Career%'
       OR platform_name LIKE '%Staffing%'
       OR platform_name LIKE '%Job%'
    LIMIT 30
  `).all();
  console.log(`Found ${hrTargets.length} HRTech/Career targets in acquisition_targets:`);
  hrTargets.forEach(t => console.log(`  [${t.id}] ${t.platform_name} (${t.domain}) | Category: ${t.category} | Status: ${t.current_status}`));
} catch (e) {
  console.log('acquisition_targets query error:', e.message);
}

// Check b2b_directory_profiles
try {
  const b2b = db.prepare(`
    SELECT id, platform_id, platform_name, platform_domain, primary_categories, profile_status 
    FROM b2b_directory_profiles
  `).all();
  console.log(`\nFound ${b2b.length} B2B directory profiles:`);
  b2b.forEach(b => console.log(`  [${b.id}] ${b.platform_name} (${b.platform_domain}) | Categories: ${b.primary_categories} | Status: ${b.profile_status}`));
} catch (e) {
  console.log('b2b query error:', e.message);
}

// Check domains table for HR/Recruitment/Career
try {
  const hrDomains = db.prepare(`
    SELECT id, domain, category, tier, status 
    FROM domains 
    WHERE category LIKE '%HR%' 
       OR category LIKE '%Recruitment%' 
       OR category LIKE '%Career%' 
       OR category LIKE '%Education%'
       OR category LIKE '%College%'
    LIMIT 20
  `).all();
  console.log(`\nFound sample domains in domains table:`);
  hrDomains.forEach(d => console.log(`  [${d.id}] ${d.domain} | Category: ${d.category} | Tier: ${d.tier} | Status: ${d.status}`));
} catch (e) {
  console.log('domains query error:', e.message);
}

db.close();
