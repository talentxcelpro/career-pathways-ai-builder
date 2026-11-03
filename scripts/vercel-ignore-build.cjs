#!/usr/bin/env node
// ==============================================================================
// TalentXcel Vercel FinOps Ignore Build Step (Node.js Implementation)
// Script: scripts/vercel-ignore-build.cjs
// Mission: TXC-SI-FINOPS-002 (Stage 9.4)
//
// VERCEL EXIT CODE CONTRACT:
// - process.exit(0): CANCEL / SKIP the build (Conserves 5.2 Build CPU minutes)
// - process.exit(1): PROCEED with the build (Runs full build pipeline)
//
// FAIL-SAFE PRINCIPLE:
// Any error, missing variable, unrecognized file, or git command failure MUST
// exit with code 1 (PROCEED) to ensure zero silent deployment failures.
// ==============================================================================

const { execSync } = require('child_process');

function log(msg) {
  console.log(`[vercel-ignore-build] ${msg}`);
}

function run() {
  console.log('=================================================================');
  console.log('🛡️  TALENTXCEL VERCEL FINOPS: IGNORE BUILD STEP AUDIT');
  console.log('=================================================================');

  const headSha = process.env.VERCEL_GIT_COMMIT_SHA || 'HEAD';
  const prevSha = process.env.VERCEL_GIT_PREVIOUS_SHA || '';

  log(`Target commit: ${headSha}`);
  if (prevSha) log(`Previous commit: ${prevSha}`);

  // Step 1: Determine base commit
  let baseRef = '';

  if (prevSha && prevSha !== '0000000000000000000000000000000000000000') {
    try {
      execSync(`git cat-file -e "${prevSha}^{commit}"`, { stdio: 'ignore' });
      baseRef = prevSha;
    } catch (e) {
      // previous sha not in local shallow clone
    }
  }

  if (!baseRef) {
    try {
      execSync(`git rev-parse --verify "${headSha}^"`, { stdio: 'ignore' });
      baseRef = `${headSha}^`;
    } catch (e) {
      log(`No parent commit found for ${headSha} (shallow clone or initial commit).`);
      log('➡️ Proceeding with build for safety (Exit 1).');
      process.exit(1);
    }
  }

  log(`Comparing diff: ${baseRef} ... ${headSha}`);

  // Step 2: Extract changed files
  let changedFilesRaw = '';
  try {
    changedFilesRaw = execSync(`git diff --name-only "${baseRef}" "${headSha}"`, { encoding: 'utf8' });
  } catch (err) {
    log(`⚠️ git diff command failed: ${err.message}`);
    log('➡️ Proceeding with build for safety (Exit 1).');
    process.exit(1);
  }

  const changedFiles = changedFilesRaw.trim().split('\n').map(f => f.trim()).filter(Boolean);
  if (changedFiles.length === 0) {
    log('⚠️ No changed files detected in diff. Proceeding with build (Exit 1).');
    process.exit(1);
  }

  // Step 3: Classify changed files
  let docsOnlyCount = 0;

  for (const file of changedFiles) {
    // 1. Critical Application Files (MUST ALWAYS BUILD)
    if (
      file.startsWith('src/') ||
      file.startsWith('public/') ||
      file.startsWith('api/') ||
      file.startsWith('supabase/') ||
      file.startsWith('scripts/') ||
      file.startsWith('.github/')
    ) {
      log(`Critical application/infrastructure path modified: '${file}'`);
      log('🚀 PROCEEDING WITH BUILD (Exit 1)');
      process.exit(1);
    }

    if (
      file === 'package.json' ||
      file === 'package-lock.json' ||
      file === 'pnpm-lock.yaml' ||
      file === 'yarn.lock' ||
      file === 'bun.lockb'
    ) {
      log(`Dependency manifest modified: '${file}'`);
      log('🚀 PROCEEDING WITH BUILD (Exit 1)');
      process.exit(1);
    }

    if (
      file === 'vercel.json' ||
      file.startsWith('vite.config.') ||
      file.startsWith('tsconfig') ||
      file.startsWith('tailwind.config.') ||
      file.startsWith('postcss.config.') ||
      file === 'index.html'
    ) {
      log(`Core build configuration modified: '${file}'`);
      log('🚀 PROCEEDING WITH BUILD (Exit 1)');
      process.exit(1);
    }

    // Check code extensions outside docs/reports
    if (/\.(ts|tsx|js|jsx|cjs|mjs|sql|json|css|html)$/i.test(file)) {
      if (!file.startsWith('docs/') && !file.startsWith('reports/')) {
        log(`Code asset modified: '${file}'`);
        log('🚀 PROCEEDING WITH BUILD (Exit 1)');
        process.exit(1);
      }
    }

    // 2. Whitelisted Documentation Paths
    if (
      file.startsWith('docs/') ||
      file.startsWith('reports/') ||
      file.startsWith('scratch/') ||
      file.startsWith('.system_generated/') ||
      /\.(md|markdown)$/i.test(file) ||
      file === 'LICENSE' ||
      file.startsWith('CHANGELOG') ||
      file.startsWith('CONTRIBUTING')
    ) {
      docsOnlyCount++;
      continue;
    }

    // Any unclassified file defaults to PROCEED
    log(`Unclassified file modified: '${file}'`);
    log('🚀 PROCEEDING WITH BUILD for safety (Exit 1)');
    process.exit(1);
  }

  // Step 4: Final verification
  if (changedFiles.length > 0 && docsOnlyCount === changedFiles.length) {
    log(`✅ All ${changedFiles.length} changed file(s) are documentation/reports.`);
    log('🛑 SKIPPING VERCEL BUILD (Exit 0) — Conserving 5.2 Build CPU minutes!');
    process.exit(0);
  }

  log('➡️ Diff contains mixed or non-doc files. Proceeding with build (Exit 1).');
  process.exit(1);
}

run();
