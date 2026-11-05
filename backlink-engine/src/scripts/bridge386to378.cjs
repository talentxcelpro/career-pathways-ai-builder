// backlink-engine/src/scripts/bridge386to378.cjs
const fs = require('fs');
const path = require('path');

// Let's load the raw data for Batches 1, 2, 4, 5, 6 exactly as defined
const reportsDir = path.join(__dirname, '..', '..', '..', 'reports');

const b1Candidates = [
  { batch: 'Batch 1', num: 1, name: 'HRStack', domain: 'hrstack.tech', status: 'SUBMITTED_PENDING_REVIEW' },
  { batch: 'Batch 1', num: 2, name: 'SoftwareSuggest', domain: 'softwaresuggest.com', status: 'SUBMITTED_PENDING_REVIEW' },
  { batch: 'Batch 1', num: 3, name: 'TechPluto', domain: 'techpluto.com', status: 'SUBMITTED_PENDING_REVIEW' },
  { batch: 'Batch 1', num: 4, name: 'StartupBase', domain: 'startupbase.io', status: 'AUTH_REQUIRED' }
];

const b2Raw = fs.readFileSync(path.join(reportsDir, 'TXC_DIVERSIFY_BATCH_002_PROSPECTS.csv'), 'utf8')
  .trim().split('\n').slice(1).map(line => {
    const cols = line.split('","').map(c => c.replace(/^"|"$/g, ''));
    return {
      batch: 'Batch 2',
      id: cols[0],
      name: cols[1],
      domain: cols[2],
      status: cols[4]
    };
  });

const b4Raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch4_classified_refined.json'), 'utf8')).map(item => ({
  batch: 'Batch 4',
  num: item.num,
  name: item.name,
  domain: item.canonicalRoot,
  status: item.classification
}));

const b5Raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_classified.json'), 'utf8')).map(item => ({
  batch: 'Batch 5',
  num: item.num,
  name: item.name,
  domain: item.domain,
  status: item.status
}));

const b6Records = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_remediated_records.json'), 'utf8')).map(item => ({
  batch: 'Batch 6',
  num: item.num,
  name: item.name,
  domain: item.inputDomain,
  status: item.classification
}));

const allCandidates = [
  ...b1Candidates,
  ...b2Raw,
  ...b4Raw,
  ...b5Raw,
  ...b6Records
];

console.log('Total cumulative candidates:', allCandidates.length);

// Public Suffix List logic for registrable domain extraction
function extractRegistrableRootDomain(input) {
  if (!input) return { registrableDomain: 'UNVERIFIED', isSubdomain: false, isSharedHosting: false, hostPrefix: '' };
  
  let clean = input.toLowerCase().trim();
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
  clean = clean.split('/')[0].split(':')[0];

  if (clean.endsWith('.pages.dev')) {
    const parts = clean.split('.');
    return {
      registrableDomain: 'pages.dev',
      isSubdomain: true,
      isSharedHosting: true,
      hostPrefix: parts.slice(0, -2).join('.')
    };
  }

  if (clean.endsWith('.vercel.app')) {
    const parts = clean.split('.');
    return {
      registrableDomain: 'vercel.app',
      isSubdomain: true,
      isSharedHosting: true,
      hostPrefix: parts.slice(0, -2).join('.')
    };
  }

  const multiPartTlds = ['.co.uk', '.com.au', '.co.in', '.ac.in', '.org.uk', '.org.in', '.net.in', '.gen.in'];
  for (const tld of multiPartTlds) {
    if (clean.endsWith(tld)) {
      const remainder = clean.slice(0, -tld.length);
      const parts = remainder.split('.');
      const sld = parts[parts.length - 1];
      const registrableDomain = `${sld}${tld}`;
      const isSubdomain = parts.length > 1;
      const hostPrefix = isSubdomain ? parts.slice(0, -1).join('.') : '';
      return { registrableDomain, isSubdomain, isSharedHosting: false, hostPrefix };
    }
  }

  const parts = clean.split('.');
  if (parts.length >= 2) {
    const registrableDomain = parts.slice(-2).join('.');
    const isSubdomain = parts.length > 2;
    const hostPrefix = isSubdomain ? parts.slice(0, -2).join('.') : '';
    return { registrableDomain, isSubdomain, isSharedHosting: false, hostPrefix };
  }

  return { registrableDomain: clean, isSubdomain: false, isSharedHosting: false, hostPrefix: '' };
}

// 1. Exact Input Domain Deduplication (First Seen Rule)
const seenInputs = new Map();
const exactInputDuplicates = [];
const uniqueInputCandidates = [];

allCandidates.forEach(c => {
  const cleanInput = (c.domain || '').toLowerCase().trim().replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0].split(':')[0];
  if (seenInputs.has(cleanInput)) {
    exactInputDuplicates.push({ candidate: c, duplicateOf: seenInputs.get(cleanInput) });
  } else {
    seenInputs.set(cleanInput, c);
    uniqueInputCandidates.push({ ...c, cleanInput });
  }
});

console.log(`Exact Input Domain Deduplication:`);
console.log(` - Total Candidates: ${allCandidates.length}`);
console.log(` - Exact Input Duplicates: ${exactInputDuplicates.length}`);
console.log(` - Unique Input Candidates: ${uniqueInputCandidates.length}`);

// 2. Now resolve uniqueInputCandidates to Registrable Root Domains
const rootDomainMap = new Map();
uniqueInputCandidates.forEach(c => {
  const r = extractRegistrableRootDomain(c.cleanInput);
  c.psl = r;
  const root = r.registrableDomain.toLowerCase();
  if (!rootDomainMap.has(root)) rootDomainMap.set(root, []);
  rootDomainMap.get(root).push(c);
});

console.log(`\nRegistrable Root Domain Analysis:`);
console.log(` - Unique Registrable Root Domains: ${rootDomainMap.size}`);
console.log(` - Delta (Unique Input Candidates - Unique Root Domains): ${uniqueInputCandidates.length - rootDomainMap.size}`);

console.log('\n=== THE CONSOLIDATION CASES (Multiple distinct inputs sharing the same root domain) ===');
const consolidationBridge = [];
for (const [root, recs] of rootDomainMap.entries()) {
  if (recs.length > 1) {
    console.log(`Root: ${root} (${recs.length} distinct input candidates):`);
    recs.forEach(r => {
      console.log(`  - [${r.batch} #${r.num || r.id}] ${r.name} | Input: ${r.cleanInput} | Subdomain: ${r.psl.isSubdomain} (${r.psl.hostPrefix}) | SharedHosting: ${r.psl.isSharedHosting} | Status: ${r.status}`);
      consolidationBridge.push({
        rootDomain: root,
        candidateName: r.name,
        batch: r.batch,
        id: r.num || r.id,
        cleanInput: r.cleanInput,
        isSubdomain: r.psl.isSubdomain,
        isSharedHosting: r.psl.isSharedHosting,
        hostPrefix: r.psl.hostPrefix,
        status: r.status
      });
    });
  }
}

fs.writeFileSync('backlink-engine/src/scripts/bridge_results.json', JSON.stringify({
  totalCandidates: allCandidates.length,
  exactInputDuplicatesCount: exactInputDuplicates.length,
  uniqueInputCandidatesCount: uniqueInputCandidates.length,
  uniqueRootDomainsCount: rootDomainMap.size,
  delta: uniqueInputCandidates.length - rootDomainMap.size,
  consolidationBridge
}, null, 2));
