const fs = require('fs');

console.log('--- TXC-BACKLINK-BASELINE-VERIFIED.csv ---');
if (fs.existsSync('reports/TXC-BACKLINK-BASELINE-VERIFIED.csv')) {
  const lines = fs.readFileSync('reports/TXC-BACKLINK-BASELINE-VERIFIED.csv', 'utf8').trim().split('\n');
  console.log('Lines:', lines.length);
  console.log('Header:', lines[0]);
  for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
    console.log(lines[i]);
  }
}

console.log('\n--- TXC_BACKLINK_008_VERIFICATION_EVIDENCE.csv ---');
if (fs.existsSync('reports/TXC_BACKLINK_008_VERIFICATION_EVIDENCE.csv')) {
  const lines = fs.readFileSync('reports/TXC_BACKLINK_008_VERIFICATION_EVIDENCE.csv', 'utf8').trim().split('\n');
  console.log('Lines:', lines.length);
  console.log('Header:', lines[0]);
  for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
    console.log(lines[i]);
  }
}
