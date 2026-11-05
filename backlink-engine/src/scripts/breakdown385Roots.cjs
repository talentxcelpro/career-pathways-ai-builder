const fs = require('fs');

const ledgerLines = fs.readFileSync('reports/TXC-BATCH-001-006-FINAL-LEDGER.csv', 'utf8').trim().split('\n');

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
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const header = parseCSVLine(ledgerLines[0]);
const rows = [];
for (let i = 1; i < ledgerLines.length; i++) {
  const row = parseCSVLine(ledgerLines[i]);
  const obj = {};
  header.forEach((h, idx) => {
    obj[h] = row[idx];
  });
  rows.push(obj);
}

// Filter non-duplicate, non-shared commercial roots
const commercialRoots = new Map();

rows.forEach(r => {
  if (r.Governance_Status !== 'DUPLICATE' && r.Is_Shared_Hosting !== 'YES') {
    commercialRoots.set(r.PSL_Registrable_Root, r);
  }
});

console.log('Total commercial root domains:', commercialRoots.size);

// Group by Governance_Status & Pipeline_Status
const statusCounts = {};
commercialRoots.forEach(r => {
  const key = `${r.Governance_Status} | ${r.Pipeline_Status}`;
  statusCounts[key] = (statusCounts[key] || 0) + 1;
});

console.log('\nBreakdown of 385 commercial roots by Status:');
Object.entries(statusCounts).forEach(([k, v]) => {
  console.log(`  ${k}: ${v}`);
});

// Group by Batch
const batchCounts = {};
commercialRoots.forEach(r => {
  batchCounts[r.Originating_Batch] = (batchCounts[r.Originating_Batch] || 0) + 1;
});
console.log('\nBreakdown by Originating Batch:');
Object.entries(batchCounts).forEach(([k, v]) => {
  console.log(`  ${k}: ${v}`);
});
