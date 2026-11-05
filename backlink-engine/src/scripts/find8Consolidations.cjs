// backlink-engine/src/scripts/find8Consolidations.cjs
const fs = require('fs');

const content = fs.readFileSync('reports/TXC-BATCH-001-006-CUMULATIVE-LEDGER.csv', 'utf8');
const lines = content.trim().split('\n');

const records = lines.slice(1).map(l => {
  const cols = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < l.length; i++) {
    const c = l[i];
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ',' && !inQuotes) { cols.push(cur.trim()); cur = ''; }
    else { cur += c; }
  }
  cols.push(cur.trim());
  return {
    batch: cols[0],
    id: cols[1],
    name: cols[2],
    registrableRoot: cols[3],
    inputDomain: cols[4],
    finalUrl: cols[5],
    classification: cols[6],
    evidence: cols[7]
  };
});

console.log('Total records:', records.length);
const dupes = records.filter(r => r.classification === 'DUPLICATE' || r.classification.startsWith('DUPLICATE'));
console.log('Cross-batch duplicates:', dupes.length);

const nonDupes = records.filter(r => r.classification !== 'DUPLICATE' && !r.classification.startsWith('DUPLICATE'));
console.log('Non-duplicate records (unique prospect inputs):', nonDupes.length);

// Let's count unique registrable root domains among nonDupes
const rootMap = new Map();
nonDupes.forEach(r => {
  const root = r.registrableRoot;
  if (!rootMap.has(root)) rootMap.set(root, []);
  rootMap.get(root).push(r);
});

console.log('Unique registrable root domains among nonDupes:', rootMap.size);

console.log('\n=== THE 8 CONSOLIDATION RECORDS (Root domains with >1 candidate record among non-duplicates) ===');
let consolidationRows = [];
for (const [root, recs] of rootMap.entries()) {
  if (recs.length > 1) {
    console.log(`Root domain: ${root} (${recs.length} records):`);
    recs.forEach(rc => {
      console.log(`  - [Batch ${rc.batch} #${rc.id}] ${rc.name} | Input: ${rc.inputDomain} | Class: ${rc.classification}`);
      consolidationRows.push({ root, ...rc });
    });
  }
}

console.log('\nTotal consolidated candidate rows above 1 per root:', nonDupes.length - rootMap.size);
