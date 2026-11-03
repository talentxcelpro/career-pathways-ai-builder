#!/usr/bin/env node
// ==============================================================================
// TalentXcel Vercel FinOps: Comprehensive Bash Entry Point Test Harness
// Script: scripts/test-bash-ignore-build.cjs
// Mission: TXC-SI-FINOPS-002 (Stage 9.5)
//
// Verifies bash scripts/vercel-ignore-build.sh against all mandated edge cases:
// 1. Documentation-only commit
// 2. Mixed documentation and application changes
// 3. Deleted application files
// 4. Deleted documentation files
// 5. Renamed files (application & docs)
// 6. Filenames containing spaces
// 7. Missing previous SHA
// 8. Shallow-clone boundaries / Missing parent commit / Initial deployment
// 9. Invalid Git refs
// 10. Git command failures
//
// Confirms 100% parity between Bash and Node.js implementations.
// ==============================================================================

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BASH_PATH = fs.existsSync('C:\\Program Files\\Git\\bin\\bash.exe')
  ? 'C:\\Program Files\\Git\\bin\\bash.exe'
  : 'bash';

const SCRIPT_DIR = path.resolve(__dirname);
const REPO_ROOT = path.resolve(__dirname, '..');
const BASH_SCRIPT = path.join(REPO_ROOT, 'scripts', 'vercel-ignore-build.sh');
const NODE_SCRIPT = path.join(REPO_ROOT, 'scripts', 'vercel-ignore-build.cjs');

console.log('=================================================================');
console.log('🛡️  TALENTXCEL FINOPS: BASH IGNORE BUILD STEP TEST HARNESS (STAGE 9.5)');
console.log('    Bash Engine:', BASH_PATH);
console.log('    Target Bash Script:', BASH_SCRIPT);
console.log('    Target Node Script:', NODE_SCRIPT);
console.log('=================================================================\n');

function runTest(name, setupFn, expectedExit, testOptions = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'txc-bash-ignore-test-'));
  let passed = true;
  let bashExit = -1;
  let nodeExit = -1;
  let detail = '';

  try {
    // 1. Initialize isolated git repo
    execSync('git init -b main', { cwd: tmpDir, stdio: 'ignore' });
    execSync('git config user.name "FinOps Tester"', { cwd: tmpDir, stdio: 'ignore' });
    execSync('git config user.email "finops@talentxcel.in"', { cwd: tmpDir, stdio: 'ignore' });

    // Initial seed commit
    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'src', 'App.tsx'), '// initial app');
    fs.writeFileSync(path.join(tmpDir, 'docs', 'README.md'), '# Initial README');
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{"name":"test"}');

    // Copy ignore scripts into temp repo
    fs.copyFileSync(BASH_SCRIPT, path.join(tmpDir, 'scripts', 'vercel-ignore-build.sh'));
    fs.copyFileSync(NODE_SCRIPT, path.join(tmpDir, 'scripts', 'vercel-ignore-build.cjs'));

    execSync('git add . && git commit -m "initial commit"', { cwd: tmpDir, stdio: 'ignore' });
    const seedSha = execSync('git rev-parse HEAD', { cwd: tmpDir, encoding: 'utf8' }).trim();

    // 2. Run test-specific setup
    const envOverrides = setupFn(tmpDir, seedSha) || {};

    // 3. Execute Bash script
    const bashRes = spawnSync(BASH_PATH, ['scripts/vercel-ignore-build.sh'], {
      cwd: tmpDir,
      env: { ...process.env, ...envOverrides }
    });
    bashExit = bashRes.status;

    // 4. Execute Node.js script (for parity comparison)
    const nodeRes = spawnSync(process.execPath, ['scripts/vercel-ignore-build.cjs'], {
      cwd: tmpDir,
      env: { ...process.env, ...envOverrides }
    });
    nodeExit = nodeRes.status;

    // 5. Assertions
    const bashMatchesExpected = bashExit === expectedExit;
    const parityMatches = bashExit === nodeExit;

    if (bashMatchesExpected && parityMatches) {
      detail = `Exit ${bashExit} (Expected ${expectedExit}) | Node Parity: MATCH`;
    } else {
      passed = false;
      detail = `FAILED! Bash Exit: ${bashExit}, Node Exit: ${nodeExit}, Expected: ${expectedExit}`;
      if (bashRes.stdout) detail += `\nBash stdout: ${bashRes.stdout.toString()}`;
      if (bashRes.stderr) detail += `\nBash stderr: ${bashRes.stderr.toString()}`;
    }
  } catch (err) {
    passed = false;
    detail = `Exception: ${err.message}`;
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}
  }

  const icon = passed ? '✅ PASS' : '❌ FAIL';
  const paddedName = (name + ' '.repeat(55)).slice(0, 55);
  console.log(`${icon}  ${paddedName} -> ${detail}`);
  return passed;
}

const tests = [
  {
    name: '1. Documentation-only commit (Markdown & Docs)',
    expectedExit: 0,
    setup: (tmpDir, seedSha) => {
      fs.writeFileSync(path.join(tmpDir, 'docs', 'STAGE_REPORT.md'), '# Stage Report');
      execSync('git add . && git commit -m "docs: add report"', { cwd: tmpDir, stdio: 'ignore' });
      return { VERCEL_GIT_PREVIOUS_SHA: seedSha };
    }
  },
  {
    name: '2. Mixed documentation and application changes',
    expectedExit: 1,
    setup: (tmpDir, seedSha) => {
      fs.writeFileSync(path.join(tmpDir, 'docs', 'STAGE_REPORT.md'), '# Stage Report');
      fs.writeFileSync(path.join(tmpDir, 'src', 'App.tsx'), '// modified app');
      execSync('git add . && git commit -m "feat: mixed commit"', { cwd: tmpDir, stdio: 'ignore' });
      return { VERCEL_GIT_PREVIOUS_SHA: seedSha };
    }
  },
  {
    name: '3. Application source file deletion',
    expectedExit: 1,
    setup: (tmpDir, seedSha) => {
      fs.unlinkSync(path.join(tmpDir, 'src', 'App.tsx'));
      execSync('git add . && git commit -m "refactor: delete App.tsx"', { cwd: tmpDir, stdio: 'ignore' });
      return { VERCEL_GIT_PREVIOUS_SHA: seedSha };
    }
  },
  {
    name: '4. Documentation file deletion',
    expectedExit: 0,
    setup: (tmpDir, seedSha) => {
      fs.unlinkSync(path.join(tmpDir, 'docs', 'README.md'));
      execSync('git add . && git commit -m "docs: remove outdated README"', { cwd: tmpDir, stdio: 'ignore' });
      return { VERCEL_GIT_PREVIOUS_SHA: seedSha };
    }
  },
  {
    name: '5. Application file rename',
    expectedExit: 1,
    setup: (tmpDir, seedSha) => {
      fs.renameSync(path.join(tmpDir, 'src', 'App.tsx'), path.join(tmpDir, 'src', 'MainApp.tsx'));
      execSync('git add . && git commit -m "refactor: rename App.tsx to MainApp.tsx"', { cwd: tmpDir, stdio: 'ignore' });
      return { VERCEL_GIT_PREVIOUS_SHA: seedSha };
    }
  },
  {
    name: '6. Documentation file rename',
    expectedExit: 0,
    setup: (tmpDir, seedSha) => {
      fs.renameSync(path.join(tmpDir, 'docs', 'README.md'), path.join(tmpDir, 'docs', 'OVERVIEW.md'));
      execSync('git add . && git commit -m "docs: rename README.md to OVERVIEW.md"', { cwd: tmpDir, stdio: 'ignore' });
      return { VERCEL_GIT_PREVIOUS_SHA: seedSha };
    }
  },
  {
    name: '7. Filenames containing spaces (Docs only)',
    expectedExit: 0,
    setup: (tmpDir, seedSha) => {
      fs.writeFileSync(path.join(tmpDir, 'docs', 'TalentXcel Executive Report 2026.md'), '# Executive Report with Spaces');
      execSync('git add . && git commit -m "docs: add report with spaces"', { cwd: tmpDir, stdio: 'ignore' });
      return { VERCEL_GIT_PREVIOUS_SHA: seedSha };
    }
  },
  {
    name: '8. Missing previous SHA (Fallback to HEAD^ safe docs)',
    expectedExit: 0,
    setup: (tmpDir, seedSha) => {
      fs.writeFileSync(path.join(tmpDir, 'docs', 'NOTES.md'), '# Notes');
      execSync('git add . && git commit -m "docs: notes without previous sha"', { cwd: tmpDir, stdio: 'ignore' });
      return { VERCEL_GIT_PREVIOUS_SHA: '' }; // empty previous sha
    }
  },
  {
    name: '9. Shallow-clone boundary / Orphan commit (No parent)',
    expectedExit: 1,
    setup: (tmpDir, seedSha) => {
      // Create orphan commit with no parent
      execSync('git checkout --orphan orphan-branch', { cwd: tmpDir, stdio: 'ignore' });
      fs.writeFileSync(path.join(tmpDir, 'docs', 'ORPHAN.md'), '# Orphan Docs');
      execSync('git add . && git commit -m "orphan initial commit"', { cwd: tmpDir, stdio: 'ignore' });
      return { VERCEL_GIT_PREVIOUS_SHA: '' };
    }
  },
  {
    name: '10. Invalid Git ref in VERCEL_GIT_PREVIOUS_SHA',
    expectedExit: 0, // Should safely fall back to HEAD^ which is docs-only!
    setup: (tmpDir, seedSha) => {
      fs.writeFileSync(path.join(tmpDir, 'docs', 'VALID_DOC.md'), '# Valid Doc');
      execSync('git add . && git commit -m "docs: doc with invalid prev ref"', { cwd: tmpDir, stdio: 'ignore' });
      return { VERCEL_GIT_PREVIOUS_SHA: 'deadbeef00000000000000000000000000000000' }; // invalid sha
    }
  },
  {
    name: '11. Git command failure / Corrupt repo',
    expectedExit: 1,
    setup: (tmpDir, seedSha) => {
      // Simulate broken git repo by corrupting HEAD ref
      fs.writeFileSync(path.join(tmpDir, '.git', 'HEAD'), 'ref: refs/heads/nonexistent-branch-corrupt');
      return { VERCEL_GIT_PREVIOUS_SHA: '' };
    }
  }
];

let allPassed = true;
for (const t of tests) {
  const ok = runTest(t.name, t.setup, t.expectedExit);
  if (!ok) allPassed = false;
}

console.log('\n=================================================================');
if (allPassed) {
  console.log('🎉 ALL 11 BASH IGNORE BUILD TESTS PASSED (100% SUCCESS)');
  console.log('   Confirmed: bash scripts/vercel-ignore-build.sh behaves IDENTICALLY');
  console.log('   to Node.js engine and upholds strict fail-closed safety.');
} else {
  console.error('❌ SOME TESTS FAILED!');
  process.exit(1);
}
console.log('=================================================================\n');
