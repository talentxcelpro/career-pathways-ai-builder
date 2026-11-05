const fs = require('fs');

const deliverables = [
  'reports/TXC-FINAL-ACQUISITION-DASHBOARD.md',
  'reports/TXC-385-ROOT-POPULATION-CROSSWALK.csv',
  'reports/TXC-LIVE-REFERRING-DOMAIN-CLASSIFICATION.csv',
  'reports/TXC-25-QUALIFIED-DOMAIN-MILESTONE.csv',
  'reports/TXC-PILOT-8-HUMAN-APPROVAL-STATUS.csv',
  'reports/TXC-BACKLINK-REL-ATTRIBUTE-VERIFICATION.csv'
];

deliverables.forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').trim().split('\n').length;
  const bytes = fs.statSync(f).size;
  console.log(`${f}: ${lines} lines, ${bytes} bytes`);
});
