const fs = require('fs');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');
console.log('HTML byte length:', html.length);

// Extract title
const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
console.log('Title:', titleMatch ? titleMatch[1].trim() : 'N/A');

// Extract meta description
const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i);
console.log('Description:', descMatch ? descMatch[1].trim() : 'N/A');

// Extract H1, H2, H3
const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('H1:', h1s);

const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('H2s:', h2s);

const h3s = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('H3s (sample 10):', h3s.slice(0, 10));

// Check tables
const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)];
console.log('Number of tables:', tables.length);

// Extract all external links
const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
  .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
  .filter(l => l.href.startsWith('http') && !l.href.includes('ghulamaliseo.com'));

console.log('External links count:', links.length);
console.log('Sample external links (first 20):');
links.slice(0, 20).forEach(l => console.log(`  - [${l.text}] -> ${l.href}`));

// Check text snippet / summary
const textOnly = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                     .replace(/<style[\s\S]*?<\/style>/gi, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim();

console.log('\nText preview (first 1000 chars):');
console.log(textOnly.slice(0, 1000));
