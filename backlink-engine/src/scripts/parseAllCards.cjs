const fs = require('fs');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');

// Let's find all cards
// In the CSS snippet:
// .blcard__rank { ... } .blcard__dr { ... }
// Let's search for instances of blcard in the HTML
const cards = [];

// Regular expression to match cards
const cardRegex = /<div class="blcard[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<(?:div class="blcard|\/div))/gi;

// Let's search more simply: let's find all occurrences of blcard__rank and blcard__dr and card content
const rankRegex = /<span class="blcard__rank">#?(\d+)<\/span>/gi;
const ranks = [...html.matchAll(rankRegex)].map(m => m[1]);
console.log('Ranks found count:', ranks.length);

// Let's extract each card block:
// Look for blcard__title, blcard__dr, blcard__badge, blcard__url or onclick or copy button
const titleRegex = /<h4 class="blcard__title">([\s\S]*?)<\/h4>/gi;
const titles = [...html.matchAll(titleRegex)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('Titles found count:', titles.length);

// Let's inspect the first card HTML block
const firstCardIdx = html.indexOf('class="blcard"');
if (firstCardIdx !== -1) {
  console.log('First card HTML sample:');
  console.log(html.slice(firstCardIdx, firstCardIdx + 800));
}
