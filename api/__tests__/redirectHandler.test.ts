import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../seo-render.js';

const originalFetch = globalThis.fetch;

describe('Single-hop 301 redirect handler', () => {
  beforeEach(() => {
    globalThis.fetch = async (input: any) => {
      const url = String(input);
      if (url.includes('/job_slug_redirects')) {
        if (url.includes('software-engineer-tcs-pune-1')) {
          return new Response(JSON.stringify([{ to_slug: 'software-engineer-tcs-pune' }]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url.includes('/jobs?') && url.includes('id=eq.00356e16-87eb-4c43-8c6e-ffd17bc66177')) {
        return new Response(
          JSON.stringify([{ id: '00356e16-87eb-4c43-8c6e-ffd17bc66177', seo_slug: 'junior-software-engineer-wipro-kochi' }]),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('redirects jobs.talentxcel.in/jobs/:old-slug to final apex canonical in 1 hop (301)', async () => {
    const req = new Request('https://jobs.talentxcel.in/api/seo-render?path=jobs/software-engineer-tcs-pune-1', {
      headers: { host: 'jobs.talentxcel.in' },
    });
    const res = await handler(req);
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), 'https://talentxcel.in/jobs/software-engineer-tcs-pune');
  });

  it('redirects talentxcel.in/jobs/:old-slug via job_slug_redirects in 1 hop (301)', async () => {
    const req = new Request('https://talentxcel.in/api/seo-render?path=jobs/software-engineer-tcs-pune-1', {
      headers: { host: 'talentxcel.in' },
    });
    const res = await handler(req);
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), 'https://talentxcel.in/jobs/software-engineer-tcs-pune');
  });

  it('redirects UUID job URLs to seo_slug on apex in 1 hop (301)', async () => {
    const req = new Request('https://jobs.talentxcel.in/api/seo-render?path=jobs/00356e16-87eb-4c43-8c6e-ffd17bc66177', {
      headers: { host: 'jobs.talentxcel.in' },
    });
    const res = await handler(req);
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), 'https://talentxcel.in/jobs/junior-software-engineer-wipro-kochi');
  });
});
