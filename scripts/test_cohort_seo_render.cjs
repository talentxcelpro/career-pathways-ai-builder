const https = require('https');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const sampleCohortUrls = [
  'https://talentxcel.in/jobs/software-engineer-in-bangalore',
  'https://talentxcel.in/jobs/senior-product-manager-in-mumbai',
  'https://talentxcel.in/career-insights/salary/data-scientist-salary-in-pune',
  'https://talentxcel.in/resume/interview-prep/react-developer-interview-questions-and-answers',
  'https://talentxcel.in/courses/python-courses-in-hyderabad',
  'https://talentxcel.in/careers/cloud-architect',
  'https://talentxcel.in/colleges/delhi-institute-of-technology',
  'https://talentxcel.in/passport/proof/txc-verify-ai-engineer-1000',
  'https://talentxcel.in/posts/software-engineer-market-trends-and-insights',
  'https://talentxcel.in/profile/software-engineer-specialist-1000',
  'https://talentxcel.in/network/communities/devops-engineer-leaders-in-chennai'
];

async function testAll() {
  console.log('Testing representative programmatic URLs for Googlebot rendering & canonical accuracy:\n');
  for (const url of sampleCohortUrls) {
    const parsed = new URL(url);
    await new Promise(resolve => {
      const req = https.get({
        hostname: parsed.hostname,
        path: parsed.pathname,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
        timeout: 10000
      }, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          if (res.statusCode >= 300 && res.statusCode < 400) {
            console.log(`[${res.statusCode}] Redirect -> ${res.headers.location} | ${parsed.pathname}`);
            resolve();
            return;
          }
          const canonMatch = body.match(/<link rel=["']canonical["'] href=["']([^"']+)["']/);
          const canon = canonMatch ? canonMatch[1] : 'NONE';
          const match = canon === url;
          const hasH1 = body.includes('<h1');
          const hasSchema = body.includes('application/ld+json');
          console.log(`[${res.statusCode}] Canon: ${match ? 'MATCH ✅' : 'MISMATCH ❌ ' + canon} | H1: ${hasH1 ? 'YES' : 'NO'} | Schema: ${hasSchema ? 'YES' : 'NO'} | ${parsed.pathname}`);
          resolve();
        });
      });
      req.on('timeout', () => {
        req.destroy();
        console.log(`[TIMEOUT] ${parsed.pathname}`);
        resolve();
      });
      req.on('error', err => {
        console.log(`[ERR] ${url}: ${err.message}`);
        resolve();
      });
    });
  }
}
testAll();
