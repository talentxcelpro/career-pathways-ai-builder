// backlink-engine/src/scripts/checkInventoryDuplicates.cjs
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);

const keywords = ['slashdot', 'infoq', 'serchen', 'publicapis', 'appvizer', 'crowdreviews', 'tekpon', 'builtin', 'personneltoday', 'stackoverflow'];

for (const kw of keywords) {
  const domMatches = db.prepare(`SELECT id, root_domain, domain, name FROM domains WHERE root_domain LIKE ? OR domain LIKE ? OR name LIKE ?`).all(`%${kw}%`, `%${kw}%`, `%${kw}%`);
  const acqMatches = db.prepare(`SELECT id, root_domain, platform_name FROM acquisition_targets WHERE root_domain LIKE ? OR platform_name LIKE ?`).all(`%${kw}%`, `%${kw}%`);
  const cohortMatches = db.prepare(`SELECT id, root_domain, platform_name FROM cohort_50_opportunities WHERE root_domain LIKE ? OR platform_name LIKE ?`).all(`%${kw}%`, `%${kw}%`);
  const b2Matches = db.prepare(`SELECT prospect_id, root_domain, platform_name FROM batch2_prospects WHERE root_domain LIKE ? OR platform_name LIKE ?`).all(`%${kw}%`, `%${kw}%`);
  
  console.log(`Keyword: ${kw}`);
  if (domMatches.length) console.log('  domains:', domMatches);
  if (acqMatches.length) console.log('  acquisition_targets:', acqMatches);
  if (cohortMatches.length) console.log('  cohort_50_opportunities:', cohortMatches);
  if (b2Matches.length) console.log('  batch2_prospects:', b2Matches);
}
