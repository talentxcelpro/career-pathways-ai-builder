// backlink-engine/src/scripts/find8ConsolidationsAccurate.cjs
const fs = require('fs');

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

const content = fs.readFileSync('reports/TXC-BATCH-001-006-CUMULATIVE-LEDGER.csv', 'utf8');
const lines = content.trim().split('\n');
const header = parseCSVLine(lines[0]);

const records = lines.slice(1).map((line, idx) => {
  const fields = parseCSVLine(line);
  return {
    globalId: fields[0],
    batch: fields[1],
    num: fields[2],
    name: fields[3],
    inputDomain: fields[4],
    rootDomain: fields[5],
    isSubdomain: fields[6] === 'true' || fields[6] === 'TRUE' || fields[6] === 'YES',
    isSharedHosting: fields[7] === 'true' || fields[7] === 'TRUE' || fields[7] === 'YES',
    hostPrefix: fields[8],
    classification: fields[9],
    relevance: fields[10],
    targetAsset: fields[11],
    pipelineStatus: fields[12],
    duplicateOfBatch: fields[13]
  };
});

console.log('Total records parsed:', records.length);

// 1. Cross-batch duplicates
const duplicates = records.filter(r => r.classification === 'DUPLICATE' || (r.duplicateOfBatch && r.duplicateOfBatch !== 'NONE_FIRST_SEEN' && r.duplicateOfBatch !== 'NONE'));
console.log('Cross-batch duplicates detected:', duplicates.length);

// 2. Unique prospect domain inputs after cross-batch duplicate removal
const uniqueProspects = records.filter(r => r.classification !== 'DUPLICATE' && (!r.duplicateOfBatch || r.duplicateOfBatch === 'NONE_FIRST_SEEN' || r.duplicateOfBatch === 'NONE'));
console.log('Non-duplicate prospect records (after cross-batch dedup):', uniqueProspects.length);

// 3. Unique registrable root domains among non-duplicates
const rootMap = new Map();
uniqueProspects.forEach(r => {
  const root = r.rootDomain.toLowerCase();
  if (!rootMap.has(root)) rootMap.set(root, []);
  rootMap.get(root).push(r);
});

console.log('Unique registrable root domains among non-duplicates:', rootMap.size);
console.log(`Difference (${uniqueProspects.length} - ${rootMap.size}): ${uniqueProspects.length - rootMap.size}`);

console.log('\n=== THE CONSOLIDATED ROOT DOMAINS (Where multiple non-duplicate prospects share 1 Registrable Root Domain) ===');
let consolidationCount = 0;
const consolidationReport = [];

for (const [root, recs] of rootMap.entries()) {
  if (recs.length > 1) {
    console.log(`\nRoot Domain: "${root}" has ${recs.length} prospect records (Consolidation factor: +${recs.length - 1}):`);
    recs.forEach(rc => {
      console.log(`  - [${rc.globalId}] ${rc.batch} #${rc.num} | Name: "${rc.name}" | Input: "${rc.inputDomain}" | Subdomain: ${rc.isSubdomain} (${rc.hostPrefix}) | SharedHosting: ${rc.isSharedHosting} | Status: ${rc.classification}`);
      consolidationReport.push({
        rootDomain: root,
        ...rc
      });
    });
    consolidationCount += (recs.length - 1);
  }
}

console.log(`\nTotal consolidation delta: ${consolidationCount} records.`);

fs.writeFileSync(
  'backlink-engine/src/scripts/root_domain_consolidation_debug.json',
  JSON.stringify({ total: records.length, duplicates: duplicates.length, nonDuplicates: uniqueProspects.length, uniqueRoots: rootMap.size, delta: consolidationCount, report: consolidationReport }, null, 2)
);
