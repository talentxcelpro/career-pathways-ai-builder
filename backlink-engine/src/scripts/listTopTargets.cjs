// backlink-engine/src/scripts/listTopTargets.cjs
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);

const rows = db.prepare(`
  SELECT id, platform_name, root_domain, category, cost_tier, submission_url, current_status 
  FROM acquisition_targets 
  WHERE priority = 1
  ORDER BY id ASC
`).all();

console.log(`Found ${rows.length} priority 1 targets:`);
rows.forEach(r => console.log(`${r.id} | ${r.platform_name.padEnd(20)} | ${r.root_domain.padEnd(25)} | ${r.cost_tier.padEnd(10)} | ${r.current_status}`));
