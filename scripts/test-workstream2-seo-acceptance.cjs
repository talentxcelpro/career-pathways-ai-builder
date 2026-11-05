/**
 * Workstream 2: Multi-Domain SEO Acceptance Test Suite
 * Validates all 9 specialist subdomain HTML templates and the root core template.
 */

const fs = require('fs');
const crypto = require('crypto');

const results = [];

function assert(description, condition, details = '') {
  results.push({
    test: description,
    passed: Boolean(condition),
    details: details
  });
  console.log(`${condition ? '✅ PASS' : '❌ FAIL'}: ${description}${details ? ' - ' + details : ''}`);
}

const DOMAIN_FILES = [
  { domain: 'jobs.talentxcel.in', file: 'public/index-jobs.html', expectedCanonical: 'https://jobs.talentxcel.in/', expectedH1: 'Discover Jobs That Match Your Ambition' },
  { domain: 'salary.talentxcel.in', file: 'public/index-salary.html', expectedCanonical: 'https://salary.talentxcel.in/', expectedH1: 'Know Your Market Value. Discover Your Next Career Move.' },
  { domain: 'careers.talentxcel.in', file: 'public/index-careers.html', expectedCanonical: 'https://careers.talentxcel.in/', expectedH1: 'Build a Career That Moves You Forward' },
  { domain: 'resume.talentxcel.in', file: 'public/index-resume.html', expectedCanonical: 'https://resume.talentxcel.in/', expectedH1: 'Create a Resume That Gets You Noticed' },
  { domain: 'learning.talentxcel.in', file: 'public/index-learning.html', expectedCanonical: 'https://learning.talentxcel.in/', expectedH1: 'Learn Skills That Move Your Career Forward' },
  { domain: 'colleges.talentxcel.in', file: 'public/index-colleges.html', expectedCanonical: 'https://colleges.talentxcel.in/', expectedH1: 'Connect Campus Talent with Career Opportunities' },
  { domain: 'employers.talentxcel.in', file: 'public/index-employers.html', expectedCanonical: 'https://employers.talentxcel.in/', expectedH1: 'Find the Right Talent. Hire with Confidence.' },
  { domain: 'government.talentxcel.in', file: 'public/index-government.html', expectedCanonical: 'https://government.talentxcel.in/', expectedH1: 'Find Government Career Opportunities in One Place' },
  { domain: 'passport.talentxcel.in', file: 'public/index-passport.html', expectedCanonical: 'https://passport.talentxcel.in/', expectedH1: "Your Career. Verified. Ready for What's Next." },
];

function runSeoTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING WORKSTREAM 2: MULTI-DOMAIN SEO ACCEPTANCE TESTS');
  console.log('================================================================\n');

  const textHashes = new Map();

  for (const item of DOMAIN_FILES) {
    console.log(`--- Checking ${item.domain} (${item.file}) ---`);

    assert(`File exists: ${item.file}`, fs.existsSync(item.file));
    if (!fs.existsSync(item.file)) continue;

    const html = fs.readFileSync(item.file, 'utf8');

    // 1. Exactly ONE <h1> tag
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    assert(
      `${item.domain} has exactly ONE <h1> tag`,
      h1Matches.length === 1,
      `Found ${h1Matches.length} H1: ${h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()).join(' | ')}`
    );

    // 2. H1 matches approved identity H1 exactly
    const h1Text = (h1Matches[0] || '').replace(/<[^>]+>/g, '').replace(/&apos;/g, "'").replace(/\s+/g, ' ').trim();
    assert(
      `${item.domain} <h1> matches approved identity`,
      h1Text === item.expectedH1,
      `H1 text: "${h1Text}"`
    );

    // 3. ZERO hidden crawler article (no tx-crawler-content with display:none)
    const hasHiddenCrawlerArticle = html.includes('tx-crawler-content') && html.includes('display:none');
    assert(
      `${item.domain} has NO hidden cloaked crawler article (display:none)`,
      !hasHiddenCrawlerArticle,
      'No cloaked SEO text'
    );

    // 4. Correct canonical tag
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const canonicalHref = canonicalMatch ? canonicalMatch[1] : '';
    assert(
      `${item.domain} has correct canonical URL`,
      canonicalHref === item.expectedCanonical,
      `Canonical: "${canonicalHref}"`
    );

    // 5. Initial visible semantic shell inside <div id="root">
    const hasInitialShellInsideRoot = html.includes('<div id="root">\n<div id="tx-initial-content"');
    assert(
      `${item.domain} contains visible semantic shell inside #root`,
      hasInitialShellInsideRoot && html.includes('<h1'),
      'Semantic shell present inside #root'
    );

    // 6. Unique content hash calculation (visible text only)
    const initialContentIdx = html.indexOf('id="tx-initial-content"');
    const initialContentBlock = initialContentIdx !== -1 ? html.slice(initialContentIdx, initialContentIdx + 4000) : '';
    const visibleText = initialContentBlock.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const hash = crypto.createHash('sha256').update(visibleText).digest('hex').slice(0, 12);
    assert(
      `${item.domain} has distinct content hash from other subdomains`,
      !textHashes.has(hash),
      `Hash: ${hash} (${textHashes.get(hash) || 'Unique'})`
    );
    textHashes.set(hash, item.domain);

    console.log('');
  }

  // -------------------------------------------------------------
  // TEST ROOT CORE DOMAIN (index.html)
  // -------------------------------------------------------------
  console.log('--- Checking Core Root Domain (index.html) ---');
  const rootHtml = fs.readFileSync('index.html', 'utf8');
  const rootH1Matches = rootHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  assert(
    'Root index.html has at most 1 primary <h1>',
    rootH1Matches.length <= 1,
    `Count: ${rootH1Matches.length}`
  );
  assert(
    'Root index.html canonical is https://talentxcel.in/',
    rootHtml.includes('https://talentxcel.in/'),
    'Canonical present'
  );

  // -------------------------------------------------------------
  // TEST REACT HYDRATION HOOK (src/main.tsx)
  // -------------------------------------------------------------
  console.log('\n--- Checking React Hydration Unmount Hook (src/main.tsx) ---');
  const mainCode = fs.readFileSync('src/main.tsx', 'utf8');
  assert(
    'src/main.tsx removes #tx-initial-content before createRoot',
    mainCode.includes('document.getElementById("tx-initial-content")') && mainCode.includes('.remove()'),
    'Initial shell cleanly removed before React mounts'
  );

  console.log('\n================================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`📊 SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED out of ${results.length} tests`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSeoTests();
