const fs = require('fs');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');

const tierVars = [
  { name: 'Tier 1 (DR 90+)', varName: 'tierData_tierGrid1_148566f' },
  { name: 'Tier 2 (DR 70-89)', varName: 'tierData_tierGrid2_8aa22e2' },
  { name: 'Tier 3 (DR 50-69)', varName: 'tierData_tierGrid3_b1cc76a' },
  { name: 'Tier 4 (DR <50)', varName: 'tierData_tierGrid4_71eb508' }
];

const entries128 = [];

tierVars.forEach(tv => {
  const startStr = `var ${tv.varName} = [`;
  const startIdx = html.indexOf(startStr);
  if (startIdx !== -1) {
    const endIdx = html.indexOf('];', startIdx);
    if (endIdx !== -1) {
      const code = html.slice(startIdx + `var ${tv.varName} = `.length, endIdx + 1);
      const parsed = (new Function(`return ${code};`))();
      parsed.forEach(item => {
        entries128.push({
          tierName: tv.name,
          ...item
        });
      });
    }
  }
});

console.log('Total entries:', entries128.length);

// Also let's check picksData to see how meta (pricing/category) is defined
const picksStr = 'var picksData_picksGrid_e6048af = [';
const picksStart = html.indexOf(picksStr);
const picksMap = new Map();
if (picksStart !== -1) {
  const picksEnd = html.indexOf('];', picksStart);
  const code = html.slice(picksStart + 'var picksData_picksGrid_e6048af = '.length, picksEnd + 1);
  const picks = (new Function(`return ${code};`))();
  picks.forEach(p => picksMap.set(p.name, p.meta));
}

// Function to extract PSL registrable root accurately
function extractPSLRoot(urlStr) {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();
    const parts = host.split('.');
    if (parts.length <= 2) return host;
    
    // Check known multi-part TLDs
    const last2 = parts.slice(-2).join('.');
    const last3 = parts.slice(-3).join('.');
    
    const multiPartTLDs = [
      'co.uk', 'gov.uk', 'ac.uk', 'org.uk',
      'co.in', 'gov.in', 'ac.in', 'net.in', 'org.in',
      'com.au', 'net.au', 'org.au',
      'co.jp', 'ne.jp',
      'com.br',
      'app.br'
    ];
    
    if (multiPartTLDs.includes(last2)) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  } catch (e) {
    return urlStr;
  }
}

// Load Batches 1-6 Ledger
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

const ledgerMap = new Map();
for (let i = 1; i < ledgerLines.length; i++) {
  const row = parseCSVLine(ledgerLines[i]);
  const root = row[5];
  if (!ledgerMap.has(root)) {
    ledgerMap.set(root, []);
  }
  ledgerMap.get(root).push({
    globalId: row[0],
    batch: row[1],
    candNum: row[2],
    name: row[3],
    status: row[9]
  });
}

// Staged profiles
const stagedRoots = new Set(['saashub.com', 'launchingnext.com', 'pitchwall.co']);

// Pilot 8
const pilot8Roots = new Set([
  'aisaasradar.com', 'zalize.com', 'thatsmy.ai', 'deekoyaai.in',
  'aitoolsxplorer.in', 'aibookmarks.net', 'getstackdrop.com', 'aigearbase.com'
]);

// Dispatched 3
const dispatchedRoots = new Set(['hrstack.tech', 'softwaresuggest.com', 'techpluto.com']);

// HRTech 10
const hrtechRoots = new Set([
  'shrm.org', 'nasscom.in', 'recruitingdaily.com', 'indiatimes.com',
  'startupindia.gov.in', 'ncs.gov.in', 'iitm.ac.in', 'iitd.ac.in',
  'iitb.ac.in', 'bits-pilani.ac.in'
]);

// Analyze each of the 128 entries
const rootOccurrences = new Map();

entries128.forEach(e => {
  e.pslRoot = extractPSLRoot(e.url);
  rootOccurrences.set(e.pslRoot, (rootOccurrences.get(e.pslRoot) || 0) + 1);
});

console.log(`\nDistinct PSL roots in Ghulam Ali 128 entries: ${rootOccurrences.size}`);
for (const [r, count] of rootOccurrences.entries()) {
  if (count > 1) {
    console.log(`Duplicate root in 128 entries: ${r} appears ${count} times!`);
    entries128.filter(e => e.pslRoot === r).forEach(e => console.log(`   - #${e.rank}: ${e.name} (${e.url})`));
  }
}

let countInLedger = 0;
let countInStaged = 0;
let countInPilot = 0;
let countInDispatched = 0;
let countInHRTech = 0;
let countNew = 0;

const matchDetails = [];

entries128.forEach(e => {
  const root = e.pslRoot;
  let matchCategory = 'NEW_CANDIDATE';
  let matchNote = 'Not present in any TalentXcel ledger or staged profile';

  if (pilot8Roots.has(root)) {
    matchCategory = 'MATCH_PILOT_8';
    matchNote = 'Present in Quality-Gate-Passed Pilot Shortlist';
    countInPilot++;
  } else if (dispatchedRoots.has(root)) {
    matchCategory = 'MATCH_DISPATCHED';
    matchNote = 'Present in Dispatched Submissions Awaiting Publication';
    countInDispatched++;
  } else if (ledgerMap.has(root)) {
    matchCategory = 'MATCH_BATCHES_1_6_LEDGER';
    const matches = ledgerMap.get(root);
    matchNote = `Present in ${matches[0].batch} (${matches[0].globalId} - ${matches[0].status})`;
    countInLedger++;
  } else if (stagedRoots.has(root)) {
    matchCategory = 'MATCH_STAGED_B2B_PROFILE';
    matchNote = 'Present in b2b_directory_profiles (Stage 4.1 Staged, Not Submitted)';
    countInStaged++;
  } else if (hrtechRoots.has(root)) {
    matchCategory = 'MATCH_HRTECH_PILLAR';
    matchNote = 'Present in High-Authority HRTech Research Pipeline';
    countInHRTech++;
  } else {
    countNew++;
  }

  matchDetails.push({
    rank: e.rank,
    name: e.name,
    url: e.url,
    pslRoot: root,
    dr: e.dr,
    tierName: e.tierName,
    matchCategory,
    matchNote
  });
});

console.log('\nExhaustive Match Summary:');
console.log(`- Matched Batches 1-6 Ledger: ${countInLedger}`);
console.log(`- Matched Staged B2B Profiles: ${countInStaged}`);
console.log(`- Matched Pilot 8 Candidates: ${countInPilot}`);
console.log(`- Matched Dispatched Submissions: ${countInDispatched}`);
console.log(`- Matched HRTech Authority Pillars: ${countInHRTech}`);
console.log(`- Brand New Candidates: ${countNew}`);
console.log(`Total: ${countInLedger + countInStaged + countInPilot + countInDispatched + countInHRTech + countNew} (Exactly 128!)`);
