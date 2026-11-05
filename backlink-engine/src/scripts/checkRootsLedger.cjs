const fs = require('fs');

const ledgerLines = fs.readFileSync('reports/TXC-BATCH-001-006-FINAL-LEDGER.csv', 'utf8').trim().split('\n');
const header = ledgerLines[0].split(',');
console.log('Ledger header:', header);

// Let's see how many unique commercial root domains are in the ledger
const domainMap = new Map();
const dedupMap = new Map();

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

let sharedHostingCount = 0;
let dupCount = 0;

for (let i = 1; i < ledgerLines.length; i++) {
  const row = parseCSVLine(ledgerLines[i]);
  const candidateId = row[0];
  const batch = row[1];
  const name = row[2];
  const inputDomain = row[3];
  const registrableRoot = row[4];
  const isDuplicate = row[5];
  const isSharedHosting = row[6];
  const disposition = row[7];

  if (isDuplicate === 'YES') {
    dupCount++;
  } else if (isSharedHosting === 'YES') {
    sharedHostingCount++;
  } else {
    if (!domainMap.has(registrableRoot)) {
      domainMap.set(registrableRoot, []);
    }
    domainMap.get(registrableRoot).push({ candidateId, batch, name, inputDomain, disposition });
  }
}

console.log('Total non-dup, non-shared roots in ledger:', domainMap.size);
console.log('Duplicate candidates:', dupCount);
console.log('Shared hosting candidates:', sharedHostingCount);

// Let's check how the 8 pilot candidates, dispatched submissions, staged profiles, HRTech prospects relate to these 385 roots!
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

console.log('\nChecking 8 Pilot Roots in 385 ledger roots:');
for (const pr of pilotRoots) {
  console.log(`- ${pr}: in ledger?`, domainMap.has(pr));
}

const dispatchedRoots = ['hrstack.tech', 'softwaresuggest.com', 'techpluto.com'];
console.log('\nChecking 3 Dispatched Roots in 385 ledger roots:');
for (const dr of dispatchedRoots) {
  console.log(`- ${dr}: in ledger?`, domainMap.has(dr));
}

const stagedRoots = ['saashub.com', 'launchingnext.com', 'pitchwall.co'];
console.log('\nChecking 3 Staged Roots in 385 ledger roots:');
for (const sr of stagedRoots) {
  console.log(`- ${sr}: in ledger?`, domainMap.has(sr));
}

const hrtechRoots = [
  'shrm.org',
  'nasscom.in',
  'recruitingdaily.com',
  'indiatimes.com',
  'startupindia.gov.in',
  'ncs.gov.in',
  'iitm.ac.in',
  'iitd.ac.in',
  'iitb.ac.in',
  'bits-pilani.ac.in'
];
console.log('\nChecking 10 HRTech Roots in 385 ledger roots:');
for (const hr of hrtechRoots) {
  console.log(`- ${hr}: in ledger?`, domainMap.has(hr));
}

console.log('\nChecking rentry.co in 385 ledger roots:');
console.log('- rentry.co: in ledger?', domainMap.has('rentry.co'));
