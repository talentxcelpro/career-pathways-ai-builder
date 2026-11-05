// backlink-engine/src/scripts/comprehensiveDedupBatch4.cjs
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);

const initial = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/batch4_dedup_initial.json', 'utf8'));

// Build lookup maps from all tables
function loadTable(table, rootCol, nameCol) {
  const rows = db.prepare(`SELECT ${rootCol} as root, ${nameCol} as name FROM ${table}`).all();
  const map = new Map();
  rows.forEach(r => {
    if (r.root) map.set(r.root.toLowerCase().trim(), `${table}: ${r.name || ''}`);
  });
  return map;
}

const acqMap = loadTable('acquisition_targets', 'root_domain', 'platform_name');
const cohortMap = loadTable('cohort_50_opportunities', 'root_domain', 'platform_name');
const b2Map = loadTable('batch2_prospects', 'root_domain', 'platform_name');
const b2bMap = loadTable('b2b_directory_profiles', 'platform_domain', 'platform_name');
const domainsMap = loadTable('domains', 'root_domain', 'name');
const backlinksMap = loadTable('backlinks', 'referring_domain', 'anchor_text');

console.log('Lookup maps loaded:');
console.log(`  acquisition_targets: ${acqMap.size}`);
console.log(`  cohort_50_opportunities: ${cohortMap.size}`);
console.log(`  batch2_prospects: ${b2Map.size}`);
console.log(`  b2b_directory_profiles: ${b2bMap.size}`);
console.log(`  domains: ${domainsMap.size}`);
console.log(`  backlinks: ${backlinksMap.size}`);

const comprehensiveDedup = [];

initial.forEach(c => {
  const root = c.canonicalRoot;
  let matches = [];

  if (acqMap.has(root)) matches.push(acqMap.get(root));
  if (cohortMap.has(root)) matches.push(cohortMap.get(root));
  if (b2Map.has(root)) matches.push(b2Map.get(root));
  if (b2bMap.has(root)) matches.push(b2bMap.get(root));
  if (domainsMap.has(root)) matches.push(domainsMap.get(root));
  if (backlinksMap.has(root)) matches.push(backlinksMap.get(root));

  const isDuplicate = matches.length > 0;
  comprehensiveDedup.push({
    ...c,
    isDuplicate,
    duplicateDetails: isDuplicate ? matches.join('; ') : 'NONE_UNIQUE'
  });
});

const dupes = comprehensiveDedup.filter(d => d.isDuplicate);
const nonDupes = comprehensiveDedup.filter(d => !d.isDuplicate);

console.log(`\n=== DEDUPLICATION RESULTS ===`);
console.log(`Total Candidates Evaluated: ${comprehensiveDedup.length}`);
console.log(`Canonical Duplicates Found: ${dupes.length}`);
console.log(`Genuinely New Unique Prospects: ${nonDupes.length}`);

console.log('\nDetailed List of Duplicates:');
dupes.forEach(d => console.log(`  #${d.num.toString().padStart(3, ' ')} | ${d.name.padEnd(25)} | ${d.canonicalRoot.padEnd(25)} | ${d.duplicateDetails}`));

fs.writeFileSync('backlink-engine/src/scripts/batch4_dedup_final.json', JSON.stringify(comprehensiveDedup, null, 2), 'utf8');
