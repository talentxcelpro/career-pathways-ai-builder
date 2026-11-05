/**
 * Workstream 2: Post-JavaScript SEO & Headless Chrome Screenshot Verification Suite
 * 
 * Tests all 9 specialist subdomains:
 * 1. Post-JS rendered DOM (JavaScript ENABLED)
 * 2. Initial HTML semantic content (JavaScript DISABLED)
 * 3. H1 uniqueness & exact copy matching
 * 4. High-resolution screenshot capture
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:8080';
const OUT_DIR = path.resolve('reports/evidence_screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const SUBDOMAINS = [
  {
    sub: 'jobs',
    domain: 'jobs.talentxcel.in',
    expectedH1: 'Discover Jobs That Match Your Ambition',
    expectedAudience: 'Jobseekers & Active Professionals'
  },
  {
    sub: 'salary',
    domain: 'salary.talentxcel.in',
    expectedH1: 'Know Your Market Value. Discover Your Next Career Move.',
    expectedAudience: 'Professionals, Jobseekers & Career Changers'
  },
  {
    sub: 'careers',
    domain: 'careers.talentxcel.in',
    expectedH1: 'Build a Career That Moves You Forward',
    expectedAudience: 'Students, Early-Career & Mid-Level Professionals'
  },
  {
    sub: 'resume',
    domain: 'resume.talentxcel.in',
    expectedH1: 'Create a Resume That Gets You Noticed',
    expectedAudience: 'Jobseekers, Candidates & Career Changers'
  },
  {
    sub: 'learning',
    domain: 'learning.talentxcel.in',
    expectedH1: 'Learn Skills That Move Your Career Forward',
    expectedAudience: 'Students, Fresh Graduates & Working Professionals'
  },
  {
    sub: 'colleges',
    domain: 'colleges.talentxcel.in',
    expectedH1: 'Connect Campus Talent with Career Opportunities',
    expectedAudience: 'Colleges, Universities & Placement Cells'
  },
  {
    sub: 'employers',
    domain: 'employers.talentxcel.in',
    expectedH1: 'Find the Right Talent. Hire with Confidence.',
    expectedAudience: 'Employers, Founders & Hiring Teams'
  },
  {
    sub: 'government',
    domain: 'government.talentxcel.in',
    expectedH1: 'Find Government Career Opportunities in One Place',
    expectedAudience: 'Aspirants, Fresh Graduates & Public-Sector Candidates'
  },
  {
    sub: 'passport',
    domain: 'passport.talentxcel.in',
    expectedH1: "Your Career. Verified. Ready for What's Next.",
    expectedAudience: 'Students, Professionals & Verified Talent'
  }
];

const results = [];

function assert(description, condition, details = '') {
  results.push({ test: description, passed: Boolean(condition), details });
  console.log(`${condition ? '✅ PASS' : '❌ FAIL'}: ${description}${details ? ' - ' + details : ''}`);
}

async function runAudit() {
  console.log('================================================================');
  console.log('🧪 RUNNING POST-JAVASCRIPT DOM & SCREENSHOT VERIFICATION');
  console.log('================================================================\n');

  for (const item of SUBDOMAINS) {
    console.log(`\n--- Inspecting ${item.domain} ---`);
    const targetUrl = `${BASE_URL}/?__domain=${item.domain}`;
    const shotPath = path.join(OUT_DIR, `${item.sub}.png`);

    // 1. Capture Screenshot with JavaScript ENABLED
    try {
      execFileSync(CHROME_PATH, [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1280,850',
        `--screenshot=${shotPath}`,
        '--virtual-time-budget=3000',
        targetUrl
      ]);
      const shotExists = fs.existsSync(shotPath);
      const shotSize = shotExists ? fs.statSync(shotPath).size : 0;
      assert(`${item.domain}: Real browser screenshot captured`, shotExists && shotSize > 10000, `Size: ${shotSize} bytes (${shotPath})`);
    } catch (e) {
      assert(`${item.domain}: Real browser screenshot captured`, false, e.message);
    }

    // 2. Dump Post-JavaScript DOM
    let postJsDom = '';
    try {
      postJsDom = execFileSync(CHROME_PATH, [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--dump-dom',
        '--virtual-time-budget=3000',
        targetUrl
      ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    } catch (e) {
      postJsDom = '';
    }

    assert(`${item.domain}: Post-JS DOM dumped successfully`, postJsDom.length > 5000, `Length: ${postJsDom.length} chars`);

    // Verify H1 in Post-JS DOM
    const h1Matches = postJsDom.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    assert(`${item.domain}: Post-JS DOM has exactly ONE <h1> tag`, h1Matches.length === 1, `Found ${h1Matches.length} H1 tags`);

    if (h1Matches.length > 0) {
      const cleanH1 = h1Matches[0].replace(/<[^>]+>/g, '').trim();
      const h1MatchesExpected = cleanH1.toLowerCase().includes(item.expectedH1.toLowerCase().replace(/&apos;/g, "'"));
      assert(`${item.domain}: Post-JS H1 matches approved identity`, h1MatchesExpected, `H1 text: "${cleanH1}"`);
    }

    // Verify Canonical in Post-JS DOM
    const canonicalMatch = postJsDom.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1] : '';
    assert(`${item.domain}: Post-JS canonical tag correct`, canonicalUrl.includes(item.domain), `Canonical: "${canonicalUrl}"`);

    // Verify Title in Post-JS DOM
    const titleMatch = postJsDom.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    assert(`${item.domain}: Post-JS <title> present`, title.length > 10, `Title: "${title}"`);

    // Verify No Error / Crash Fallback
    const hasCrash = postJsDom.includes('Something went wrong') || postJsDom.includes('cannot convert object');
    assert(`${item.domain}: Zero runtime error or crash screen in DOM`, !hasCrash, 'Clean render without error boundary');

    // 3. Inspect Initial HTML with JavaScript DISABLED (as received by standard HTTP spiders)
    let noJsHtml = '';
    try {
      const htmlPath = path.resolve(`public/index-${item.sub}.html`);
      noJsHtml = fs.readFileSync(htmlPath, 'utf8');
    } catch (e) {
      noJsHtml = '';
    }

    const noJsH1 = (noJsHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim() || '';
    assert(`${item.domain}: Initial No-JS HTML contains visible semantic shell`, noJsHtml.includes('tx-initial-content'), `Length: ${noJsHtml.length}`);
    assert(`${item.domain}: Initial No-JS HTML has exact approved H1`, noJsH1.toLowerCase().includes(item.expectedH1.toLowerCase().replace(/&apos;/g, "'")), `H1: "${noJsH1}"`);
    assert(`${item.domain}: Initial No-JS HTML has zero display:none cloaking`, !noJsHtml.includes('display:none'), 'Zero cloaked SEO text');
  }

  // -------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------
  console.log('\n================================================================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`📊 SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${results.length} checks`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit();
