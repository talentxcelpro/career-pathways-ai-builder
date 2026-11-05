// backlink-engine/src/scripts/inspectGlobalHRWorld.cjs
const https = require('https');

https.get('https://globalhrworld.com/directory/', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0'
  }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
      .filter(l => l.text.toLowerCase().includes('submit') || 
                   l.text.toLowerCase().includes('add') || 
                   l.text.toLowerCase().includes('list') || 
                   l.text.toLowerCase().includes('contact') ||
                   l.href.includes('submit') ||
                   l.href.includes('add') ||
                   l.href.includes('directory'));
    console.log('Relevant links:', links.slice(0, 20));
  });
}).on('error', e => console.error(e));
