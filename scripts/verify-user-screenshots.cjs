const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'user_verification_screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const routesToTest = [
  { name: 'pricing', url: 'http://localhost:8080/pricing' },
  { name: 'communication', url: 'http://localhost:8080/communication' },
  { name: 'profile_lifeislove', url: 'http://localhost:8080/profile/lifeislove83934f40a0' },
  { name: 'passport', url: 'http://localhost:8080/passport' },
  { name: 'network_connections', url: 'http://localhost:8080/network?tab=connections' },
  { name: 'gamification', url: 'http://localhost:8080/gamification' },
  { name: 'skill_swap', url: 'http://localhost:8080/network/skill-swap' }
];

async function captureRoute(route) {
  const screenshotPath = path.join(OUTPUT_DIR, `${route.name}.png`);
  const domPath = path.join(OUTPUT_DIR, `${route.name}.dom.html`);

  return new Promise((resolve) => {
    console.log(`\nTesting ${route.name} (${route.url})...`);
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1280,800',
      '--virtual-time-budget=8000',
      `--screenshot=${screenshotPath}`,
      `--dump-dom`,
      route.url
    ];

    const proc = spawn(CHROME_PATH, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      fs.writeFileSync(domPath, stdout, 'utf8');
      
      const hasSomethingWentWrong = stdout.includes('Something went wrong') || stdout.includes('cannot convert object to primitive value') || stdout.includes('Invalid time value');
      const hasErrorText = stdout.includes('Profile Under Synchronization');
      const screenshotSize = fs.existsSync(screenshotPath) ? fs.statSync(screenshotPath).size : 0;

      console.log(`Result for ${route.name}:`);
      console.log(`  - Screenshot size: ${screenshotSize} bytes`);
      console.log(`  - Crash screen (Something went wrong): ${hasSomethingWentWrong ? 'YES (CRASH)' : 'NO (CLEAN)'}`);
      if (route.name === 'profile_lifeislove') {
        console.log(`  - Profile Under Synchronization: ${hasErrorText ? 'YES (NOT FOUND)' : 'NO (LOADED)'}`);
      }

      resolve({
        name: route.name,
        hasSomethingWentWrong,
        hasErrorText,
        screenshotSize
      });
    });
  });
}

async function run() {
  console.log('=== VERIFYING RECENT FIXES AGAINST CURRENT DEV SERVER ===');
  const results = [];
  for (const r of routesToTest) {
    results.push(await captureRoute(r));
  }
  console.log('\n=== SUMMARY ===');
  console.table(results);
}

run();
