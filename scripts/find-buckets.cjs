const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (['node_modules', '.git', 'dist'].includes(file)) return;
    if (fs.statSync(full).isDirectory()) results = results.concat(walk(full));
    else if (/\.(ts|tsx|js|jsx|sql)$/.test(file)) results.push(full);
  });
  return results;
}

const files = walk('src').concat(walk('supabase'));
const buckets = new Set();
const bucketOccurrences = {};

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /storage\.from\(['"]([a-zA-Z0-9_-]+)['"]\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const b = match[1];
    buckets.add(b);
    if (!bucketOccurrences[b]) bucketOccurrences[b] = [];
    bucketOccurrences[b].push(f);
  }
});

console.log('Buckets found in code:', Array.from(buckets));
for (const b of Object.keys(bucketOccurrences)) {
  console.log(`\nBucket "${b}": (${bucketOccurrences[b].length} files)`);
  bucketOccurrences[b].slice(0, 5).forEach(f => console.log('  -', f));
}
