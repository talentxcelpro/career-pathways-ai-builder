const fs = require('fs');

// Check the Rentry destination audit
const rentryAuditLines = fs.readFileSync('reports/TXC-RENTRY-240-DESTINATION-AUDIT.csv', 'utf8').trim().split('\n');

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

const header = parseCSVLine(rentryAuditLines[0]);
console.log('Rentry audit header:', header);

const destStats = new Map();

for (let i = 1; i < rentryAuditLines.length; i++) {
  const row = parseCSVLine(rentryAuditLines[i]);
  const destUrl = row[4];
  const httpStatus = row[5];
  const redirect = row[6];
  const finalUrl = row[7];
  const canonical = row[8];
  const intended = row[9];
  const robots = row[11];
  const rel = row[13];

  if (!destStats.has(destUrl)) {
    destStats.set(destUrl, {
      count: 0,
      httpStatus,
      redirect,
      finalUrl,
      canonical,
      intended,
      robots,
      rel
    });
  }
  destStats.get(destUrl).count++;
}

console.log('Grouped destinations:');
for (const [url, data] of destStats.entries()) {
  console.log(`URL: ${url}`);
  console.log(`  Count: ${data.count}`);
  console.log(`  Canonical: ${data.canonical}`);
  console.log(`  Canonicalizes to other? ${data.canonical !== url && data.canonical !== (url + '/')}`);
}
