const fs = require('fs');

const files = fs.readdirSync('reports');
console.log('Files related to verification or rentry:');
files.filter(f => f.includes('VERIF') || f.includes('008') || f.includes('009')).forEach(f => {
  console.log('-', f);
});
