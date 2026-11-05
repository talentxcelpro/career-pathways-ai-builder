// backlink-engine/src/scripts/checkPriorBatches.cjs
const fs = require('fs');
const path = require('path');

function checkFile(relPath) {
  if (fs.existsSync(relPath)) {
    const lines = fs.readFileSync(relPath, 'utf8').trim().split('\n');
    console.log(`${relPath}: ${lines.length} lines`);
  } else {
    console.log(`${relPath}: NOT FOUND`);
  }
}

checkFile('reports/TXC_DIVERSIFY_BATCH_002_PROSPECTS.csv');
checkFile('reports/TXC-BATCH-004-EVIDENCE.csv');
checkFile('reports/TXC-BATCH-005-EVIDENCE.csv');
checkFile('reports/TXC-BATCH-006-EVIDENCE.csv');
checkFile('backlink-engine/src/scripts/batch4_classified_refined.json');
checkFile('backlink-engine/src/scripts/batch5_classified.json');
