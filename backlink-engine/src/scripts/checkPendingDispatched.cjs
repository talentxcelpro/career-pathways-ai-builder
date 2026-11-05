const fs = require('fs');

const path = 'reports/TXC-PENDING-DISPATCHED-SUBMISSIONS.csv';
const lines = fs.readFileSync(path, 'utf8').trim().split('\n');
console.log('Current pending submissions count:', lines.length - 1);
lines.forEach(l => console.log(l));
