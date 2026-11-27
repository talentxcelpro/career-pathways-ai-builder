import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  DEAD_410_JOB_SLUGS,
  UNMATCHED_301_JOB_SLUGS,
  resolveLegacyJobSlugDisposition,
} from '../legacySlugDisposition.js';

const KEEP_200_SLUGS = [
  'data-analyst', 'software-engineer', 'data-scientist', 'product-manager',
  'devops-engineer', 'ui-ux-designer', 'full-stack-developer', 'frontend-developer',
  'backend-developer', 'machine-learning-engineer', 'business-analyst', 'project-manager',
  'marketing-manager', 'hr-manager', 'financial-analyst', 'operations-manager',
  'content-writer', 'risk-analyst',
  'delhi', 'bangalore', 'pune', 'mumbai', 'hyderabad', 'chennai', 'noida',
  'remote', 'alerts', 'saved', 'applied',
];

describe('All 171 unmatched legacy slugs disposition (29 pass-through 200, 36 301, 106 410)', () => {
  it('partition sums to exactly 171 unique slugs with zero overlap', () => {
    assert.equal(KEEP_200_SLUGS.length, 29);
    assert.equal(Object.keys(UNMATCHED_301_JOB_SLUGS).length, 36);
    assert.equal(DEAD_410_JOB_SLUGS.size, 106);
    const all = new Set([
      ...KEEP_200_SLUGS,
      ...Object.keys(UNMATCHED_301_JOB_SLUGS),
      ...DEAD_410_JOB_SLUGS,
    ]);
    assert.equal(all.size, 171);
  });

  it('keeps all 29 live role/city/app slugs untouched (returns null pass-through)', () => {
    for (const slug of KEEP_200_SLUGS) {
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

  it('resolves all 45 301 slugs to their exact verified 200 target URL', () => {
    for (const [slug, target] of Object.entries(UNMATCHED_301_JOB_SLUGS)) {
      const disp = resolveLegacyJobSlugDisposition(slug);
      assert.deepEqual(disp, { type: '301', location: `https://talentxcel.in${target}` }, `Mismatch for ${slug}`);
    }
  });

  it('resolves all 98 dead slugs to 410 Gone', () => {
    for (const slug of DEAD_410_JOB_SLUGS) {
      const disp = resolveLegacyJobSlugDisposition(slug);
      assert.deepEqual(disp, { type: '410' }, `Expected 410 for ${slug}`);
    }
  });

  it('middleware.ts contains all 98 410s, 45 301s, and 1,064 static redirects with zero Supabase calls in 1a', () => {
    const mw = fs.readFileSync(new URL('../../../../middleware.ts', import.meta.url), 'utf8');
    assert.ok(!mw.includes('lookupJobSlugRedirectEdge'), 'middleware.ts must not query Supabase for job_slug_redirects');
    for (const slug of DEAD_410_JOB_SLUGS) {
      assert.ok(mw.includes(`'${slug}'`), `middleware.ts missing 410 slug ${slug}`);
    }
    for (const slug of Object.keys(UNMATCHED_301_JOB_SLUGS)) {
      assert.ok(mw.includes(`'${slug}'`), `middleware.ts missing 301 slug ${slug}`);
    }
  });
});
