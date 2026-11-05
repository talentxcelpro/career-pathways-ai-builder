const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const db = new DatabaseSync('backlink-engine/data/backlink_engine.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in db:', tables.map(t => t.name));

for (const t of tables) {
  try {
    const count = db.prepare(`SELECT count(*) as c FROM "${t.name}"`).get();
    console.log(`Table ${t.name}: ${count.c} rows`);
  } catch (e) {
    console.log(`Table ${t.name}: error reading count: ${e.message}`);
  }
}

// Check ledger file
const ledgerPath = 'reports/TXC-BATCH-001-006-FINAL-LEDGER.csv';
if (fs.existsSync(ledgerPath)) {
  const content = fs.readFileSync(ledgerPath, 'utf8').trim().split('\n');
  console.log(`Ledger rows: ${content.length - 1}`);
}
