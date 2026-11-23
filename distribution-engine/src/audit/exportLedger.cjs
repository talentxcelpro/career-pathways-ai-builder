/**
 * distribution-engine/src/audit/exportLedger.cjs
 * Exports execution_ledger to JSON and CSV.
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(process.cwd(), 'distribution-engine/data/distribution_engine.db');
const db = new DatabaseSync(DB_PATH);

const rows = db.prepare('SELECT * FROM execution_ledger ORDER BY ledger_id ASC').all();
const outDir = path.join(process.cwd(), 'distribution-engine/data/exports/audit');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'execution_ledger.json'), JSON.stringify(rows, null, 2));

if (rows.length > 0) {
  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(',')];
  rows.forEach(r => {
    const vals = headers.map(h => '"' + String(r[h] || '').replace(/"/g, '""') + '"');
    csvLines.push(vals.join(','));
  });
  fs.writeFileSync(path.join(outDir, 'execution_ledger.csv'), csvLines.join('\n'));
}

console.log(`Exported ${rows.length} execution ledger records.`);
