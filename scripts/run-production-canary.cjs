/**
 * UDX Universal Discovery & Intelligence OS v3.0 — Reality Engine
 * Production Canary CJS Runner
 * 
 * Invokes the TypeScript canary suite via tsx / child_process.
 */

const { spawnSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'run-production-canary.ts');

const result = spawnSync('npx', ['tsx', scriptPath], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..'),
});

process.exit(result.status ?? 0);
