import handler from '../api/seo-render';

async function testRoute(path: string, env: Record<string, string>) {
  Object.assign(process.env, env);
  const req = new Request(`https://talentxcel.in/${path}`, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });
  const res = await handler(req);
  const status = res.status;
  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
  const body = await res.text();
  return { path, status, headers, bodyLength: body.length };
}

async function run() {
  console.log('=== TESTING PREVIEW SEO FLAG BEHAVIOR ===');
  console.log('Flags: SEO_DEPLOY_SOFT_404=true, SEO_DEPLOY_SALARY_CANARY=false, SEO_DEPLOY_CTR_OPTIMIZATION=false\n');

  const env = {
    SEO_DEPLOY_SOFT_404: 'true',
    SEO_DEPLOY_SALARY_CANARY: 'false',
    SEO_DEPLOY_CTR_OPTIMIZATION: 'false',
  };

  const routes = [
    // 1. Valid Colleges
    { path: 'colleges/indian-institute-of-technology-bombay', expected: 200, type: 'VALID_COLLEGE' },
    { path: 'colleges/iit-delhi', expected: 200, type: 'VALID_COLLEGE' },
    // 2. Invalid Colleges
    { path: 'colleges/fake-nonexistent-college-xyz-123', expected: 404, type: 'INVALID_COLLEGE' },
    { path: 'colleges/random-slug-not-in-catalog', expected: 404, type: 'INVALID_COLLEGE' },
    // 3. Valid Jobs Root / Search
    { path: 'jobs', expected: 200, type: 'VALID_JOB_ROOT' },
    // 4. Invalid Job Slugs
    { path: 'jobs/nonexistent-job-uuid-00000000-0000-0000-0000-000000000000', expected: 404, type: 'INVALID_JOB' },
    // 5. Valid Salary Canonical (consolidated to apex)
    { path: 'salary', expected: 200, type: 'VALID_SALARY_APEX' },
    { path: 'salary/software-engineer', expected: 200, type: 'VALID_SALARY_ROLE' },
  ];

  let passed = 0;
  let total = routes.length;

  for (const r of routes) {
    const res = await testRoute(r.path, env);
    const isStatusMatch = res.status === r.expected;
    const robots = res.headers['x-robots-tag'] || '';
    const cache = res.headers['cache-control'] || '';

    let ok = isStatusMatch;
    if (r.expected === 404) {
      if (!robots.includes('noindex') || !robots.includes('nofollow')) ok = false;
      if (!cache.includes('no-store')) ok = false;
    }

    if (ok) {
      console.log(`✓ PASS: /${r.path} -> HTTP ${res.status} | Robots: "${robots}" | Cache: "${cache}"`);
      passed++;
    } else {
      console.error(`✗ FAIL: /${r.path} -> Expected HTTP ${r.expected}, got ${res.status} | Robots: "${robots}" | Cache: "${cache}"`);
    }
  }

  console.log(`\nSummary: ${passed}/${total} SEO flag route tests PASSED.`);
  if (passed !== total) process.exit(1);
}

run().catch(console.error);
