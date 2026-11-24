// TalentXcel live mobile smoke test: logged-out user clicks "Apply Now" and the guest modal must open.
// - Blocks GA/GTM requests and sets ga-disable so synthetic runs never appear in GA4.
// - Picks a real job from /jobs dynamically each run (supporting card div and anchor), so it doesn't break when one job expires.
// - Exits 1 on failure and optionally POSTs to ALERT_WEBHOOK_URL (Slack/Discord/etc).
// Setup: npm i playwright && npx playwright install chromium
// Run:   node scripts/e2e-live-smoke-test.cjs        (BASE_URL, ALERT_WEBHOOK_URL optional)

const { chromium, devices } = require('playwright');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'https://talentxcel.in';
const MEASUREMENT_ID = 'G-CMYNTTNT56';
const BLOCKED = /(google-analytics\.com|analytics\.google\.com|googletagmanager\.com|doubleclick\.net)/;

async function alertAndExit(msg) {
  console.error('FAILED:', msg);
  if (process.env.ALERT_WEBHOOK_URL) {
    try {
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `TalentXcel smoke test FAILED: ${msg}` }),
      });
    } catch (_) { /* alerting is best-effort */ }
  }
  process.exit(1);
}

(async () => {
  const iphone = devices['iPhone 13'];

  // Check for local Chrome vs bundled Chromium
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const hasLocalChrome = fs.existsSync(chromePath);

  const browser = await chromium.launch({
    headless: true,
    channel: process.env.CI ? undefined : (hasLocalChrome ? 'chrome' : undefined),
    executablePath: (!process.env.CI && hasLocalChrome) ? chromePath : undefined
  });

  const ctx = await browser.newContext({
    ...iphone,
    userAgent: iphone.userAgent + ' TxcSyntheticMonitor/1.0',
  });

  // Keep synthetic traffic out of GA4 (belt and braces).
  await ctx.addInitScript((id) => {
    window['ga-disable-' + id] = true;
    try { localStorage.setItem('txc_internal', '1'); } catch (_) {}
  }, MEASUREMENT_ID);
  await ctx.route(BLOCKED, (route) => route.abort());

  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/ERR_FAILED|google|gtag|gtm/i.test(t)) return; // our own blocked analytics calls
    errors.push('console: ' + t);
  });

  try {
    // 1. Find a real job dynamically
    await page.goto(`${BASE}/jobs`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Support both clickable card div and anchor tags
    const cardOrLink = page.locator('div.rounded-2xl:has-text("Full-time"), [data-testid="job-card"], a[href^="/jobs/"]').first();
    await cardOrLink.waitFor({ state: 'visible', timeout: 20000 });
    
    console.log('Found dynamic job element on /jobs, navigating...');
    await cardOrLink.click();
    await page.waitForURL((url) => url.pathname.includes('/jobs/') && url.pathname !== '/jobs', { timeout: 15000 });

    const jobUrl = page.url();
    console.log(`Navigated to live job: ${jobUrl}`);

    // 2. Open the job as a logged-out mobile user & click Apply Now
    const apply = page.locator('[data-testid="public-job-apply"]').first();
    await apply.waitFor({ state: 'visible', timeout: 15000 });

    // 3. Click and require the guest modal
    await apply.click();
    const modal = page.locator('[role="dialog"]').first();
    await modal.waitFor({ state: 'visible', timeout: 8000 });

    // 4. The Google option must be present
    const google = modal.getByText(/google/i).first();
    await google.waitFor({ state: 'visible', timeout: 3000 });

    if (errors.length) return await alertAndExit(`modal opened but runtime errors: ${errors.join(' | ')}`);
    console.log(`PASSED: ${jobUrl} -> Apply Now opened guest modal with no runtime errors`);
  } catch (e) {
    await page.screenshot({ path: 'smoke-failure.png', fullPage: true }).catch(() => {});
    await alertAndExit(`${e.message}${errors.length ? ' | errors: ' + errors.join(' | ') : ''}`);
  } finally {
    await browser.close();
  }
})();
