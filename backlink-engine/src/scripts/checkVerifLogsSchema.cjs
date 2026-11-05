const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('backlink-engine/data/backlink_engine.db');

const cols = db.prepare("PRAGMA table_info('verification_logs')").all();
console.log('verification_logs columns:');
cols.forEach(c => console.log(`- ${c.name} (${c.type})`));

const sample = db.prepare('SELECT * FROM verification_logs ORDER BY id DESC LIMIT 1').get();
console.log('Latest row:', sample);
