const fs = require('fs');
const content = fs.readFileSync('src/data/careerPathwaysCatalog.ts', 'utf8');
const lines = content.split('\n');
const slice = lines.slice(44, 7491).join('\n');
const matches = slice.match(/id:\s*['"][a-zA-Z0-9_\-]+['"]/g);
console.log('Catalog array items count:', matches ? matches.length : 0);

// Also test importing the file in Node using ts-node or transpiling
