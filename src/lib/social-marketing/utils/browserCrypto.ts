// src/lib/social-marketing/utils/browserCrypto.ts
// Browser-safe fallback shim for Node 'crypto' module.
import { computeSha256 } from './cryptoUtils';

export function createHash(algorithm: string) {
  let buffer = '';
  return {
    update(data: string | Uint8Array | Buffer) {
      if (typeof data === 'string') {
        buffer += data;
      } else {
        buffer += String(data);
      }
      return this;
    },
    digest(encoding?: string) {
      const hex = computeSha256(buffer);
      if (encoding === 'hex' || !encoding) {
        return hex;
      }
      return hex;
    }
  };
}

export function randomUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const defaultCrypto = {
  createHash,
  randomUUID,
};

export default defaultCrypto;
