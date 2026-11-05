const fs = require('fs');

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

const header = parseCSVLine(ledgerLines[0]);
for (let i = 1; i < ledgerLines.length; i++) {
  const row = parseCSVLine(ledgerLines[i]);
  if (row[1] === 'Batch 1') {
    console.log(row[0], row[1], row[2], row[3], row[4], row[5], row[9], row[12]);
  }
}
