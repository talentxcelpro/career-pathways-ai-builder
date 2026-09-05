// src/lib/social-marketing/utils/browserChildProcess.ts
// Browser-safe fallback shim for Node 'child_process' module.

export function execSync(cmd: string, options?: any): Buffer | string {
  console.warn('[browserChildProcess] execSync called in browser context, ignoring:', cmd);
  return typeof Buffer !== 'undefined' ? Buffer.from('') : ('');
}

export function spawn(command: string, args?: any, options?: any): any {
  return {
    on: () => {},
    stdout: { on: () => {} },
    stderr: { on: () => {} },
  };
}

export function execFile(file: string, args?: any, options?: any, callback?: any): any {
  if (typeof callback === 'function') callback(null, '', '');
}

const defaultChildProcess = {
  execSync,
  spawn,
  execFile,
};

export default defaultChildProcess;
