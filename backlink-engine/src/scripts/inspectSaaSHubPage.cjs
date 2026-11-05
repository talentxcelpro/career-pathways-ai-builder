const https = require('https');

https.get('https://www.saashub.com/talentxcel', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Length:', body.length);
    const title = (body.match(/<title>([^<]+)<\/title>/i) || [])[1];
    console.log('Title:', title);
    const hasTalentxcelIn = body.includes('talentxcel.in');
    console.log('Contains talentxcel.in:', hasTalentxcelIn);

    // Look for all anchors mentioning talentxcel or website
    const anchors = body.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
    const relevant = anchors.filter(a => a.toLowerCase().includes('talentxcel.in') || a.toLowerCase().includes('visit') || a.toLowerCase().includes('website'));
    console.log('Relevant anchors count:', relevant.length);
    console.log('Sample anchors:', relevant.slice(0, 10));

    // Check robots meta tag or canonical
    const robots = (body.match(/<meta[^>]+name=["']robots["'][^>]*>/i) || [])[0];
    const canonical = (body.match(/<link[^>]+rel=["']canonical["'][^>]*>/i) || [])[0];
    console.log('Robots Meta:', robots || 'none');
    console.log('Canonical:', canonical || 'none');
  });
});
