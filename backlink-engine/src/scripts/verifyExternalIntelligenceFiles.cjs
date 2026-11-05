const fs = require('fs');

const files = [
  'reports/TXC-EXTERNAL-128-SOURCE-EXTRACTION.csv',
  'reports/TXC-EXTERNAL-128-LEDGER-CROSSWALK.csv',
  'reports/TXC-EXTERNAL-128-OPPORTUNITY-CLASSIFICATION.csv',
  'reports/TXC-EXTERNAL-128-PRIORITY-SHORTLIST.csv',
  'reports/TXC-EXTERNAL-SOURCE-INTELLIGENCE-001.md'
];

files.forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').trim().split('\n').length;
  const bytes = fs.statSync(f).size;
  console.log(`${f}: ${lines} lines, ${bytes} bytes`);
});
