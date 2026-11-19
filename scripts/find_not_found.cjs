const fs = require('fs');
const content = fs.readFileSync('api/seo-render.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('function notFoundResponse')) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});
