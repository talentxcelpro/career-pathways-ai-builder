// backlink-engine/src/scripts/inspectStartupBase.cjs
const https = require('https');

https.get('https://startupbase.io/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('StartupBase Status:', res.statusCode);
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
      .filter(l => l.text.toLowerCase().includes('submit') || 
                   l.text.toLowerCase().includes('add') || 
                   l.text.toLowerCase().includes('promote') ||
                   l.href.includes('submit') ||
                   l.href.includes('new'));
    console.log('StartupBase links:', links);
  });
});
