const fs = require('fs');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');

const idx = html.indexOf('picksData');
console.log('Index of picksData:', idx);
if (idx !== -1) {
  console.log(html.slice(idx - 50, idx + 1500));
}

// Search for other data variables
const varMatches = [...html.matchAll(/var\s+([a-zA-Z0-9_]+Data[a-zA-Z0-9_]*)\s*=/gi)].map(m => m[1]);
console.log('Data variables found:', varMatches);
