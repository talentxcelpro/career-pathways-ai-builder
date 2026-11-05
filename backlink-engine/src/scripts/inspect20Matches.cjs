const fs = require('fs');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');

const tierVars = [
  'tierData_tierGrid1_148566f',
  'tierData_tierGrid2_8aa22e2',
  'tierData_tierGrid3_b1cc76a',
  'tierData_tierGrid4_71eb508'
];

const entries128 = [];
tierVars.forEach(v => {
  const startStr = `var ${v} = [`;
  const startIdx = html.indexOf(startStr);
  if (startIdx !== -1) {
    const endIdx = html.indexOf('];', startIdx);
    const code = html.slice(startIdx + `var ${v} = `.length, endIdx + 1);
    const parsed = (new Function(`return ${code};`))();
    entries128.push(...parsed);
  }
});

function extractPSLRoot(urlStr) {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();
    const parts = host.split('.');
    if (parts.length <= 2) return host;
    const last2 = parts.slice(-2).join('.');
    const multiPartTLDs = [
      'co.uk', 'gov.uk', 'ac.uk', 'org.uk',
      'co.in', 'gov.in', 'ac.in', 'net.in', 'org.in',
      'com.au', 'net.au', 'org.au'
    ];
    if (multiPartTLDs.includes(last2)) return parts.slice(-3).join('.');
    return parts.slice(-2).join('.');
  } catch (e) {
    return urlStr;
  }
}

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
  if (!ledgerMap.has(root)) ledgerMap.set(root, []);
  ledgerMap.get(root).push({
    globalId: row[0],
    batch: row[1],
    candNum: row[2],
    name: row[3],
    status: row[9]
  });
}

console.log('The 20 Matched Entries:');
entries128.forEach(e => {
  const root = extractPSLRoot(e.url);
  if (ledgerMap.has(root)) {
    const match = ledgerMap.get(root)[0];
    console.log(`Rank #${e.rank}: ${e.name} (${e.url}) -> Root: ${root} matches ${match.batch} (${match.globalId} - ${match.name} | Status: ${match.status})`);
  }
});
