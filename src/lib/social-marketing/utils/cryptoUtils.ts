// src/lib/social-marketing/utils/cryptoUtils.ts
// Pure TypeScript deterministic SHA-256 implementation (FIPS PUB 180-4)
// Zero external dependencies. Works identically in Node.js, browsers, and edge runtimes.
// Eliminates "crypto is not exported by __vite-browser-external" Rollup bundling errors.

/**
 * Computes standard SHA-256 hash in hexadecimal format (64 characters)
 */
export function computeSha256(input: string | Uint8Array | Buffer | number[]): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    if (typeof TextEncoder !== 'undefined') {
      bytes = new TextEncoder().encode(input);
    } else {
      const b: number[] = [];
      for (let i = 0; i < input.length; i++) {
        let code = input.charCodeAt(i);
        if (code < 0x80) {
          b.push(code);
        } else if (code < 0x800) {
          b.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
        } else if (code < 0xd800 || code >= 0xe000) {
          b.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        } else {
          i++;
          code = 0x10000 + (((code & 0x3ff) << 10) | (input.charCodeAt(i) & 0x3ff));
          b.push(
            0xf0 | (code >> 18),
            0x80 | ((code >> 12) & 0x3f),
            0x80 | ((code >> 6) & 0x3f),
            0x80 | (code & 0x3f)
          );
        }
      }
      bytes = new Uint8Array(b);
    }
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else if (Array.isArray(input)) {
    bytes = new Uint8Array(input);
  } else {
    bytes = new Uint8Array(input as any);
  }

  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number;
  let j: number;
  let result = '';
  const words: number[] = [];
  const byteLength = bytes.length;
  const bitLength = byteLength * 8;
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  // Pre-processing
  for (i = 0; i < byteLength; i++) {
    words[i >> 2] |= bytes[i] << ((3 - (i % 4)) * 8);
  }
  words[byteLength >> 2] |= 0x80 << ((3 - (byteLength % 4)) * 8);

  const totalWords = (((byteLength + 8) >> 6) + 1) * 16;
  for (i = (byteLength >> 2) + 1; i < totalWords; i++) {
    words[i] = words[i] || 0;
  }
  words[totalWords - 1] = bitLength;
  words[totalWords - 2] = Math.floor(bitLength / maxWord);

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & hash[5]) ^ (~e & hash[6]);
      const temp1 =
        (hash[7] +
          s1 +
          ch +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  w[i - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0)) |
        0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0 + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >>> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Computes a prefixed SHA-256 string (e.g. `sha256:abcd...`)
 */
export function computeSha256Prefixed(
  input: string | Uint8Array | Buffer | number[],
  prefix = 'sha256:'
): string {
  return `${prefix}${computeSha256(input)}`;
}
