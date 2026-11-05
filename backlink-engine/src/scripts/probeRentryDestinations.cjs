const fs = require('fs');
const https = require('https');

// Read the unique target URLs in reports/TXC_BACKLINK_009_LINK_LEDGER.csv
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
const targetMap = new Map();

for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  const target = row[3];
  targetMap.set(target, (targetMap.get(target) || 0) + 1);
}

console.log('Unique destination URLs in 240 Rentry links:');
for (const [url, count] of targetMap.entries()) {
  console.log(`- ${url}: appears ${count} times`);
}

// Function to probe URL with redirect tracking
function probeUrl(urlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = https.request(
        {
          hostname: u.hostname,
          path: u.pathname + u.search,
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          timeout: 8000
        },
        (res) => {
          resolve({
            url: urlStr,
            statusCode: res.statusCode,
            location: res.headers.location || null,
            canonical: res.headers.link || null,
            xRobotsTag: res.headers['x-robots-tag'] || null
          });
        }
      );
      req.on('error', (err) => resolve({ url: urlStr, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ url: urlStr, error: 'TIMEOUT' }); });
      req.end();
    } catch (e) {
      resolve({ url: urlStr, error: e.message });
    }
  });
}

async function runProbes() {
  console.log('\nProbing destination URLs:');
  for (const url of targetMap.keys()) {
    const res = await probeUrl(url);
    console.log(res);
  }
}

runProbes();
