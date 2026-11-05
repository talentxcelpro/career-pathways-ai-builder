const fs = require('fs');

const lines = fs.readFileSync('reports/TXC_BACKLINK_009_LINK_LEDGER.csv', 'utf8').trim().split('\n');

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

const header = parseCSVLine(lines[0]);
console.log('Sample verified live accessible pages:');
const seenPages = new Set();
let count = 0;

for (let i = 1; i < lines.length && count < 10; i++) {
  const row = parseCSVLine(lines[i]);
  const pageUrl = row[1];
  const target = row[3];
  const anchor = row[4];
  if (!seenPages.has(pageUrl)) {
    seenPages.add(pageUrl);
    count++;
    console.log(`${count}. Page: ${pageUrl} -> Target: ${target} ("${anchor}")`);
  }
}
