// backlink-engine/src/scripts/inspectDbTables.cjs
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in database:', tables.map(t => t.name));

for (const t of tables) {
  const info = db.prepare(`PRAGMA table_info(${t.name})`).all();
  console.log(`\nTable ${t.name}:`);
  info.forEach(col => console.log(`  - ${col.name} (${col.type})`));
}
