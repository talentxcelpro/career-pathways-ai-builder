// backlink-engine/src/scripts/findExact8BridgeRecords.cjs
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('reports/TXC-BATCH-001-006-CUMULATIVE-LEDGER.csv', 'utf8');
const lines = content.trim().split('\n');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

const records = lines.slice(1).map(l => {
  const f = parseCSVLine(l);
  return {
    globalId: f[0],
    batch: f[1],
    num: f[2],
    name: f[3],
    inputDomain: f[4],
    rootDomain: f[5],
    isSubdomain: f[6],
    isSharedHosting: f[7],
    hostPrefix: f[8],
    classification: f[9],
    relevance: f[10],
    targetAsset: f[11],
    pipelineStatus: f[12],
    duplicateOf: f[13]
  };
});

console.log('Total cumulative records:', records.length);

// Let's filter out the 48 duplicate records
// What are the 48 duplicate records?
// Batch 6: 35 duplicates (#106 - #140)
// Batch 5: 1 duplicate (#31 aitooltrek.com)
// Batch 4: 12 duplicates
const b6Duplicates = records.filter(r => r.batch === 'Batch 6' && r.classification === 'DUPLICATE');
console.log('Batch 6 duplicates in ledger:', b6Duplicates.length);

// Let's check which records in Batch 4 or other batches were duplicates
// Let's see all records with classification === 'DUPLICATE'
const allDupesInLedger = records.filter(r => r.classification === 'DUPLICATE');
console.log('All records with classification === DUPLICATE in ledger:', allDupesInLedger.length);

// Let's inspect unique root domains in ledger
const uniqueRootsInLedger = new Set(records.map(r => r.rootDomain.toLowerCase()));
console.log('Unique root domains across ALL 434 records in ledger:', uniqueRootsInLedger.size);

// Let's see which root domains appear more than once across all 434 records
const rootOccurrences = {};
records.forEach(r => {
  const root = r.rootDomain.toLowerCase();
  if (!rootOccurrences[root]) rootOccurrences[root] = [];
  rootOccurrences[root].push(r);
});

console.log('\nRoot domains with > 1 occurrence:');
let totalMultipleCount = 0;
for (const [root, recs] of Object.entries(rootOccurrences)) {
  if (recs.length > 1) {
    totalMultipleCount += (recs.length - 1);
    console.log(`Root: ${root} (occurrences: ${recs.length})`);
    recs.forEach(rc => {
      console.log(`   [${rc.globalId}] ${rc.batch} #${rc.num}: ${rc.name} (${rc.inputDomain}) -> ${rc.classification}`);
    });
  }
}
console.log('Total multiple occurrences (434 - uniqueRoots):', totalMultipleCount);
