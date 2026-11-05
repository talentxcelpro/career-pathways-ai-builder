const fs = require('fs');

const files = [
  'reports/TXC-PILOT-EVIDENCE-GATE-003.md',
  'reports/TXC-RENTRY-CANONICAL-IMPACT-RECONCILIATION.csv',
  'reports/TXC-PILOT-8-SCORING-AUDIT.csv',
  'reports/TXC-FIRST-5-PUBLISHER-VERIFICATION.csv',
  'reports/TXC-FIRST-5-FINAL-DECISION-REGISTER.csv'
];

files.forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').trim().split('\n').length;
  const bytes = fs.statSync(f).size;
  console.log(`${f}: ${lines} lines, ${bytes} bytes`);
});
