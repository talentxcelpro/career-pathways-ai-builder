// src/lib/social-marketing/utils/browserFs.ts
// Browser-safe fallback shim for Node 'fs' module.
// Allows Vite/Rollup to bundle without failing on missing Node runtime.

const memoryStorage = new Map<string, string | Uint8Array>();

export function existsSync(filePath: string): boolean {
  return memoryStorage.has(filePath);
}

export function mkdirSync(dirPath: string, options?: any): void {
  // Browser no-op
}

export function writeFileSync(filePath: string, data: any, options?: any): void {
  memoryStorage.set(filePath, data);
}

export function readFileSync(filePath: string, encoding?: any): any {
  return memoryStorage.get(filePath) || '';
}

export function readdirSync(dirPath: string): string[] {
  const prefix = dirPath.endsWith('/') || dirPath.endsWith('\\') ? dirPath : dirPath + '/';
  const results = new Set<string>();
  for (const k of memoryStorage.keys()) {
    if (k.startsWith(prefix)) {
      const rest = k.slice(prefix.length);
      const firstSegment = rest.split(/[/\\]/)[0];
      if (firstSegment) results.add(firstSegment);
    }
  }
  return Array.from(results);
}

export function statSync(filePath: string): { size: number; mtime: Date; isFile: () => boolean; isDirectory: () => boolean } {
  const item = memoryStorage.get(filePath);
  const size = item ? (typeof item === 'string' ? item.length : (item as any).byteLength || 0) : 0;
  return {
    size,
    mtime: new Date(),
    isFile: () => true,
    isDirectory: () => false,
  };
}

export function unlinkSync(filePath: string): void {
  memoryStorage.delete(filePath);
}

export const promises = {
  readFile: async (p: string, enc?: any) => readFileSync(p, enc),
  writeFile: async (p: string, data: any, opts?: any) => writeFileSync(p, data, opts),
  mkdir: async (p: string, opts?: any) => mkdirSync(p, opts),
  readdir: async (p: string) => readdirSync(p),
  stat: async (p: string) => statSync(p),
};

const defaultFs = {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  promises,
};

export default defaultFs;
