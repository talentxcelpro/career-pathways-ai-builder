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

const lines = fs.readFileSync('reports/TXC-BATCH-001-006-CUMULATIVE-LEDGER.csv', 'utf8').trim().split('\n');
const roots = new Set();
const rootToRows = new Map();

lines.slice(1).forEach((l, idx) => {
  const parts = parseCSVLine(l);
  const root = parts[5].toLowerCase();
  roots.add(root);
  if (!rootToRows.has(root)) rootToRows.set(root, []);
  rootToRows.get(root).push({ lineIdx: idx + 2, globalId: parts[0], batch: parts[1], num: parts[2], name: parts[3], input: parts[4], root: parts[5], status: parts[9] });
});

console.log('Unique roots in the generated CSV:', roots.size);
console.log('Contains unverified?', roots.has('unverified'));
if (roots.has('unverified')) {
  console.log('Unverified rows count:', rootToRows.get('unverified').length);
}

// Let's print all roots that have > 1 row
for (const [r, rows] of rootToRows.entries()) {
  if (rows.length > 1) {
    console.log(`Root: "${r}" has ${rows.length} rows`);
  }
}
