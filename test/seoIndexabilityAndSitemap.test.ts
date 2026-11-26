import test from 'node:test';
import assert from 'node:assert/strict';
import seoHandler, {
  evaluateProfileIndexability,
  evaluatePostIndexability,
  evaluateIndexabilityThreshold,
} from '../api/seo-render.ts';
import sitemapHandler, {
  isPassportProfileSitemapEligible,
  buildPassportUrlsetXml,
  escapeXml,
  PAGE_SIZE,
  POSTGREST_BATCH_SIZE,
  type PassportSitemapRecord,
} from '../api/sitemap-passport.ts';

test('Profile Indexability & Sitemap Parity: 100% agreement across eligible, thin, missing, deleted, suspended, private, and invalid cases', () => {
  const cases: Array<{ name: string; p: PassportSitemapRecord & { is_deleted?: boolean; is_suspended?: boolean }; expected: boolean }> = [
    {
      name: 'Eligible structured profile (< 400 prose words)',
      p: {
        username: 'synthetic-dev-user',
        full_name: 'Synthetic Developer',
        headline: 'Senior Backend Engineer building distributed APIs',
        location: 'Bengaluru',
        skills: ['TypeScript', 'PostgreSQL', 'Node.js'],
        is_profile_public: true,
        profile_visibility: 'public',
      },
      expected: true,
    },
    {
      name: 'Missing full_name must fail both render and sitemap',
      p: {
        username: 'no_name_user',
        full_name: '',
        headline: 'Senior Backend Engineer building distributed APIs',
        skills: ['TypeScript', 'PostgreSQL'],
        is_profile_public: true,
      },
      expected: false,
    },
    {
      name: 'Username with spaces must fail both render and sitemap',
      p: {
        username: 'invalid user spaces',
        full_name: 'Jane Doe',
        headline: 'Staff Engineer at Acme Corp',
        skills: ['Go', 'Rust'],
        is_profile_public: true,
      },
      expected: false,
    },
    {
      name: 'Missing is_profile_public (undefined) must NOT default permissively',
      p: {
        username: 'undef_consent',
        full_name: 'Jane Doe',
        headline: 'Staff Engineer at Acme Corp',
        skills: ['Go', 'Rust'],
      },
      expected: false,
    },
    {
      name: 'Private is_profile_public = false excluded',
      p: {
        username: 'private-user',
        full_name: 'Jane Doe',
        headline: 'Staff Engineer at Acme Corp',
        skills: ['Go', 'Rust'],
        is_profile_public: false,
      },
      expected: false,
    },
    {
      name: 'Private profile_visibility = private excluded',
      p: {
        username: 'private-vis',
        full_name: 'Jane Doe',
        headline: 'Staff Engineer at Acme Corp',
        skills: ['Go', 'Rust'],
        is_profile_public: true,
        profile_visibility: 'private',
      },
      expected: false,
    },
    {
      name: 'Deleted profile excluded',
      p: {
        username: 'deleted-user',
        full_name: 'Jane Doe',
        headline: 'Staff Engineer at Acme Corp',
        skills: ['Go', 'Rust'],
        is_profile_public: true,
        is_deleted: true,
      },
      expected: false,
    },
    {
      name: 'Suspended profile excluded',
      p: {
        username: 'suspended-user',
        full_name: 'Jane Doe',
        headline: 'Staff Engineer at Acme Corp',
        skills: ['Go', 'Rust'],
        is_profile_public: true,
        is_suspended: true,
      },
      expected: false,
    },
    {
      name: 'Thin placeholder profile excluded',
      p: {
        username: 'thin-user',
        full_name: 'Alex',
        headline: 'test',
        skills: [],
        is_profile_public: true,
      },
      expected: false,
    },
  ];

  for (const c of cases) {
    const skills = Array.isArray(c.p.skills) ? c.p.skills : [];
    const renderOk = evaluateProfileIndexability(c.p, skills, 120);
    const sitemapOk = isPassportProfileSitemapEligible(c.p);
    assert.equal(renderOk, c.expected, `render failed for: ${c.name}`);
    assert.equal(sitemapOk, c.expected, `sitemap failed for: ${c.name}`);
    assert.equal(renderOk, sitemapOk, `parity mismatch for: ${c.name}`);
  }
});

test('Post Indexability: explicit public authorization required; rejects missing visibility, private, connections, followers, deleted, and empty media shells', () => {
  assert.equal(
    evaluatePostIndexability(
      {
        content: 'Sharing key learnings from scaling PostgreSQL search indexes across 10k jobs in India.',
        visibility: 'public',
        is_public: true,
        is_deleted: false,
      },
      [],
      [],
      45
    ),
    true
  );

  assert.equal(
    evaluatePostIndexability(
      { content: 'Architecture diagram for our search layer', visibility: 'public', is_public: true },
      ['https://cdn.example.com/arch.png'],
      [],
      20
    ),
    true
  );

  assert.equal(
    evaluatePostIndexability(
      { content: 'Quick product demo walkthrough clip', visibility: 'public', is_public: true },
      [],
      ['https://cdn.example.com/demo.mp4'],
      15
    ),
    true
  );

  // Missing visibility & is_public must NOT default permissively
  assert.equal(
    evaluatePostIndexability(
      { content: 'Post missing explicit visibility and is_public authorization fields.' },
      [],
      [],
      25
    ),
    false
  );

  // Empty media shell excluded
  assert.equal(
    evaluatePostIndexability(
      { content: '', visibility: 'public', is_public: true },
      [],
      ['https://cdn.example.com/demo.mp4'],
      10
    ),
    false
  );

  // Deleted, private, followers, connections excluded
  for (const vis of ['private', 'followers', 'connections']) {
    assert.equal(
      evaluatePostIndexability(
        { content: 'Restricted audience post that must never be indexed.', visibility: vis },
        [],
        [],
        25
      ),
      false
    );
  }
  assert.equal(
    evaluatePostIndexability(
      { content: 'Deleted post content that must never be indexed.', visibility: 'public', is_deleted: true },
      [],
      [],
      25
    ),
    false
  );
});

test('End-to-End Mocked HTTP Handler: valid profiles & text/image/video posts under 400 words emit "index, follow" and leak zero PII', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const urlStr = String(input);
      if (urlStr.includes('/public_profiles')) {
        if (urlStr.includes('thin_user')) {
          return new Response(
            JSON.stringify([
              {
                id: '33333333-3333-3333-3333-333333333333',
                username: 'thin_user',
                full_name: 'Alex',
                headline: 'test',
                skills: [],
                is_profile_public: true,
              },
            ]),
            { status: 200, headers: { 'content-type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify([
            {
              id: '11111111-1111-1111-1111-111111111111',
              username: 'qualified_pro',
              full_name: 'Aarav Sharma',
              headline: 'Principal Systems Architect designing distributed search platforms',
              about: 'Experienced engineer specializing in cloud search and distributed APIs.',
              location: 'Bengaluru',
              skills: ['PostgreSQL', 'TypeScript', 'Kubernetes'],
              experience_years: 8,
              current_company: 'TechCorp',
              is_profile_public: true,
              created_at: '2026-11-15T10:00:00Z',
              // Synthetic PII to ensure renderer never emits sensitive fields
              email: 'SECRET_PII_EMAIL@example.com',
              phone: '+91-9999900000',
              resume_url: 'https://secret.example/resume.pdf',
              preferred_salary_min: 9999999,
            },
          ]),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }

      if (urlStr.includes('/posts')) {
        if (urlStr.includes('44444444-4444-4444-4444-444444444444')) {
          // Valid text post (< 400 words)
          return new Response(
            JSON.stringify([
              {
                id: '44444444-4444-4444-4444-444444444444',
                content: 'Deep dive into full-text PostgreSQL indexing strategies and GIN index performance tuning for scalable career platforms.',
                media_urls: [],
                created_at: '2026-11-25T10:00:00Z',
                author_id: '11111111-1111-1111-1111-111111111111',
                visibility: 'public',
                is_public: true,
                is_deleted: false,
              },
            ]),
            { status: 200, headers: { 'content-type': 'application/json' } }
          );
        }
        if (urlStr.includes('55555555-5555-5555-5555-555555555555')) {
          // Valid image post (< 400 words)
          return new Response(
            JSON.stringify([
              {
                id: '55555555-5555-5555-5555-555555555555',
                content: 'Distributed search architecture visual overview across multiple providers.',
                media_urls: ['https://cdn.example.com/search-arch.png'],
                created_at: '2026-11-25T10:00:00Z',
                author_id: '11111111-1111-1111-1111-111111111111',
                visibility: 'public',
                is_public: true,
                is_deleted: false,
              },
            ]),
            { status: 200, headers: { 'content-type': 'application/json' } }
          );
        }
        if (urlStr.includes('22222222-2222-2222-2222-222222222222')) {
          // Valid video post (< 400 words)
          return new Response(
            JSON.stringify([
              {
                id: '22222222-2222-2222-2222-222222222222',
                content: 'Live architecture walkthrough video demonstration for TalentXcel search engine.',
                media_urls: ['https://cdn.example.com/demo.mp4'],
                featured_image_url: 'https://cdn.example.com/thumb.jpg',
                created_at: '2026-11-25T10:00:00Z',
                author_id: '11111111-1111-1111-1111-111111111111',
                visibility: 'public',
                is_public: true,
                is_deleted: false,
              },
            ]),
            { status: 200, headers: { 'content-type': 'application/json' } }
          );
        }
        if (urlStr.includes('66666666-6666-6666-6666-666666666666')) {
          // Private post must be excluded even if returned by mock
          return new Response(
            JSON.stringify([
              {
                id: '66666666-6666-6666-6666-666666666666',
                content: 'Private message note that should strictly remain excluded from indexing.',
                media_urls: [],
                created_at: '2026-11-25T10:00:00Z',
                visibility: 'private',
                is_public: false,
                is_deleted: false,
              },
            ]),
            { status: 200, headers: { 'content-type': 'application/json' } }
          );
        }
      }
      return new Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    // 1. Eligible profile (< 400 words) -> MUST have index, follow and ZERO leaked PII
    const profRes = await seoHandler(new Request('https://talentxcel.in/api/seo-render?path=u/qualified_pro'));
    const profHtml = await profRes.text();
    assert.equal(profRes.status, 200);
    assert.ok(profHtml.includes('<meta name="robots" content="index, follow">'), 'Eligible profile must emit index, follow');
    for (const secret of ['SECRET_PII_EMAIL', '9999900000', 'resume.pdf', '9999999']) {
      assert.equal(profHtml.includes(secret), false, `Profile HTML leaked PII: ${secret}`);
    }

    // 2. Thin profile -> MUST remain noindex, follow
    const thinRes = await seoHandler(new Request('https://talentxcel.in/api/seo-render?path=u/thin_user'));
    const thinHtml = await thinRes.text();
    assert.ok(thinHtml.includes('<meta name="robots" content="noindex, follow">'), 'Thin profile must emit noindex, follow');

    // 3. Eligible text post (< 400 words) -> MUST emit index, follow
    const textPostRes = await seoHandler(new Request('https://talentxcel.in/api/seo-render?path=posts/44444444-4444-4444-4444-444444444444'));
    const textPostHtml = await textPostRes.text();
    assert.ok(textPostHtml.includes('<meta name="robots" content="index, follow">'), 'Eligible text post must emit index, follow');

    // 4. Eligible image post (< 400 words) -> MUST emit index, follow and <img>
    const imgPostRes = await seoHandler(new Request('https://talentxcel.in/api/seo-render?path=posts/55555555-5555-5555-5555-555555555555'));
    const imgPostHtml = await imgPostRes.text();
    assert.ok(imgPostHtml.includes('<meta name="robots" content="index, follow">'), 'Eligible image post must emit index, follow');
    assert.ok(imgPostHtml.includes('<img src="https://cdn.example.com/search-arch.png"'), 'Image tag must render');

    // 5. Eligible video post (< 400 words) -> MUST emit index, follow, VideoObject, and non-video og:image
    const vidPostRes = await seoHandler(new Request('https://talentxcel.in/api/seo-render?path=posts/22222222-2222-2222-2222-222222222222'));
    const vidPostHtml = await vidPostRes.text();
    assert.ok(vidPostHtml.includes('<meta name="robots" content="index, follow">'), 'Eligible video post must emit index, follow');
    assert.ok(vidPostHtml.includes('"@type": "VideoObject"') || vidPostHtml.includes('"VideoObject"'), 'VideoObject schema must render');
    assert.ok(vidPostHtml.includes('<meta property="og:image" content="https://cdn.example.com/thumb.jpg">'), 'og:image must use thumbnail, not .mp4');

    // 6. Private post -> MUST emit noindex, follow
    const privPostRes = await seoHandler(new Request('https://talentxcel.in/api/seo-render?path=posts/66666666-6666-6666-6666-666666666666'));
    const privPostHtml = await privPostRes.text();
    assert.ok(privPostHtml.includes('<meta name="robots" content="noindex, follow">'), 'Private post must remain noindex');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Legacy evaluateIndexabilityThreshold remains intact for editorial/hub pages', () => {
  assert.equal(evaluateIndexabilityThreshold(3, 450), true);
  assert.equal(evaluateIndexabilityThreshold(2, 450), false);
  assert.equal(evaluateIndexabilityThreshold(3, 200), false);
});

test('Passport Sitemap: eligibility, XML escaping, deduplication, sharding, and >1000 scaling', async () => {
  assert.equal(PAGE_SIZE, 10_000);
  assert.equal(POSTGREST_BATCH_SIZE, 1_000);

  const validProfile: PassportSitemapRecord = {
    username: 'synthetic_pro_1',
    full_name: 'Synthetic Pro',
    headline: 'Cloud Infrastructure Architect',
    skills: ['Kubernetes', 'Terraform'],
    location: 'Pune',
    is_profile_public: true,
    profile_visibility: 'public',
    created_at: '2026-11-20T10:00:00Z',
  };

  assert.equal(isPassportProfileSitemapEligible(validProfile), true);
  assert.equal(isPassportProfileSitemapEligible({ username: 'invalid user', full_name: 'Jane Doe', skills: ['A', 'B'], location: 'Delhi', is_profile_public: true }), false);
  assert.equal(isPassportProfileSitemapEligible({ username: 'no_consent', full_name: 'Jane Doe', skills: ['A', 'B'], location: 'Delhi' }), false);

  const xmlWithDup = buildPassportUrlsetXml([validProfile, { ...validProfile }], false);
  assert.equal((xmlWithDup.match(/<loc>/g) || []).length, 1);
  assert.ok(xmlWithDup.includes('<loc>https://talentxcel.in/u/synthetic_pro_1</loc>'));
  assert.equal(escapeXml(`a&b<c>"d"'e`), 'a&amp;b&lt;c&gt;&quot;d&quot;&apos;e');

  // Verify 1,250 synthetic profiles scale past PostgREST 1,000 limit
  const syntheticBatch: PassportSitemapRecord[] = Array.from({ length: 1250 }, (_, idx) => ({
    ...validProfile,
    username: `synthetic_user_${idx}`,
  }));
  const largeXml = buildPassportUrlsetXml(syntheticBatch, false);
  assert.equal((largeXml.match(/<loc>/g) || []).length, 1250);

  // Mocked 10,001-row sitemapindex + shard routing test
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'HEAD') {
        return new Response(null, { status: 200, headers: { 'content-range': '0-0/10001' } });
      }
      const u = new URL(String(input));
      const limit = Number(u.searchParams.get('limit') || '1000');
      const offset = Number(u.searchParams.get('offset') || '0');
      const count = offset >= 10001 ? 0 : Math.min(limit, 10001 - offset);
      const rows = Array.from({ length: count }, (_, idx) => ({
        ...validProfile,
        username: `shard_u_${offset + idx}`,
      }));
      return new Response(JSON.stringify(rows), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    const indexRes = await sitemapHandler(new Request('https://talentxcel.in/sitemap-passport.xml'));
    const indexXml = await indexRes.text();
    assert.equal((indexXml.match(/<sitemap>/g) || []).length, 2);

    const page2Res = await sitemapHandler(new Request('https://talentxcel.in/sitemap-passport.xml?page=2'));
    const page2Xml = await page2Res.text();
    assert.equal((page2Xml.match(/<loc>/g) || []).length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
