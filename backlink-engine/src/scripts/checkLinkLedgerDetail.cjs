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
console.log('Header:', header);

const sample = parseCSVLine(lines[1]);
console.log('Sample row 1:');
header.forEach((h, idx) => console.log(`  ${h}: ${sample[idx]}`));
