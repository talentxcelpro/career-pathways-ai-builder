import { KEEP_200_JOB_SLUGS, FLAGSHIP_ROUTES, KEEP_200_JOB_NOINDEX_APP_SLUGS } from '../src/lib/seo/legacySlugDisposition.js';

const BASE = (process.env.TARGET_URL || 'https://talentxcel.in').replace(/\/+$/, '');
const BYPASS = process.env.VERCEL_BYPASS_SECRET || '';

async function main() {
  const routes = [
    ...KEEP_200_JOB_SLUGS.map((s) => `/jobs/${s}`),
    ...FLAGSHIP_ROUTES,
  ];
  const failures: string[] = [];

  for (const path of routes) {
    const headers: Record<string, string> = { 'User-Agent': 'Googlebot' };
    if (BYPASS) headers['x-vercel-protection-bypass'] = BYPASS;

    const res = await fetch(`${BASE}${path}`, { headers, redirect: 'manual' });
    const xRobots = res.headers.get('x-robots-tag') || '';
    const slug = path.startsWith('/jobs/') ? path.slice('/jobs/'.length) : '';
    const expectNoindex = KEEP_200_JOB_NOINDEX_APP_SLUGS.has(slug);

    if (res.status !== 200) {
      failures.push(`${path} -> HTTP ${res.status} (expected 200)`);
    } else if (expectNoindex && !xRobots.toLowerCase().includes('noindex')) {
      failures.push(`${path} -> HTTP 200 but X-Robots-Tag="${xRobots}" (expected noindex)`);
    }
    console.log(`${res.status === 200 ? 'OK' : 'FAIL'} ${path} -> ${res.status} (${xRobots || 'no x-robots-tag'})`);
  }

  if (failures.length > 0) {
    console.error('\nCI Check Failed (non-200 or missing noindex on Googlebot):');
    for (const f of failures) console.error('  -', f);
    process.exit(1);
  }
  console.log(`\n✓ All ${routes.length} keep-200 + flagship routes returned 200 for Googlebot on ${BASE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
