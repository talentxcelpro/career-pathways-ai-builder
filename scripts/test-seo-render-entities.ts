// scripts/test-seo-render-entities.ts
import handler from '../api/seo-render';

async function run() {
  const routes = [
    { path: 'talent-score', expectRedirect: false },
    { path: 'talentscore', expectRedirect: true, target: 'https://talentxcel.in/talent-score' },
    { path: 'network', expectRedirect: false },
    { path: 'talent', expectRedirect: false },
    { path: 'communities', expectRedirect: false },
    { path: 'passport', expectRedirect: false },
    { path: 'jobs', expectRedirect: false },
    { path: 'resume/ats-check', expectRedirect: false },
    { path: 'ats-check', expectRedirect: true, target: 'https://talentxcel.in/resume/ats-check' },
    { path: 'employers', expectRedirect: true, target: 'https://employers.talentxcel.in/' },
    { path: 'employer', expectRedirect: true, target: 'https://employers.talentxcel.in/' },
    { path: 'career-map', expectRedirect: false }
  ];

  console.log('🚀 Running Comprehensive SSR Entity Verification on api/seo-render.ts:\n');
  let allPassed = true;

  for (const item of routes) {
    const req = new Request(`https://talentxcel.in/api/seo-render?path=${encodeURIComponent(item.path)}`, {
      headers: {
        'host': 'talentxcel.in',
        'user-agent': 'OAI-SearchBot/1.0',
        'x-seo-debug': 'internal'
      }
    });

    try {
      const res = await handler(req);
      const status = res.status;

      if (item.expectRedirect) {
        const location = res.headers.get('location');
        const isOk = (status === 308 || status === 301) && location === item.target;
        if (!isOk) allPassed = false;

        console.log(`[${isOk ? 'PASS ✅' : 'FAIL ❌'}] /${item.path}`);
        console.log(`       Status: HTTP ${status} (Redirect)`);
        console.log(`       Location: ${location}`);
        console.log(`       Expected: ${item.target}\n`);
      } else {
        const robots = res.headers.get('x-robots-tag');
        const html = await res.text();
        const wordCount = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
        const titleMatch = html.match(/<title>([^<]+)<\/title>/);
        const title = titleMatch ? titleMatch[1] : 'No Title';
        const hasSchema = html.includes('application/ld+json');

        const isOk = status === 200 && robots === 'index, follow' && wordCount >= 400 && hasSchema;
        if (!isOk) allPassed = false;

        console.log(`[${isOk ? 'PASS ✅' : 'FAIL ❌'}] /${item.path}`);
        console.log(`       Status: HTTP ${status}`);
        console.log(`       Robots: ${robots}`);
        console.log(`       Word Count: ${wordCount}`);
        console.log(`       Schema: ${hasSchema ? 'Detected' : 'Missing'}`);
        console.log(`       Title: ${title.slice(0, 60)}...\n`);
      }
    } catch (err: any) {
      allPassed = false;
      console.error(`[FAIL ❌] /${item.path} -> Error: ${err.message}\n`);
    }
  }

  if (allPassed) {
    console.log('🎉 ALL CORE ENTITY DESTINATIONS PASSED VERIFICATION WITH 100% SUCCESS!');
  } else {
    console.error('⚠️ ONE OR MORE ROUTES FAILED VERIFICATION.');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
