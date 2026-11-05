const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');

const targetVars = [
  'tierData_tierGrid1_148566f',
  'tierData_tierGrid2_8aa22e2',
  'tierData_tierGrid3_b1cc76a',
  'tierData_tierGrid4_71eb508'
];

const ghulamSources = [];
const seenUrls = new Set();

targetVars.forEach(v => {
  const startStr = `var ${v} = [`;
  const startIdx = html.indexOf(startStr);
  if (startIdx !== -1) {
    const endIdx = html.indexOf('];', startIdx);
    if (endIdx !== -1) {
      const code = html.slice(startIdx + `var ${v} = `.length, endIdx + 1);
      const parsed = (new Function(`return ${code};`))();
      parsed.forEach(item => {
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          ghulamSources.push(item);
        }
      });
    }
  }
});

console.log(`Total unique directory sources in Ghulam Ali list: ${ghulamSources.length}`);

// Extract root domain for each
function extractRoot(urlStr) {
  try {
    const u = new URL(urlStr);
    const parts = u.hostname.toLowerCase().split('.');
    if (parts.length <= 2) return u.hostname.toLowerCase();
    // basic PSL-like check
    const sld = parts[parts.length - 2];
    const tld = parts[parts.length - 1];
    if (['co', 'com', 'org', 'net', 'gov', 'ac'].includes(sld) && tld.length === 2) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  } catch (e) {
    return urlStr;
  }
}

ghulamSources.forEach(s => {
  s.rootDomain = extractRoot(s.url);
});

// Load TalentXcel 385 commercial roots
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

const ledgerRoots = new Set();
for (let i = 1; i < ledgerLines.length; i++) {
  const row = parseCSVLine(ledgerLines[i]);
  if (row[9] !== 'DUPLICATE' && row[7] !== 'YES') {
    ledgerRoots.add(row[5]);
  }
}

console.log(`Loaded ${ledgerRoots.size} commercial roots from TXC ledger.`);

// Cross-reference
const inLedger = [];
const notInLedger = [];

ghulamSources.forEach(s => {
  if (ledgerRoots.has(s.rootDomain)) {
    inLedger.push(s);
  } else {
    notInLedger.push(s);
  }
});

console.log(`\nCross-Reference Results:`);
console.log(`- Already in TalentXcel Batches 1-6 Ledger: ${inLedger.length}`);
inLedger.forEach(s => console.log(`   [EXISTING] ${s.name} (${s.rootDomain}) - DR ${s.dr}`));

console.log(`- NOT in Batches 1-6 Ledger (New Potential Candidates): ${notInLedger.length}`);

// Categorize what is NOT in ledger:
// Social profiles, Web 2.0, Tech directories, General aggregators
console.log('\nSample NEW candidates from Ghulam Ali list:');
notInLedger.slice(0, 30).forEach(s => {
  console.log(`   #${s.rank}: ${s.name} (${s.rootDomain}) - DR ${s.dr} | ${s.url}`);
});
