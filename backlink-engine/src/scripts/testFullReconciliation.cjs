// backlink-engine/src/scripts/testFullReconciliation.cjs
const fs = require('fs');
const path = require('path');

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
    const hostPrefix = isSubdomain ? parts.slice(0, -1).join('.') : '';
    return { registrableDomain, isSubdomain, isSharedHosting: false, hostPrefix };
  }

  return { registrableDomain: clean, isSubdomain: false, isSharedHosting: false, hostPrefix: '' };
}

// 1. Load Batches 1, 2, 4, 5, 6
const b1 = [
  { batch: 'Batch 1', num: 1, name: 'HRStack', domain: 'hrstack.tech', status: 'SUBMITTED_PENDING_REVIEW', score: 5 },
  { batch: 'Batch 1', num: 2, name: 'SoftwareSuggest', domain: 'softwaresuggest.com', status: 'SUBMITTED_PENDING_REVIEW', score: 5 },
  { batch: 'Batch 1', num: 3, name: 'TechPluto', domain: 'techpluto.com', status: 'SUBMITTED_PENDING_REVIEW', score: 5 },
  { batch: 'Batch 1', num: 4, name: 'StartupBase', domain: 'startupbase.io', status: 'AUTH_REQUIRED', score: 4 }
];

const reportsDir = path.join(__dirname, '..', '..', '..', 'reports');
const b2Lines = fs.readFileSync(path.join(reportsDir, 'TXC_DIVERSIFY_BATCH_002_PROSPECTS.csv'), 'utf8').trim().split('\n');
const b2 = b2Lines.slice(1).map(l => {
  const c = parseCSVLine(l);
  return {
    batch: 'Batch 2',
    num: c[0],
    name: c[1],
    domain: c[2],
    status: c[13] === 'READY_FOR_APPROVAL' ? 'READY_FOR_HUMAN_APPROVAL' : c[13],
    score: parseInt(c[7], 10) || 4
  };
});

const b4 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch4_classified_refined.json'), 'utf8')).map(i => ({
  batch: 'Batch 4',
  num: i.num,
  name: i.name,
  domain: i.canonicalRoot,
  status: i.classification,
  score: i.relevanceScore || 3
}));

const b5 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_classified.json'), 'utf8')).map(i => ({
  batch: 'Batch 5',
  num: i.num,
  name: i.name,
  domain: i.domain,
  status: i.status,
  score: i.score || 3
}));

const b6 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_remediated_records.json'), 'utf8')).map(i => ({
  batch: 'Batch 6',
  num: i.num,
  name: i.name,
  domain: i.inputDomain,
  status: i.classification,
  score: i.relevanceScore || 3
}));

const all = [...b1, ...b2, ...b4, ...b5, ...b6];
console.log('Total cumulative candidate records:', all.length);

// Let's do exact input deduplication (e.g. domain string matching)
const seenDomainInputs = new Map();
const duplicatesByInput = [];
const uniqueCandidates = [];

all.forEach(c => {
  const cleanInput = (c.domain || '').toLowerCase().trim().replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0].split(':')[0];
  if (seenDomainInputs.has(cleanInput)) {
    duplicatesByInput.push({
      record: c,
      duplicateOf: seenDomainInputs.get(cleanInput)
    });
  } else {
    seenDomainInputs.set(cleanInput, { batch: c.batch, num: c.num, name: c.name, domain: cleanInput });
    uniqueCandidates.push({ ...c, cleanInput });
  }
});

console.log(`\n=== STEP 1: DEDUPLICATION BY EXACT CANDIDATE INPUT ===`);
console.log(`Total Candidates: ${all.length}`);
console.log(`Exact Input Duplicates: ${duplicatesByInput.length}`);
console.log(`Unique Prospect Candidate Inputs: ${uniqueCandidates.length}`);

// Let's see what the duplicates are:
const dupesByBatch = {};
duplicatesByInput.forEach(d => {
  dupesByBatch[d.record.batch] = (dupesByBatch[d.record.batch] || 0) + 1;
});
console.log('Duplicates breakdown by batch:', dupesByBatch);

// STEP 2: REGISTRABLE ROOT DOMAINS UNDER PUBLIC SUFFIX LIST
const rootMap = new Map();
uniqueCandidates.forEach(c => {
  const psl = extractRegistrableRootDomain(c.cleanInput);
  c.psl = psl;
  const root = psl.registrableDomain.toLowerCase();
  if (!rootMap.has(root)) rootMap.set(root, []);
  rootMap.get(root).push(c);
});

console.log(`\n=== STEP 2: REGISTRABLE ROOT DOMAIN CONSOLIDATION ===`);
console.log(`Unique Registrable Root Domains: ${rootMap.size}`);
console.log(`Consolidation Delta (${uniqueCandidates.length} unique candidates - ${rootMap.size} root domains): ${uniqueCandidates.length - rootMap.size}`);

console.log('\n=== THE CONSOLIDATION CASES (Roots shared by multiple distinct unique candidates) ===');
const consolidationCases = [];
for (const [root, recs] of rootMap.entries()) {
  if (recs.length > 1) {
    console.log(`Root Domain "${root}" has ${recs.length} candidates (+${recs.length - 1}):`);
    recs.forEach(r => {
      console.log(`  - [${r.batch} #${r.num}] ${r.name} (${r.cleanInput}) | Subdomain: ${r.psl.isSubdomain} (${r.psl.hostPrefix}) | SharedHosting: ${r.psl.isSharedHosting} | Status: ${r.status}`);
      consolidationCases.push(r);
    });
  }
}
