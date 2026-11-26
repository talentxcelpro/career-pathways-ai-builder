// src/lib/seo/demandIntelligence/normalizer.ts
// Fast deterministic normalization, regional variant preservation, spam/PII rejection, and fingerprinting.

import type { NormalizedKeywordResult } from './types';

const INVALID_SPAM_PATTERNS: RegExp[] = [
  /https?:\/\//i,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b\d{10,16}\b/, // Long phone / card numbers
  /[<>{}[\]]/,
];

// Preserved deliberately in normalized text so UK "cv", India "fresher", "noida", etc. are never merged destructively.
const REGIONAL_STOPWORDS_TO_REMOVE = new Set([
  'the',
  'a',
  'an',
  'of',
  'for',
  'to',
  'and',
  'or',
  'with',
  'near',
]);

const MODIFIER_SYNONYMS: ReadonlyArray<[RegExp, string]> = [
  [/\bwfh\b/g, 'work from home'],
  [/\bfulltime\b/g, 'full time'],
  [/\bparttime\b/g, 'part time'],
  [/\bcyber security\b/g, 'cybersecurity'],
  [/\bfullstack\b/g, 'full stack'],
  [/\bfront end\b/g, 'frontend'],
  [/\bback end\b/g, 'backend'],
  [/\bbengaluru\b/g, 'bengaluru'],
];

/**
 * Deterministic 128-bit FNV-1a hex fingerprint using 32-bit Math.imul (zero BigInt GC pressure).
 */
export function computeKeywordFingerprint(normalizedText: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  let h3 = 0x85ebca6b;
  let h4 = 0xc2b2ae35;

  for (let i = 0; i < normalizedText.length; i += 1) {
    const code = normalizedText.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (code + i), 0x01000193) >>> 0;
    h3 = Math.imul(h3 ^ (code ^ 0x5a), 0x85ebca6b) >>> 0;
    h4 = Math.imul(h4 ^ ((code << 3) + i), 0xc2b2ae35) >>> 0;
  }

  return (
    h1.toString(16).padStart(8, '0') +
    h2.toString(16).padStart(8, '0') +
    h3.toString(16).padStart(8, '0') +
    h4.toString(16).padStart(8, '0')
  );
}

/**
 * Normalizes a candidate or GSC search query without stripping meaningful regional tokens
 * (keeps fresher, graduate, trainee, CV vs resume, India/UK/US/UAE geo distinctions).
 */
export function normalizeKeyword(rawInput: string): NormalizedKeywordResult {
  const rawKeyword = (rawInput || '').trim();
  if (!rawKeyword || rawKeyword.length < 2) {
    return {
      rawKeyword,
      normalizedKeyword: '',
      dedupKey: '',
      keywordHash: '',
      tokens: [],
      isValid: false,
      invalidReason: 'EMPTY_OR_TOO_SHORT',
    };
  }

  if (rawKeyword.length > 220) {
    return {
      rawKeyword,
      normalizedKeyword: '',
      dedupKey: '',
      keywordHash: '',
      tokens: [],
      isValid: false,
      invalidReason: 'EXCEEDS_MAX_LENGTH',
    };
  }

  for (const pattern of INVALID_SPAM_PATTERNS) {
    if (pattern.test(rawKeyword)) {
      return {
        rawKeyword,
        normalizedKeyword: '',
        dedupKey: '',
        keywordHash: '',
        tokens: [],
        isValid: false,
        invalidReason: 'CONTAINS_URL_EMAIL_PII_OR_MARKUP',
      };
    }
  }

  let cleaned = rawKeyword
    .normalize('NFKC')
    .toLowerCase()
    .replace(/['"`]/g, '')
    .replace(/[|/\\,;:+!?()&]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const [rx, replacement] of MODIFIER_SYNONYMS) {
    cleaned = cleaned.replace(rx, replacement);
  }
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  if (!cleaned || !/[a-z0-9\u0900-\u097f]/i.test(cleaned)) {
    return {
      rawKeyword,
      normalizedKeyword: '',
      dedupKey: '',
      keywordHash: '',
      tokens: [],
      isValid: false,
      invalidReason: 'NON_ALPHANUMERIC',
    };
  }

  const rawTokens = cleaned.split(' ').filter(Boolean);
  const seenTokens = new Set<string>();
  const orderedTokens: string[] = [];

  for (const tok of rawTokens) {
    if (!seenTokens.has(tok)) {
      seenTokens.add(tok);
      orderedTokens.push(tok);
    }
  }

  // Dedup key drops neutral prepositions (`in`, `at`, `for`) ONLY when token order invariance matches duplicates,
  // while preserving `cv` vs `resume`, `fresher` vs `graduate`, `india`, `bengaluru`, `remote`, etc.
  const coreTokens = orderedTokens.filter((t) => t !== 'in' && t !== 'at' && !REGIONAL_STOPWORDS_TO_REMOVE.has(t));
  const dedupKey = (coreTokens.length > 0 ? coreTokens : orderedTokens).join(' ');
  const keywordHash = computeKeywordFingerprint(cleaned);

  return {
    rawKeyword,
    normalizedKeyword: cleaned,
    dedupKey,
    keywordHash,
    tokens: orderedTokens,
    isValid: true,
  };
}

export function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
