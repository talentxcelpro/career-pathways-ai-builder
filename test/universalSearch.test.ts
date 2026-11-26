import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryInterpreter } from '../src/services/search/universal/QueryInterpreter.ts';
import { RelevanceRanker } from '../src/services/search/universal/RelevanceRanker.ts';
import type { UniversalSearchItem } from '../src/services/search/universal/types.ts';

test('Universal Search — 30-Query Natural Language Test Matrix', async (t) => {
  const cases: Array<{
    id: number;
    query: string;
    expectedIntent?: string;
    expectedScope: string;
    check: (parsed: ReturnType<typeof QueryInterpreter.parse>) => boolean;
  }> = [
    {
      id: 1,
      query: 'Find HR managers in Noida.',
      expectedScope: 'people',
      check: (p) => p.entities.roles.includes('HR Manager') && p.filters.cities.includes('Noida'),
    },
    {
      id: 2,
      query: 'Find recruiters in Bangalore.',
      expectedScope: 'people',
      check: (p) => p.entities.roles.includes('Recruiter') && p.filters.cities.includes('Bengaluru'),
    },
    {
      id: 3,
      query: 'Find Python developers with 5 years of experience.',
      expectedScope: 'people',
      check: (p) => p.entities.skills.includes('Python') && p.filters.experienceMin === 5,
    },
    {
      id: 4,
      query: 'Find jobs for freshers in Delhi.',
      expectedScope: 'jobs',
      check: (p) => p.filters.isFresher === true && p.filters.cities.includes('Delhi'),
    },
    {
      id: 5,
      query: 'Find remote marketing jobs.',
      expectedScope: 'jobs',
      check: (p) => p.filters.isRemote === true && p.entities.industries.includes('Marketing'),
    },
    {
      id: 6,
      query: 'Find posts about AI recruitment.',
      expectedScope: 'posts',
      check: (p) => p.entities.skills.includes('AI') && p.primaryIntent === 'post_search',
    },
    {
      id: 7,
      query: 'Find communities for startup founders.',
      expectedScope: 'communities',
      check: (p) => p.primaryIntent === 'community_search' && p.entities.roles.includes('Founder'),
    },
    {
      id: 8,
      query: 'Find articles about ATS resumes.',
      expectedScope: 'articles',
      check: (p) => p.primaryIntent === 'article_search' && p.entities.skills.includes('ATS'),
    },
    {
      id: 9,
      query: 'Find candidates with Java and AWS.',
      expectedScope: 'talent',
      check: (p) => p.entities.skills.includes('Java') && p.entities.skills.includes('AWS'),
    },
    {
      id: 10,
      query: 'Find connections working in finance.',
      expectedScope: 'connections',
      check: (p) => p.filters.relationship === 'connections' && p.entities.industries.includes('Finance'),
    },
    {
      id: 11,
      query: 'Find recruiters who posted jobs this week.',
      expectedScope: 'people',
      check: (p) => p.entities.roles.includes('Recruiter') && p.filters.timeRange === '7d',
    },
    {
      id: 12,
      query: 'Find companies hiring in India.',
      expectedScope: 'companies',
      check: (p) => p.primaryIntent === 'company_search' && p.entities.locations.includes('India'),
    },
    {
      id: 13,
      query: 'Find internships in marketing.',
      expectedScope: 'jobs',
      check: (p) => p.filters.isInternship === true && p.entities.industries.includes('Marketing'),
    },
    {
      id: 14,
      query: 'Find people working at Microsoft.',
      expectedScope: 'people',
      check: (p) => p.entities.companies.includes('Microsoft'),
    },
    {
      id: 15,
      query: 'Find posts published in the last 24 hours.',
      expectedScope: 'posts',
      check: (p) => p.primaryIntent === 'post_search' && p.filters.timeRange === '24h',
    },
    {
      id: 16,
      query: 'Find people with MBA degrees.',
      expectedScope: 'people',
      check: (p) => p.entities.education.includes('MBA'),
    },
    {
      id: 17,
      query: 'Find remote jobs paying above 20 LPA.',
      expectedScope: 'jobs',
      check: (p) => p.filters.isRemote === true && p.filters.salaryMinAnnual === 2000000 && p.filters.salaryCurrency === 'INR',
    },
    {
      id: 18,
      query: 'Find professionals in healthcare.',
      expectedScope: 'people',
      check: (p) => p.entities.industries.includes('Healthcare'),
    },
    {
      id: 19,
      query: 'Find candidates immediately available.',
      expectedScope: 'talent',
      check: (p) => p.filters.activities.includes('immediate_joining'),
    },
    {
      id: 20,
      query: 'Find discussions about career growth.',
      expectedScope: 'posts',
      check: (p) => p.primaryIntent === 'post_search',
    },
    {
      id: 21,
      query: 'Find people in my network working in IT.',
      expectedScope: 'connections',
      check: (p) => p.filters.relationship === 'connections' && p.entities.industries.includes('IT'),
    },
    {
      id: 22,
      query: 'Find recruiters in Dubai.',
      expectedScope: 'people',
      check: (p) => p.entities.roles.includes('Recruiter') && p.filters.cities.includes('Dubai'),
    },
    {
      id: 23,
      query: 'Find startup communities.',
      expectedScope: 'communities',
      check: (p) => p.primaryIntent === 'community_search' && p.entities.industries.includes('Startups'),
    },
    {
      id: 24,
      query: 'Find people who recently joined TalentXcel.',
      expectedScope: 'people',
      check: (p) => p.filters.activities.includes('recently_joined'),
    },
    {
      id: 25,
      query: 'Find jobs with React and Node.',
      expectedScope: 'jobs',
      check: (p) => p.entities.skills.includes('React') && p.entities.skills.includes('Node.js'),
    },
    {
      id: 26,
      query: 'Find professionals with supply chain experience.',
      expectedScope: 'people',
      check: (p) => p.entities.skills.includes('Supply Chain Management'),
    },
    {
      id: 27,
      query: 'Find candidates with SAP.',
      expectedScope: 'talent',
      check: (p) => p.entities.skills.includes('SAP'),
    },
    {
      id: 28,
      query: 'Find companies hiring fresh graduates.',
      expectedScope: 'companies',
      check: (p) => p.primaryIntent === 'company_search' && p.filters.isFresher === true,
    },
    {
      id: 29,
      query: 'Find posts about work from home.',
      expectedScope: 'posts',
      check: (p) => p.primaryIntent === 'post_search' && p.filters.isRemote === true,
    },
    {
      id: 30,
      query: 'Find candidates with 3-5 years of experience.',
      expectedScope: 'talent',
      check: (p) => p.filters.experienceMin === 3 && p.filters.experienceMax === 5,
    },
  ];

  // Warm up V8 JIT to avoid cold-start microbench jitter
  QueryInterpreter.parse('warmup query');

  for (const tc of cases) {
    await t.test(`#${tc.id}: ${tc.query}`, () => {
      const start = performance.now();
      const parsed = QueryInterpreter.parse(tc.query);
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 50, `Query parsing took too long: ${elapsed}ms`);
      assert.ok(
        parsed.targetScopes.includes(tc.expectedScope as any),
        `Expected scope ${tc.expectedScope}, got [${parsed.targetScopes.join(', ')}]`
      );
      assert.ok(tc.check(parsed), `Failed check for "${tc.query}". Parsed: ${JSON.stringify(parsed)}`);
    });
  }
});

test('Universal Search — Security & Privacy Invariants', async (t) => {
  await t.test('Private messages are NEVER included in default universal search scopes', () => {
    const parsed = QueryInterpreter.parse('Python developer');
    assert.ok(!parsed.targetScopes.includes('messages'));
  });

  await t.test('Delhi NCR expands to Delhi, Noida, Gurugram, Faridabad, Ghaziabad', () => {
    const parsed = QueryInterpreter.parse('People working in Delhi NCR');
    assert.ok(parsed.filters.cities.includes('Noida'));
    assert.ok(parsed.filters.cities.includes('Gurugram'));
    assert.ok(parsed.filters.cities.includes('Delhi'));
  });

  await t.test('RelevanceRanker produces explainable matchReasons from real metadata', () => {
    const intent = QueryInterpreter.parse('Python AWS developer in Bangalore');
    const items: UniversalSearchItem[] = [
      {
        id: '1',
        type: 'people',
        title: 'Aarav Sharma',
        subtitle: 'Python Developer • Bengaluru',
        url: '/u/aarav',
        score: 10,
        matchReasons: [],
        metadata: { skills: ['Python', 'AWS'], location: 'Bengaluru', experience_years: 5 },
      },
      {
        id: '2',
        type: 'people',
        title: 'Other User',
        subtitle: 'Designer • Pune',
        url: '/u/other',
        score: 10,
        matchReasons: [],
        metadata: { skills: ['Figma'], location: 'Pune', experience_years: 2 },
      },
    ];

    const ranked = RelevanceRanker.rank(items, intent);
    assert.equal(ranked[0].id, '1');
    assert.ok(ranked[0].score > ranked[1].score);
    assert.ok(ranked[0].matchReasons.includes('Matches Python'));
    assert.ok(ranked[0].matchReasons.includes('Matches AWS'));
  });

  await t.test('Phase 5.A: IT is parsed as industry, never as a false-positive city', () => {
    const p1 = QueryInterpreter.parse('IT professionals in Delhi');
    assert.ok(p1.entities.industries.includes('IT'));
    assert.ok(!p1.filters.cities.includes('it' as any));
    assert.ok(p1.filters.cities.includes('Delhi'));

    const p2 = QueryInterpreter.parse('Professionals in IT');
    assert.ok(p2.entities.industries.includes('IT'));
    assert.ok(!p2.filters.cities.includes('it' as any));
  });

  await t.test('Phase 5.D: Compound skill matching detects AND vs OR mode', () => {
    const andParsed = QueryInterpreter.parse('Find candidates with Java and AWS');
    assert.equal(andParsed.filters.skillMatchMode, 'and');
    assert.ok(andParsed.entities.skills.includes('Java'));
    assert.ok(andParsed.entities.skills.includes('AWS'));

    const orParsed = QueryInterpreter.parse('Find candidates with Java or AWS');
    assert.equal(orParsed.filters.skillMatchMode, 'or');
    assert.ok(orParsed.entities.skills.includes('Java'));
    assert.ok(orParsed.entities.skills.includes('AWS'));

    const reactNode = QueryInterpreter.parse('Jobs requiring React and Node');
    assert.equal(reactNode.filters.skillMatchMode, 'and');
    assert.ok(reactNode.entities.skills.includes('React'));
    assert.ok(reactNode.entities.skills.includes('Node.js'));
  });

  await t.test('Phase 5.B: Recently joined intent filters without platform name pollution', () => {
    const parsed = QueryInterpreter.parse('Find people who recently joined TalentXcel');
    assert.ok(parsed.filters.activities.includes('recently_joined'));
    assert.ok(!parsed.keywords.includes('talentxcel'));
    assert.ok(!parsed.keywords.includes('joined'));
  });

  await t.test('Phase 5.C: Deterministic company extraction for known and DB companies', () => {
    const pGoogle = QueryInterpreter.parse('People working at Google in India');
    assert.ok(pGoogle.entities.companies.includes('Google'));

    const pOpenAI = QueryInterpreter.parse('Find engineers at OpenAI');
    assert.ok(pOpenAI.entities.companies.includes('OpenAI'));

    const pCanva = QueryInterpreter.parse('Product designers at Canva');
    assert.ok(pCanva.entities.companies.includes('Canva'));
  });

  await t.test('Phase 6: Primary intent alignment boosts target entity over incidental post mentions', () => {
    const intent = QueryInterpreter.parse('Recruiters in Bangalore');
    const items: UniversalSearchItem[] = [
      {
        id: 'post-1',
        type: 'posts',
        title: 'Welcome to TalentXcel! We are looking for recruiters to join...',
        score: 10,
        matchReasons: [],
        metadata: { author_id: 'bot-1' },
        url: '/network/posts/1',
      },
      {
        id: 'person-1',
        type: 'people',
        title: 'Priya Sharma',
        subtitle: 'Senior Recruiter • Bengaluru',
        score: 10,
        matchReasons: [],
        metadata: { location: 'Bengaluru', title: 'Recruiter' },
        url: '/u/priya',
      },
    ];

    const ranked = RelevanceRanker.rank(items, intent);
    assert.equal(ranked[0].id, 'person-1', 'Person should rank higher than post for people_search intent');
    assert.ok(ranked[0].score > ranked[1].score);
    assert.ok(ranked[0].matchReasons.includes('Located in Bengaluru'));
  });
});
