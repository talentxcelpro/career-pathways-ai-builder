const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_classified.json'), 'utf8'));

console.log('=== READY FOR HUMAN APPROVAL ===');
list.filter(x => x.status === 'READY_FOR_HUMAN_APPROVAL').forEach(x => {
  console.log(`[#${x.num}] ${x.name} (${x.domain})`);
  console.log(`    URL: ${x.submissionUrl}`);
  console.log(`    Reason: ${x.reason}\n`);
});

console.log('=== AUTH REQUIRED ===');
list.filter(x => x.status === 'AUTH_REQUIRED').forEach(x => {
  console.log(`[#${x.num}] ${x.name} (${x.domain})`);
  console.log(`    URL: ${x.submissionUrl}`);
  console.log(`    Reason: ${x.reason}\n`);
});

console.log('=== RECIPROCAL REQUIRED ===');
list.filter(x => x.status === 'RECIPROCAL_REQUIRED').forEach(x => {
  console.log(`[#${x.num}] ${x.name} (${x.domain})`);
  console.log(`    URL: ${x.submissionUrl}`);
  console.log(`    Reason: ${x.reason}\n`);
});

console.log('=== DUPLICATE ===');
list.filter(x => x.status === 'DUPLICATE').forEach(x => {
  console.log(`[#${x.num}] ${x.name} (${x.domain}) -> ${x.reason}`);
});
