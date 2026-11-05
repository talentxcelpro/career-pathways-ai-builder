const fs = require('fs');

const files = [
  'reports/TXC-ACQUISITION-BASELINE-VERIFICATION.md',
  'reports/TXC-RENTRY-240-DESTINATION-AUDIT.csv',
  'reports/TXC-PILOT-8-EVIDENCE-REGISTER.csv',
  'reports/TXC-FIRST-5-SUBMISSION-PREVIEWS.md',
  'reports/TXC-25-QUALIFIED-PUBLISHER-MILESTONE.csv'
];

files.forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').trim().split('\n').length;
  const bytes = fs.statSync(f).size;
  console.log(`${f}: ${lines} lines, ${bytes} bytes`);
});
