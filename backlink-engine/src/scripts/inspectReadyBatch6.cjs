const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_classified_final.json'), 'utf8'));

const ready = list.filter(x => x.status === 'READY_FOR_HUMAN_APPROVAL');
console.log('Total READY:', ready.length);
ready.slice(0, 20).forEach(r => {
  console.log(`[#${r.num}] ${r.name} (${r.domain}) | Score: ${r.score} | URL: ${r.submissionUrl}`);
});
