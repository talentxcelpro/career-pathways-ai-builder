const fs = require('fs');
const d = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/batch6_dedup_initial.json', 'utf8'));
d.filter(x => x.isDuplicate).forEach(x => {
  console.log(`[#${x.num}] ${x.name} (${x.canonicalRoot}) -> ${x.duplicateSource}`);
});
