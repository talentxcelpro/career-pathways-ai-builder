const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../scripts/generate-sitemap.ts');
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find the second occurrence of '// Add 5 Verified International Landing Page Hubs'
let foundCount = 0;
let removeStart = -1;
let removeEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Add 5 Verified International Landing Page Hubs')) {
    foundCount++;
    if (foundCount === 2) {
      removeStart = i;
      break;
    }
  }
}

if (removeStart !== -1) {
  // block is 16 lines long
  lines.splice(removeStart, 16);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log(`✓ Removed duplicate block starting at line ${removeStart}`);
} else {
  console.log('No second duplicate found');
}
