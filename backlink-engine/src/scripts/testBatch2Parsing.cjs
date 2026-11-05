// backlink-engine/src/scripts/testBatch2Parsing.cjs
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

const lines = fs.readFileSync('reports/TXC_DIVERSIFY_BATCH_002_PROSPECTS.csv', 'utf8').trim().split('\n');
const b2Parsed = lines.slice(1).map(l => {
  const cols = parseCSVLine(l);
  return {
    id: cols[0],
    name: cols[1],
    domain: cols[2],
    url: cols[3],
    category: cols[4],
    status: cols[13]
  };
});

console.log('Batch 2 parsed count:', b2Parsed.length);
console.log('Sample rows:', b2Parsed.slice(0, 3));
