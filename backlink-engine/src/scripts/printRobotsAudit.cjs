const fs = require('fs');
const audit = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/pilot15_robots_audit.json', 'utf8'));
audit.forEach(a => {
  console.log(`[#${a.num}] ${a.domain}: disallowAll=${a.isDisallowedAll}`);
  console.log('   Snippet: ' + a.robotsSnippet);
});
