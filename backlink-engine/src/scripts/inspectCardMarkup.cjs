const fs = require('fs');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');

// Let's inspect the cards HTML
// Search for blcard or similar container
const cardSnippets = [];
const cardRegex = /<div[^>]*class=["'][^"']*blcard[^"']*["'][\s\S]*?<\/div>\s*<\/div>/gi;
let match;
while ((match = cardRegex.exec(html)) !== null) {
  cardSnippets.push(match[0]);
}

console.log('blcard matches count:', cardSnippets.length);

if (cardSnippets.length === 0) {
  // Let's search for how cards are marked up
  const customCards = [...html.matchAll(/<div[^>]*class=["'][^"']*(?:card|item|entry|source)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi)];
  console.log('General card matches:', customCards.length);
}

// Let's search for text around the 10 TOP PICKS
const topPicksIdx = html.indexOf('Priority Launch &amp; Listing Platforms');
if (topPicksIdx !== -1) {
  console.log('\nTop picks section preview:');
  console.log(html.slice(topPicksIdx, topPicksIdx + 3000));
}
