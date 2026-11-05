const fs = require('fs');
const d = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/batch6_dedup_initial.json', 'utf8'));

const roots = new Map();
d.forEach(c => {
  if (!roots.has(c.canonicalRoot)) {
    roots.set(c.canonicalRoot, []);
  }
  roots.get(c.canonicalRoot).push(c.num);
});

console.log('Unique canonical roots in Batch 6:', roots.size);
for (const [root, nums] of roots.entries()) {
  if (nums.length > 1) {
    console.log(`Root ${root} appears in candidates: ${nums.join(', ')}`);
  }
}
