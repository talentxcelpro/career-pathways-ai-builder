/**
 * UDX Universal Discovery & Intelligence OS v3.0 — Reality Engine
 * Runtime Trace CJS Runner
 */

const { spawnSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'run-udx-runtime-trace.ts');

const result = spawnSync('npx', ['tsx', scriptPath], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..'),
});

process.exit(result.status ?? 0);
