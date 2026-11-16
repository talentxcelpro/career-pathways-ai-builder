const fs = require('fs');
const content = fs.readFileSync('api/seo-render.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('_college-slugs')) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});
