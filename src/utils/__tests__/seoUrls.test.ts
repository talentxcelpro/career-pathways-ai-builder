import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateJobSlug, resolveCollisionFreeJobSlug } from '../seoUrls.js';

describe('M6 new-ingestion slug collision rule', () => {
  it('generateJobSlug appends first 8 chars of id', () => {
    const slug = generateJobSlug('Software Engineer', 'Bangalore', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'mid-level');
    assert.equal(slug, 'software-engineer-mid-level-bangalore-a1b2c3d4');
    assert.ok(!slug.endsWith('-1'));
  });

  it('resolveCollisionFreeJobSlug keeps baseSlug when no collision exists', () => {
    const existing = new Set(['other-slug']);
    const result = resolveCollisionFreeJobSlug('data-analyst-tcs-pune', '12345678-aaaa-bbbb-cccc-1234567890ab', existing);
    assert.equal(result, 'data-analyst-tcs-pune');
  });

  it('resolveCollisionFreeJobSlug appends 8-char id hex instead of -1 on collision', () => {
    const existing = new Set(['data-analyst-tcs-pune']);
    const result = resolveCollisionFreeJobSlug('data-analyst-tcs-pune', '12345678-aaaa-bbbb-cccc-1234567890ab', existing);
    assert.equal(result, 'data-analyst-tcs-pune-12345678');
    assert.ok(!result.endsWith('-1'));
  });

  it('resolveCollisionFreeJobSlug caps total length at 100 chars', () => {
    const longBase = 'a'.repeat(100);
    const existing = new Set([longBase]);
    const result = resolveCollisionFreeJobSlug(longBase, 'deadbeef-0000-1111-2222-333344445555', existing);
    assert.equal(result.length, 100);
    assert.ok(result.endsWith('-deadbeef'));
  });
});
