const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('backlink-engine/data/backlink_engine.db');

const rows = db.prepare('SELECT * FROM campaign_outreach LIMIT 5').all();
console.log('Outreach records:');
console.log(rows);
