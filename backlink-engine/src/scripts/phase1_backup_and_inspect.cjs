// backlink-engine/src/scripts/phase1_backup_and_inspect.cjs
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, '../../data/backlink_engine.db');
const timestamp = Date.now();
const backupPath = path.join(__dirname, `../../data/backlink_engine_backup_${timestamp}.db`);

fs.copyFileSync(dbPath, backupPath);
console.log('Database backup created at:', backupPath);

const db = new DatabaseSync(dbPath);
const integrity = db.prepare('PRAGMA integrity_check').all();
console.log('Database integrity check:', JSON.stringify(integrity));

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Tables and row counts:');
const tableStats = {};
tables.forEach(t => {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get().count;
  tableStats[t.name] = count;
  console.log(`  - ${t.name}: ${count} rows`);
});

fs.writeFileSync(
  path.join(__dirname, 'phase1_db_stats.json'),
  JSON.stringify({ backupPath, integrity, tableStats, timestamp }, null, 2)
);
console.log('Saved phase1_db_stats.json');
