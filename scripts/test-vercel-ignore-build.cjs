// ==============================================================================
// Unit Test Suite for Vercel Ignore Build Step
// Script: scripts/test-vercel-ignore-build.cjs
// ==============================================================================

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const scriptPath = path.resolve(__dirname, 'vercel-ignore-build.cjs');

function runTest(testName, env, setupGitFn) {
  process.stdout.write(`Testing: ${testName.padEnd(55)} ... `);
  
  // Create temporary git repo to test exact git scenarios
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'txc-ignore-test-'));
  try {
    execSync('git init -b main', { cwd: tmpDir, stdio: 'ignore' });
    execSync('git config user.email "test@talentxcel.in"', { cwd: tmpDir, stdio: 'ignore' });
    execSync('git config user.name "Test Runner"', { cwd: tmpDir, stdio: 'ignore' });

    // Initial commit
    fs.writeFileSync(path.join(tmpDir, 'README.md'), '# Initial Commit');
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{"name":"test"}');
    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'src/App.tsx'), 'export const App = () => null;');
    execSync('git add . && git commit -m "initial commit"', { cwd: tmpDir, stdio: 'ignore' });

    const initialSha = execSync('git rev-parse HEAD', { cwd: tmpDir, encoding: 'utf8' }).trim();

    // Run custom setup for this test
    const targetSha = setupGitFn(tmpDir, initialSha);

    const testEnv = {
      ...process.env,
      VERCEL_GIT_COMMIT_SHA: targetSha || 'HEAD',
      VERCEL_GIT_PREVIOUS_SHA: initialSha,
      ...env
    };

    const res = spawnSync('node', [scriptPath], {
      cwd: tmpDir,
      env: testEnv,
      encoding: 'utf8'
    });

    return {
      status: res.status,
      stdout: res.stdout,
      stderr: res.stderr,
      tmpDir
    };
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch(e) {}
  }
}

console.log('=================================================================');
console.log('VERCEL FINOPS IGNORE-BUILD TEST SUITE (8 MANDATORY CHECKS)');
console.log('=================================================================\n');

let allPassed = true;

// Test 1: Documentation-only commit — build skipped (exit 0)
{
  const res = runTest('1. Documentation-only commit (exit 0 expected)', {}, (dir) => {
    fs.mkdirSync(path.join(dir, 'docs/infrastructure'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs/infrastructure/REPORT.md'), '# Audit Report');
    fs.writeFileSync(path.join(dir, 'README.md'), '# Updated Readme');
    execSync('git add . && git commit -m "docs: add report"', { cwd: dir, stdio: 'ignore' });
    return execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim();
  });
  if (res.status === 0) {
    console.log('PASS (Exit 0 - Build Skipped)');
  } else {
    console.log(`FAIL (Exit ${res.status})`);
    allPassed = false;
  }
}

// Test 2: Application source change — build proceeds (exit 1)
{
  const res = runTest('2. Application source change (exit 1 expected)', {}, (dir) => {
    fs.writeFileSync(path.join(dir, 'src/App.tsx'), 'export const App = () => <div>Hello</div>;');
    execSync('git add . && git commit -m "feat: update App"', { cwd: dir, stdio: 'ignore' });
    return execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim();
  });
  if (res.status === 1) {
    console.log('PASS (Exit 1 - Build Proceeds)');
  } else {
    console.log(`FAIL (Exit ${res.status})`);
    allPassed = false;
  }
}

// Test 3: SEO script change — build proceeds (exit 1)
{
  const res = runTest('3. SEO script change (exit 1 expected)', {}, (dir) => {
    fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'scripts/seo-ci-gate.ts'), '// update check');
    execSync('git add . && git commit -m "fix(seo): update gate"', { cwd: dir, stdio: 'ignore' });
    return execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim();
  });
  if (res.status === 1) {
    console.log('PASS (Exit 1 - Build Proceeds)');
  } else {
    console.log(`FAIL (Exit ${res.status})`);
    allPassed = false;
  }
}

// Test 4: Package or lockfile change — build proceeds (exit 1)
{
  const res = runTest('4. Package or lockfile change (exit 1 expected)', {}, (dir) => {
    fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"test","version":"1.0.1"}');
    execSync('git add . && git commit -m "chore: bump package"', { cwd: dir, stdio: 'ignore' });
    return execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim();
  });
  if (res.status === 1) {
    console.log('PASS (Exit 1 - Build Proceeds)');
  } else {
    console.log(`FAIL (Exit ${res.status})`);
    allPassed = false;
  }
}

// Test 5: Vercel configuration change — build proceeds (exit 1)
{
  const res = runTest('5. Vercel configuration change (exit 1 expected)', {}, (dir) => {
    fs.writeFileSync(path.join(dir, 'vercel.json'), '{"trailingSlash": false}');
    execSync('git add . && git commit -m "chore: add vercel.json"', { cwd: dir, stdio: 'ignore' });
    return execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim();
  });
  if (res.status === 1) {
    console.log('PASS (Exit 1 - Build Proceeds)');
  } else {
    console.log(`FAIL (Exit ${res.status})`);
    allPassed = false;
  }
}

// Test 6: Mixed documentation and application changes — build proceeds (exit 1)
{
  const res = runTest('6. Mixed doc + code changes (exit 1 expected)', {}, (dir) => {
    fs.writeFileSync(path.join(dir, 'README.md'), '# Doc update');
    fs.writeFileSync(path.join(dir, 'src/App.tsx'), 'export const App = () => <span>Mixed</span>;');
    execSync('git add . && git commit -m "feat: doc and code"', { cwd: dir, stdio: 'ignore' });
    return execSync('git rev-parse HEAD', { cwd: dir, encoding: 'utf8' }).trim();
  });
  if (res.status === 1) {
    console.log('PASS (Exit 1 - Build Proceeds)');
  } else {
    console.log(`FAIL (Exit ${res.status})`);
    allPassed = false;
  }
}

// Test 7: Missing Git history / initial commit — build proceeds (exit 1)
{
  const res = runTest('7. Missing Git history / initial commit (exit 1 expected)', { VERCEL_GIT_PREVIOUS_SHA: '', VERCEL_GIT_COMMIT_SHA: 'invalid_sha_123' }, () => {
    return 'invalid_sha_123';
  });
  if (res.status === 1) {
    console.log('PASS (Exit 1 - Build Proceeds)');
  } else {
    console.log(`FAIL (Exit ${res.status})`);
    allPassed = false;
  }
}

// Test 8: Git command failure / corrupt ref — build proceeds (exit 1)
{
  const res = runTest('8. Git command failure / corrupt ref (exit 1 expected)', { VERCEL_GIT_PREVIOUS_SHA: '0000000000000000000000000000000000000000', VERCEL_GIT_COMMIT_SHA: 'deadbeef' }, () => {
    return 'deadbeef';
  });
  if (res.status === 1) {
    console.log('PASS (Exit 1 - Build Proceeds)');
  } else {
    console.log(`FAIL (Exit ${res.status})`);
    allPassed = false;
  }
}

console.log('\n=================================================================');
console.log(`VERCEL FINOPS IGNORE-BUILD TEST RESULT: ${allPassed ? 'ALL 8 TESTS PASSED (100%)' : 'FAILURES DETECTED'}`);
console.log('=================================================================');

if (!allPassed) process.exit(1);
