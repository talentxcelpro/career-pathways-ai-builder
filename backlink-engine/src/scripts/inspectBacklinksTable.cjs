const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const db = new DatabaseSync('backlink-engine/data/backlink_engine.db');

const rows = db.prepare('SELECT * FROM backlinks LIMIT 5').all();
console.log('Sample rows from backlinks table:');
console.log(rows);

const totalBacklinks = db.prepare('SELECT count(*) as c FROM backlinks').get();
console.log('Total in backlinks table:', totalBacklinks.c);

// Check reports/TXC_BACKLINK_009_LINK_LEDGER.csv
if (fs.existsSync('reports/TXC_BACKLINK_009_LINK_LEDGER.csv')) {
  const lines = fs.readFileSync('reports/TXC_BACKLINK_009_LINK_LEDGER.csv', 'utf8').trim().split('\n');
  console.log('TXC_BACKLINK_009_LINK_LEDGER.csv lines:', lines.length);
  console.log('Header:', lines[0]);
  console.log('Sample line 1:', lines[1]);
}
