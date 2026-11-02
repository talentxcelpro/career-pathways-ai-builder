const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (['node_modules', '.git', 'dist'].includes(f)) return;
    if (fs.statSync(full).isDirectory()) res = res.concat(walk(full));
    else if (/\.(ts|tsx)$/.test(f)) res.push(full);
  });
  return res;
}

const tables = new Set();
walk('src').forEach(f => {
  const txt = fs.readFileSync(f, 'utf8');
  const regex = /\.from\(['"]([a-zA-Z0-9_-]*sub[a-zA-Z0-9_-]*)['"]/gi;
  let m;
  while ((m = regex.exec(txt)) !== null) tables.add(m[1]);
});
console.log('Subscription tables in src:', Array.from(tables));
