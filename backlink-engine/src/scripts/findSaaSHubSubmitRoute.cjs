const https = require('https');

https.get('https://www.saashub.com/submit', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    // Find all links on SaaSHub submit page
    const links = [...d.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }));
    
    console.log('SaaSHub links related to add / submit / product:');
    links.filter(l => l.href.includes('add') || l.href.includes('product') || l.href.includes('submit') || l.href.includes('list') || l.text.toLowerCase().includes('submit') || l.text.toLowerCase().includes('add')).forEach(l => {
      console.log(`- [${l.text}] -> ${l.href}`);
    });
  });
});
