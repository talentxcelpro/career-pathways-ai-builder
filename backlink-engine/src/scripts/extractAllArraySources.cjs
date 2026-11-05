const fs = require('fs');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');

// Find all var ... = [ ... ];
const dataRegex = /var\s+([a-zA-Z0-9_]+)\s*=\s*(\[\s*\{[\s\S]*?\}\s*\]);/gi;

let match;
let totalExtracted = 0;
const allSources = [];

while ((match = dataRegex.exec(html)) !== null) {
  const varName = match[1];
  const jsonText = match[2];
  console.log(`Found data array: ${varName}, text length: ${jsonText.length}`);

  try {
    // evaluate or parse JSON
    // The keys might be unquoted (JavaScript object syntax), so we can use Function or regex
    const fn = new Function(`return ${jsonText};`);
    const data = fn();
    console.log(`  Parsed ${data.length} items from ${varName}`);
    data.forEach(item => {
      allSources.push({
        sourceArray: varName,
        ...item
      });
    });
  } catch (e) {
    console.log(`  Error parsing ${varName}:`, e.message);
  }
}

console.log(`\nTotal sources extracted across all arrays: ${allSources.length}`);

// Let's inspect the unique sources
const uniqueByUrl = new Map();
allSources.forEach(s => {
  if (s.url && !uniqueByUrl.has(s.url)) {
    uniqueByUrl.set(s.url, s);
  }
});

console.log(`Unique sources by URL: ${uniqueByUrl.size}`);

// Print sample sources
console.log('\nSample sources (first 25):');
Array.from(uniqueByUrl.values()).slice(0, 25).forEach(s => {
  console.log(`Rank ${s.rank || 'N/A'}: ${s.name} (DR ${s.dr}) -> ${s.url} | ${s.meta || ''}`);
});
