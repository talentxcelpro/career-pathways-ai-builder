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
console.log('Header mapping:');
header.forEach((h, idx) => console.log(`${idx}: ${h}`));

const rows = [];
for (let i = 1; i < ledgerLines.length; i++) {
  const row = parseCSVLine(ledgerLines[i]);
  const obj = {};
  header.forEach((h, idx) => {
    obj[h] = row[idx];
  });
  rows.push(obj);
}

console.log('Total rows:', rows.length);

const rootsMap = new Map();
const dups = [];
const sharedHosting = [];

rows.forEach(r => {
  const root = r['PSL_Registrable_Root'];
  const isShared = r['Is_Shared_Hosting'];
  const govStatus = r['Governance_Status'];
  const isSubdomain = r['Is_Subdomain'];

  if (govStatus === 'DUPLICATE') {
    dups.push(r);
  } else if (isShared === 'YES') {
    sharedHosting.push(r);
  } else {
    if (!rootsMap.has(root)) {
      rootsMap.set(root, []);
    }
    rootsMap.get(root).push(r);
  }
});

console.log('Distinct commercial roots (non-duplicate, non-shared):', rootsMap.size);
console.log('Duplicates count:', dups.length);
console.log('Shared hosting count:', sharedHosting.length);

// Let's inspect the 8 Pilot candidates
const pilotRoots = [
  'aisaasradar.com',
  'zalize.com',
  'thatsmy.ai',
  'deekoyaai.in',
  'aitoolsxplorer.in',
  'aibookmarks.net',
  'getstackdrop.com',
  'aigearbase.com'
];

console.log('\n--- PILOT 8 IN LEDGER ROOTS ---');
pilotRoots.forEach(pr => {
  const found = rootsMap.get(pr);
  console.log(`${pr}: found=${!!found}`, found ? found.map(f => `${f.Global_ID} (${f.Originating_Batch} #${f.Original_Candidate_Num} - ${f.Platform_Name})`) : 'NOT FOUND');
});

// Let's inspect the 3 Dispatched candidates
const dispatchedRoots = ['hrstack.tech', 'softwaresuggest.com', 'techpluto.com'];
console.log('\n--- DISPATCHED 3 IN LEDGER ROOTS ---');
dispatchedRoots.forEach(dr => {
  const found = rootsMap.get(dr);
  console.log(`${dr}: found=${!!found}`, found ? found.map(f => `${f.Global_ID} (${f.Originating_Batch} #${f.Original_Candidate_Num} - ${f.Platform_Name})`) : 'NOT FOUND');
});

// Let's inspect Staged
const stagedRoots = ['saashub.com', 'launchingnext.com', 'pitchwall.co'];
console.log('\n--- STAGED 3 IN LEDGER ROOTS ---');
stagedRoots.forEach(sr => {
  const found = rootsMap.get(sr);
  console.log(`${sr}: found=${!!found}`, found ? found.map(f => `${f.Global_ID} (${f.Originating_Batch} #${f.Original_Candidate_Num} - ${f.Platform_Name})`) : 'NOT FOUND');
});

// Check zalize.com in rows
console.log('\n--- SEARCH FOR zalize OR tools.zalize.com ---');
rows.filter(r => r.Input_Domain.includes('zalize') || r.PSL_Registrable_Root.includes('zalize')).forEach(r => {
  console.log(r);
});

// Check shared hosting rows
console.log('\n--- SHARED HOSTING ROWS ---');
sharedHosting.forEach(r => console.log(`${r.Global_ID}: ${r.Input_Domain} -> ${r.PSL_Registrable_Root} (${r.Governance_Status})`));
