const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('--- Testing SEO Edge Hydration & Canonical Consolidation ---');

  const tsx = require('tsx/cjs/api');
  const seoModule = tsx.require(path.resolve('api/seo-render.ts'), __filename);

  // 1. Test Canary Canonical apex consolidation
  const salaryCanonical = seoModule.resolveCanaryCanonical('salary/software-engineer/bangalore', 'SALARY');
  console.log('1. Salary Canonical Resolution:');
  console.log('   Expected: https://talentxcel.in/salary/software-engineer/bangalore');
  console.log('   Actual:  ', salaryCanonical);
  if (salaryCanonical === 'https://talentxcel.in/salary/software-engineer/bangalore') {
    console.log('   ✓ PASS: Canary canonical consolidated to apex domain!');
  } else {
    console.error('   ✗ FAIL: Canary canonical mismatch!');
  }

  // 2. Test isCandidateProfileRoute
  const testRoutes = ['u/alex', 'verify/alex', 'profile/alex', 'p/alex', 'candidates/123'];
  console.log('\n2. Candidate Profile Routes Matcher:');
  testRoutes.forEach(r => {
    const isMatch = seoModule.isCandidateProfileRoute(r);
    console.log(`   ${r} => ${isMatch ? '✓ Matched' : '✗ Failed'}`);
  });

  // 3. Test Full Handler on a Salary URL
  console.log('\n3. Simulated Googlebot Request to /salary/software-engineer-in-bangalore:');
  const req = new Request('https://talentxcel.in/api/seo-render?path=/salary/software-engineer-in-bangalore', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
  });
  const res = await seoModule.default(req);
  console.log('   Status Code:', res.status);
  console.log('   X-Robots-Tag:', res.headers.get('x-robots-tag'));
  const html = await res.text();
  console.log('   Has Canonical Link:', html.includes('<link rel="canonical" href="https://talentxcel.in/salary/software-engineer-in-bangalore">'));
  console.log('   Has Local Data Block:', html.includes('Local Compensation Variance') && html.includes('+18.4%'));
  console.log('   Has FAQ Schema:', html.includes('"@type":"FAQPage"') || html.includes('"@type": "FAQPage"'));

  console.log('\n✓ All SEO edge checks executed successfully!');
}

runTests().catch(console.error);
