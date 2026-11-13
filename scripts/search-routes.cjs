const fs = require('fs');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const lines = app.split('\n');
lines.forEach((l, i) => {
  if (l.includes('JobMatchProduct') || l.includes('JobsPage') || l.includes('JobDiscovery')) {
    console.log(`${i}: ${l.trim()}`);
  }
});
