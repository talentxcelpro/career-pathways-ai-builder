const fs = require('fs');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');

// Search for domain names, cards, or JSON data in the HTML
// Let's look for script tags with JSON data
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
console.log('Script count:', scripts.length);

scripts.forEach((s, idx) => {
  if (s.includes('sources') || s.includes('Domain Rating') || s.includes('DR') || s.includes('url') || s.includes('http')) {
    console.log(`Script ${idx} length: ${s.length}, sample: ${s.slice(0, 300)}`);
  }
});

// Search for card classes or elements
const cardMatches = [...html.matchAll(/class=["'][^"']*(?:card|source|directory|item|platform)[^"']*["']/gi)];
console.log('Card class matches count:', cardMatches.length);

// Let's find snippets containing "DR " or numbers
const snippets = [...html.matchAll(/DR\s*\d+/gi)].map(m => m[0]);
console.log('DR mentions count:', snippets.length);

// Let's search for lines containing domain extensions (.com, .org, .io, .net, etc.)
const domainRegex = /\b[a-zA-Z0-9-]+\.(?:com|org|io|net|co|ai|app|dev|in|me|tech)\b/gi;
const matchedDomains = new Set();
let match;
while ((match = domainRegex.exec(html)) !== null) {
  const d = match[0].toLowerCase();
  if (!d.includes('ghulamaliseo') && !d.includes('googleapis') && !d.includes('cloudflare') && !d.includes('elementor') && !d.includes('w3') && !d.includes('wordpress')) {
    matchedDomains.add(d);
  }
}

console.log('Distinct domain matches count:', matchedDomains.size);
console.log('Sample matched domains:', Array.from(matchedDomains).slice(0, 40));
