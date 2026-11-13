const fs = require('fs');
const raw = fs.readFileSync('GSC_URL_CORPUS_AUDIT.json', 'utf8');
const data = JSON.parse(raw);
console.log('Total URLs parsed in historical corpus:', data.totalUrlsParsed);
console.log('Analyzed at:', data.analyzedAt);
console.log('\nAll Patterns:');
data.patterns.forEach(p => {
  console.log(`- ${p.template.padEnd(45)} | Category: ${p.category.padEnd(28)} | Count: ${p.count}`);
});
