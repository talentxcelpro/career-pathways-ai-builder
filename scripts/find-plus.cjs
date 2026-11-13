const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!full.includes('node_modules')) results = results.concat(walk(full));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('src');
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    // Look for identifier plus that is not inside quotes
    if (/\bplus\b/.test(l) && !l.includes('//') && !l.includes('/*')) {
      // test if it looks like variable or component
      if (/([=:(<,]|\s)plus([=,);.>]|\s)/.test(l)) {
        // filter out string literals
        const stripped = l.replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '').replace(/`[^`]*`/g, '');
        if (/\bplus\b/.test(stripped)) {
          console.log(`${file}:${i+1}: ${l.trim()}`);
        }
      }
    }
  });
}
