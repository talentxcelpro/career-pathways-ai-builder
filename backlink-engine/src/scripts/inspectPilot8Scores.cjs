const fs = require('fs');

// Inspect the 8 candidates in reports/TXC-PILOT-8-EVIDENCE-REGISTER.csv
const lines = fs.readFileSync('reports/TXC-PILOT-8-EVIDENCE-REGISTER.csv', 'utf8').trim().split('\n');

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
for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  console.log(`Rank ${row[0]}: ${row[3]} (${row[4]}) - Score: ${row[15]}`);
}
