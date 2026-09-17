#!/usr/bin/env node
/**
 * CJS wrapper — UDX World Challenge v4
 * Usage: node scripts/run-udx-world-challenge-v4.cjs
 */
require('child_process').execSync(
  'npx tsx scripts/run-udx-world-challenge-v4.ts',
  { stdio: 'inherit', cwd: process.cwd() }
);
