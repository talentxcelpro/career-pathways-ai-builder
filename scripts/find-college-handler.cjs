const fs = require('fs');
const lines = fs.readFileSync('api/seo-render.ts', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes("colleges") && (l.includes("case") || l.includes("if"))) {
    console.log(`Line ${i + 1}: ${l}`);
  }
});
