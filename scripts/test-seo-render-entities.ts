// scripts/test-seo-render-entities.ts
import handler from '../api/seo-render';

async function run() {
  const routes = [
    'talent-score',
    'network',
    'talent',
    'communities',
    'network/communities',
    'passport',
    'jobs',
    'resume/ats-check',
    'employer',
    'career-map'
  ];

  console.log('🚀 Running SSR Entity Verification on api/seo-render.ts:\n');
  let allPassed = true;

  for (const route of routes) {
    const req = new Request(`https://talentxcel.in/api/seo-render?path=${encodeURIComponent(route)}`, {
      headers: {
        'host': 'talentxcel.in',
        'user-agent': 'OAI-SearchBot/1.0',
        'x-seo-debug': 'internal'
      }
    });

    try {
      const res = await handler(req);
      const status = res.status;
      const robots = res.headers.get('x-robots-tag');
      const html = await res.text();
      const wordCount = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'No Title';

      const isOk = status === 200 && robots === 'index, follow' && wordCount >= 400;
      if (!isOk) allPassed = false;

      console.log(`[${isOk ? 'PASS ✅' : 'FAIL ❌'}] /${route}`);
      console.log(`       Status: HTTP ${status}`);
      console.log(`       Robots: ${robots}`);
      console.log(`       Word Count: ${wordCount}`);
      console.log(`       Title: ${title.slice(0, 60)}...\n`);
    } catch (err: any) {
      allPassed = false;
      console.error(`[FAIL ❌] /${route} -> Error: ${err.message}\n`);
    }
  }

  if (allPassed) {
    console.log('🎉 ALL CORE ENTITY DESTINATIONS PASSED VERIFICATION WITH HTTP 200, INDEX/FOLLOW, AND >400 WORDS!');
  } else {
    console.error('⚠️ ONE OR MORE ROUTES FAILED VERIFICATION.');
    process.exit(1);
  }
}

run();
