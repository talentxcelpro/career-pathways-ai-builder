import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  DEAD_410_JOB_SLUGS,
  UNMATCHED_301_JOB_SLUGS,
  KEEP_200_JOB_SLUGS,
  KEEP_200_JOB_NOINDEX_APP_SLUGS,
  FLAGSHIP_ROUTES,
  resolveLegacyJobSlugDisposition,
} from '../legacySlugDisposition.js';
import handler, { resolveCanaryCanonical } from '../../../../api/seo-render.js';

describe('All 171 unmatched legacy slugs disposition (29 pass-through 200, 36 301, 106 410)', () => {
  it('partition sums to exactly 171 unique slugs with zero overlap', () => {
    assert.equal(KEEP_200_JOB_SLUGS.length, 29);
    assert.equal(Object.keys(UNMATCHED_301_JOB_SLUGS).length, 36);
    assert.equal(DEAD_410_JOB_SLUGS.size, 106);
    const all = new Set([
      ...KEEP_200_JOB_SLUGS,
      ...Object.keys(UNMATCHED_301_JOB_SLUGS),
      ...DEAD_410_JOB_SLUGS,
    ]);
    assert.equal(all.size, 171);
  });

  it('keeps all 29 live role/city/app slugs untouched (returns null pass-through)', () => {
    for (const slug of KEEP_200_JOB_SLUGS) {
      assert.equal(resolveLegacyJobSlugDisposition(slug), null, `Expected pass-through for ${slug}`);
    }
  });

  it('has zero 301 loops or 2-hop chains into UNMATCHED_301 or DEAD_410', () => {
    for (const [slug, target] of Object.entries(UNMATCHED_301_JOB_SLUGS)) {
      const m = target.match(/^\/jobs\/([^/]+)$/);
      if (m) {
        const targetSlug = m[1];
        assert.equal(UNMATCHED_301_JOB_SLUGS[targetSlug], undefined, `2-hop/loop detected: ${slug} -> ${target}`);
        assert.equal(DEAD_410_JOB_SLUGS.has(targetSlug), false, `301 into 410 detected: ${slug} -> ${target}`);
      }
    }
  });

  it('keeps middleware.ts inlined sets and VALID_STATIC_JOB_ROUTES in exact sync with legacySlugDisposition.ts', () => {
    const mw = fs.readFileSync('middleware.ts', 'utf8');
    for (const slug of DEAD_410_JOB_SLUGS) {
      assert.ok(mw.includes(`'${slug}'`), `middleware.ts missing 410 slug: ${slug}`);
    }
    for (const [slug, target] of Object.entries(UNMATCHED_301_JOB_SLUGS)) {
      assert.ok(mw.includes(`'${slug}': '${target}'`), `middleware.ts missing 301 slug: ${slug}`);
    }
    for (const slug of KEEP_200_JOB_SLUGS) {
      assert.ok(mw.includes(`'${slug}'`), `middleware.ts VALID_STATIC_JOB_ROUTES missing keep-200 slug: ${slug}`);
    }
  });

  it('api/seo-render.ts returns HTTP 200 for all 29 KEEP_200_JOB_SLUGS and all 7 FLAGSHIP_ROUTES as Googlebot', async () => {
    const targets = [
      ...KEEP_200_JOB_SLUGS.map((s) => `/jobs/${s}`),
      ...FLAGSHIP_ROUTES,
    ];
    for (const path of targets) {
      const req = new Request(`https://talentxcel.in/api/seo-render?path=${encodeURIComponent(path)}`, {
        headers: { 'user-agent': 'Googlebot' },
      });
      const res = await handler(req);
      assert.equal(res.status, 200, `Expected 200 from api/seo-render for ${path}, got ${res.status}`);
      const slug = path.startsWith('/jobs/') ? path.slice('/jobs/'.length) : '';
      if (KEEP_200_JOB_NOINDEX_APP_SLUGS.has(slug)) {
        assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow', `Expected noindex, nofollow for ${path}`);
      }
    }
  });

  it('emits unified salary.talentxcel.in canonical across api/seo-render and middleware.ts', () => {
    assert.equal(resolveCanaryCanonical('salary', 'SALARY'), 'https://salary.talentxcel.in/salary');
    assert.equal(resolveCanaryCanonical('salary/data-scientist', 'SALARY'), 'https://salary.talentxcel.in/salary/data-scientist');
    assert.equal(resolveCanaryCanonical('salary/ui-ux-designer', 'SALARY'), 'https://salary.talentxcel.in/salary/ui-ux-designer');
    const mw = fs.readFileSync('middleware.ts', 'utf8');
    assert.ok(mw.includes("canonical: 'https://salary.talentxcel.in/salary'"), 'middleware.ts missing /salary canonical');
    assert.ok(mw.includes('https://salary.talentxcel.in/salary/${encodeURIComponent(slug)}'), 'middleware.ts missing /salary/:slug canonical');
  });
});
