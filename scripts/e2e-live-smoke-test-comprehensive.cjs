const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runComprehensiveSmoke() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  // TEST 1: Referral shortlink check
  console.log('\n--- TEST 1: Referral Shortlink (/r/AMBASSADOR99) ---');
  const page1 = await context.newPage();
  try {
    const res = await page1.goto('https://talentxcel.in/r/AMBASSADOR99', { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log('Final URL after shortlink redirect:', page1.url());
    console.log('HTTP Status:', res.status());
    const storedCode = await page1.evaluate(() => localStorage.getItem('txc_referral_code'));
    console.log('localStorage txc_referral_code:', storedCode);
  } catch (err) {
    console.error('Shortlink test notice:', err.message);
  } finally {
    await page1.close();
  }

  // TEST 2: Peer endorsement check
  console.log('\n--- TEST 2: Peer Endorsement (/verify/arshid_wani) ---');
  const page2 = await context.newPage();
  try {
    const res = await page2.goto('https://talentxcel.in/verify/arshid_wani', { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log('Endorsement page URL:', page2.url());
    console.log('HTTP Status:', res.status());
    const title = await page2.title();
    console.log('Title:', title);
    const hasForm = await page2.locator('form, button:has-text("Endorse")').first().isVisible().catch(() => false);
    console.log('Has endorsement form:', hasForm);
  } catch (err) {
    console.error('Endorsement test notice:', err.message);
  } finally {
    await page2.close();
  }

  await browser.close();
}

runComprehensiveSmoke().catch(console.error);
