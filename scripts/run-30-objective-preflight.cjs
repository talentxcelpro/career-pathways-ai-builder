/**
 * UDX v3.2 Stratified 30-Objective Preflight Runner (CJS Wrapper)
 */

const { spawnSync } = require('child_process');
const path = require('path');

const targetScript = path.resolve(__dirname, 'run-30-objective-preflight.ts');
const res = spawnSync('npx', ['tsx', targetScript], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

process.exit(res.status || 0);
