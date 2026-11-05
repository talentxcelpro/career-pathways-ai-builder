// backlink-engine/src/scripts/checkLiveAtsScanner.cjs
const https = require('https');
const fs = require('fs');

console.log('=== 1. LOCAL public/index-resume.html INSPECTION ===');
if (fs.existsSync('public/index-resume.html')) {
  const content = fs.readFileSync('public/index-resume.html', 'utf8');
  console.log('Title/H1 matches:');
  const h1 = content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  console.log('H1:', h1 ? h1[1].trim() : 'NONE');
  const desc = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  console.log('Meta description:', desc ? desc[1] : 'NONE');
}

console.log('\n=== 2. LIVE HTTPS PROBE OF https://talentxcel.in/resume/ats-check ===');
const req = https.get('https://talentxcel.in/resume/ats-check', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  timeout: 10000
}, res => {
  console.log('Live Status Code:', res.statusCode);
  console.log('Headers:', res.headers['location'] || res.headers['content-type']);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Live Page Length:', body.length);
    const titleMatch = body.match(/<title>([^<]*)<\/title>/i);
    console.log('Live Title:', titleMatch ? titleMatch[1].trim() : 'NONE');
    const h1Match = body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    console.log('Live H1:', h1Match ? h1Match[1].trim() : 'NONE');
    const metaDesc = body.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    console.log('Live Meta Desc:', metaDesc ? metaDesc[1] : 'NONE');
    
    // Look for key phrases
    ['free', 'ats', 'score', 'resume', 'upload', 'instant', 'unlimited', 'algorithm'].forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = body.match(regex);
      console.log(`Word "${word}" frequency:`, matches ? matches.length : 0);
    });

    fs.writeFileSync('backlink-engine/src/scripts/live_ats_check_body.html', body);
    console.log('Saved live HTML to live_ats_check_body.html');
  });
});

req.on('error', err => {
  console.log('Live HTTPS probe error:', err.message);
});
