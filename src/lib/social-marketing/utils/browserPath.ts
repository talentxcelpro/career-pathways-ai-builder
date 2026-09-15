// src/lib/social-marketing/utils/browserPath.ts
// Browser-safe fallback shim for Node 'path' module.

export function normalize(p: string): string {
  return p.replace(/\\/g, '/');
}

export function join(...parts: string[]): string {
  return parts
    .map(p => normalize(p))
    .join('/')
    .replace(/\/+/g, '/');
}

export function resolve(...parts: string[]): string {
  return join(...parts);
}

export function dirname(p: string): string {
  const norm = normalize(p);
  const lastSlash = norm.lastIndexOf('/');
  if (lastSlash === -1) return '.';
  return norm.slice(0, lastSlash) || '/';
}

export function basename(p: string, ext?: string): string {
  const norm = normalize(p);
  const lastSlash = norm.lastIndexOf('/');
  let base = lastSlash === -1 ? norm : norm.slice(lastSlash + 1);
  if (ext && base.endsWith(ext)) {
    base = base.slice(0, -ext.length);
  }
  return base;
}

export function extname(p: string): string {
  const norm = normalize(p);
  const lastDot = norm.lastIndexOf('.');
  const lastSlash = norm.lastIndexOf('/');
  if (lastDot === -1 || lastDot < lastSlash) return '';
  return norm.slice(lastDot);
}

export const posix = { join, resolve, dirname, basename, extname, normalize };
export const win32 = { join, resolve, dirname, basename, extname, normalize };

const defaultPath = {
  join,
  resolve,
  dirname,
  basename,
  extname,
  normalize,
  posix,
  win32,
};

export default defaultPath;
