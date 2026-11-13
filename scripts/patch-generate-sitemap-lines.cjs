const fs = require('fs');

let lines = fs.readFileSync('scripts/generate-sitemap.ts', 'utf8').split('\r\n');

// Find line where map ends
for (let i = 215; i < 230; i++) {
  if (lines[i].includes('}));') && !lines[i+1].includes('}')) {
    lines.splice(i + 1, 0, '  }');
    break;
  }
}

fs.writeFileSync('scripts/generate-sitemap.ts', lines.join('\r\n'), 'utf8');
console.log('Fixed brace in scripts/generate-sitemap.ts');
