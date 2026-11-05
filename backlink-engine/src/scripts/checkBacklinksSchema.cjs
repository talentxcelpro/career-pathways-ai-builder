const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('backlink-engine/data/backlink_engine.db');

const cols = db.prepare("PRAGMA table_info('backlinks')").all();
console.log('backlinks cols:');
cols.forEach(c => console.log(`- ${c.name} (${c.type})`));

const lastRow = db.prepare('SELECT id, referring_domain, status FROM backlinks ORDER BY id DESC LIMIT 3').all();
console.log('Last rows in backlinks:', lastRow);
