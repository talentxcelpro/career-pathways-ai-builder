#!/usr/bin/env node
/**
 * CJS wrapper — UDX v3.3 Comparator Qualification Suite
 * Usage: node scripts/run-comparator-qualification.cjs
 */
require('child_process').execSync(
  'npx tsx scripts/run-comparator-qualification.ts',
  { stdio: 'inherit', cwd: process.cwd() }
);
