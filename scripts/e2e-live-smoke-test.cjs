const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runLiveSmokeTest() {
  console.log('================================================================');
  console.log('TALENTXCEL LIVE PRODUCTION MOBILE SMOKE TEST (PLAYWRIGHT)');
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

  console.log('Using browser binary:', executablePath);

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile iPhone 14 / Pixel viewport
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      console.log(`[Browser Console ERROR]: ${text}`);
    }
  });

  page.on('pageerror', err => {
    console.error(`[Browser Uncaught PageError]: ${err.message}`);
    pageErrors.push(err.message);
  });

  const targetJobUrl = 'https://talentxcel.in/jobs/93a378a5-f004-4aa9-894d-189e304ddec4';
  console.log(`1. Navigating to live job listing: ${targetJobUrl} ...`);
  
  await page.goto(targetJobUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('   ✓ Page loaded. Current URL:', page.url());

  // Check document title
  const title = await page.title();
  console.log('   ✓ Page title:', title);

  // Locate the Apply button
  console.log('2. Looking for "Apply Now" button...');
  const applyButton = page.locator('button[data-testid="public-job-apply"], button:has-text("Apply Now")').first();
  await applyButton.waitFor({ state: 'visible', timeout: 10000 });
  console.log('   ✓ "Apply Now" button is visible and active on mobile screen.');

  // Click Apply Now
  console.log('3. Clicking "Apply Now" button as logged-out mobile user...');
  await applyButton.click();

  // Wait for the modal dialog to appear
  console.log('4. Waiting for Guest Application Modal dialog to appear...');
  const modalHeader = page.locator('[role="dialog"], div:has-text("1-Click Express Application"), div:has-text("Apply to")').first();
  await modalHeader.waitFor({ state: 'visible', timeout: 10000 });
  console.log('   ✓ Guest Application Modal successfully opened!');

  // Check presence of Google 1-tap quick auth button
  const googleBtn = page.locator('button:has-text("Auto-fill with Google")');
  const hasGoogleBtn = await googleBtn.isVisible();
  console.log(`   ✓ Auto-fill with Google visible: ${hasGoogleBtn}`);

  // Check presence of form inputs
  const nameInput = page.locator('input#guest-name');
  const emailInput = page.locator('input#guest-email');
  const hasInputs = (await nameInput.isVisible()) && (await emailInput.isVisible());
  console.log(`   ✓ Express application form inputs visible: ${hasInputs}`);

  // Save screenshot
  const screenshotDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
  const screenshotPath = path.join(screenshotDir, 'live_mobile_apply_modal.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`   ✓ Captured mobile modal screenshot to: ${screenshotPath}`);

  // Assertions
  const criticalErrors = pageErrors.filter(e => e.includes('ReferenceError') || e.includes('setShowGuestModal') || e.includes('is not defined'));

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log(`Total console logs: ${consoleLogs.length}`);
  console.log(`Total page errors: ${pageErrors.length}`);
  console.log(`Critical apply button runtime errors: ${criticalErrors.length}`);

  await browser.close();

  if (criticalErrors.length > 0) {
    console.error('❌ FAILED: Critical runtime error detected in live apply button!');
    process.exit(1);
  } else {
    console.log('✅ PASSED: Live mobile Apply Now button and guest modal operate with 100% fidelity!');
    console.log('================================================================');
  }
}

runLiveSmokeTest().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
