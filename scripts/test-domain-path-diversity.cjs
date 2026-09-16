/**
 * UDX Universal Discovery & Intelligence OS v3.0 — Reality Engine
 * Domain Path Diversity Runner
 * 
 * Invokes the TypeScript diversity suite via tsx.
 */

const { spawnSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'test-domain-path-diversity.ts');

const result = spawnSync('npx', ['tsx', scriptPath], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..'),
});

process.exit(result.status ?? 0);
