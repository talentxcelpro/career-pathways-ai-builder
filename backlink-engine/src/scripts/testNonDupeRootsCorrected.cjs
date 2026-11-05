// backlink-engine/src/scripts/testNonDupeRootsCorrected.cjs
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

// 1. Batch 1 (4 candidates)
const b1 = [
  { batch: 'Batch 1', num: '1', name: 'HRStack', domain: 'hrstack.tech', isDupe: false },
  { batch: 'Batch 1', num: '2', name: 'SoftwareSuggest', domain: 'softwaresuggest.com', isDupe: false },
  { batch: 'Batch 1', num: '3', name: 'TechPluto', domain: 'techpluto.com', isDupe: false },
  { batch: 'Batch 1', num: '4', name: 'StartupBase', domain: 'startupbase.io', isDupe: false }
];

// 2. Batch 2 (30 candidates)
const reportsDir = path.join(__dirname, '..', '..', '..', 'reports');
const b2Lines = fs.readFileSync(path.join(reportsDir, 'TXC_DIVERSIFY_BATCH_002_PROSPECTS.csv'), 'utf8').trim().split('\n');
const b2 = b2Lines.slice(1).map(l => {
  const c = parseCSVLine(l);
  return {
    batch: 'Batch 2',
    num: c[0],
    name: c[1],
    domain: c[2],
    isDupe: false
  };
});

// 3. Batch 4 (100 candidates, 12 duplicates)
const b4DupeNums = [18, 20, 41, 42, 51, 52, 60, 62, 68, 69, 74, 88];
const b4 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch4_classified_refined.json'), 'utf8')).map(i => ({
  batch: 'Batch 4',
  num: String(i.num),
  name: i.name,
  domain: i.canonicalRoot,
  isDupe: b4DupeNums.includes(i.num)
}));

// 4. Batch 5 (100 candidates, 1 duplicate: #31 aitooltrek.com)
const b5 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_classified.json'), 'utf8')).map(i => ({
  batch: 'Batch 5',
  num: String(i.num),
  name: i.name,
  domain: i.domain,
  isDupe: i.num === 31
}));

// 5. Batch 6 (200 candidates, 35 duplicates)
const b6 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_remediated_records.json'), 'utf8')).map(i => ({
  batch: 'Batch 6',
  num: String(i.num),
  name: i.name,
  domain: i.inputDomain,
  isDupe: i.status === 'DUPLICATE'
}));

const all = [...b1, ...b2, ...b4, ...b5, ...b6];
const dupes = all.filter(c => c.isDupe);
const nonDupes = all.filter(c => !c.isDupe);

console.log('Total candidates:', all.length);
console.log('Total duplicates:', dupes.length);
console.log('Non-duplicate prospect candidates:', nonDupes.length);

const rootMap = new Map();
nonDupes.forEach(c => {
  const psl = extractRegistrableRootDomain(c.domain);
  c.psl = psl;
  const root = psl.registrableDomain.toLowerCase();
  if (!rootMap.has(root)) rootMap.set(root, []);
  rootMap.get(root).push(c);
});

console.log('Unique root domains among 386 non-duplicates:', rootMap.size);

// Are there ANY duplicate root domains among the 386?
let consolidationCount = 0;
for (const [r, recs] of rootMap.entries()) {
  if (recs.length > 1) {
    console.log(`Shared root: ${r} (${recs.length} candidates):`, recs.map(rc => `${rc.batch} #${rc.num} ${rc.name} (${rc.domain})`));
    consolidationCount += (recs.length - 1);
  }
}

console.log(`Total consolidation delta: ${consolidationCount}`);
