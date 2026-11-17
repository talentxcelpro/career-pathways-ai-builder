/**
 * src/lib/seo/uniquenessGuard.ts
 *
 * TalentXcel Strict GSC Canonical & Uniqueness Guard (Zero Duplicate Index Bloat)
 * Enforces:
 * 1. Strict self-referencing apex canonical (https://talentxcel.in/<clean-slug>) stripping query params.
 * 2. Complete 8-region hreflang annotations (en-IN, en-AE, en-SA, en-GB, en-DE, en-US, en-CA, x-default).
 * 3. 3-Gate Uniqueness Quality Filter (>= 400 unique words, >= 3 live backed entities, < 75% pairwise similarity).
 */

export interface HreflangAnnotation {
  lang: string;
  href: string;
}

export interface CanonicalAndHreflangResult {
  canonicalUrl: string;
  hreflangTags: HreflangAnnotation[];
}

export interface UniquenessEvaluationResult {
  canIndex: boolean;
  robotsDirective: 'index, follow' | 'noindex, follow';
  wordCount: number;
  liveEntitiesCount: number;
  similarityHash: string;
  reason: string;
}

/**
 * Normalizes any route path into a clean, canonical URL on apex https://talentxcel.in
 * Strips all query parameters (?utm, ?ref, ?tab, ?page) and trailing slashes.
 */
export function buildCanonicalUrl(rawPathOrUrl: string): string {
  if (!rawPathOrUrl) return 'https://talentxcel.in/';
  
  let path = rawPathOrUrl;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const parsed = new URL(path);
      path = parsed.pathname;
    } catch {
      path = path.replace(/^https?:\/\/[^/]+/i, '');
    }
  }

  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '';
  const normalized = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  return `https://talentxcel.in${normalized === '/' ? '' : normalized}`;
}

/**
 * Generates valid regional hreflang annotations for global multi-currency routes
 */
export function buildHreflangTags(cleanPath: string): HreflangAnnotation[] {
  const canonical = buildCanonicalUrl(cleanPath);
  
  return [
    { lang: 'en-IN', href: canonical },
    { lang: 'en-AE', href: canonical },
    { lang: 'en-SA', href: canonical },
    { lang: 'en-GB', href: canonical },
    { lang: 'en-DE', href: canonical },
    { lang: 'en-US', href: canonical },
    { lang: 'en-CA', href: canonical },
    { lang: 'x-default', href: canonical },
  ];
}

/**
 * Deterministic fast 64-bit rolling hash for pairwise content similarity detection.
 * Universal implementation compatible with Vercel Edge Runtime, Node.js, and browser.
 */
export function computeContentHash(content: string): string {
  if (!content) return '';
  // Normalize whitespace and strip dynamic timestamps/dates
  const normalized = content
    .toLowerCase()
    .replace(/\b(20\d\d[-/]\d\d[-/]\d\d|\d{1,2}\s+[a-z]{3,}\s+20\d\d)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

/**
 * Approximate Jaccard similarity between two token sets
 */
export function computeTokenSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  const tokensA = new Set(textA.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const tokensB = new Set(textB.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  
  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }
  
  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : (intersection / union);
}

/**
 * 3-Gate Quality & Uniqueness Gate
 * Evaluates whether a programmatic SEO URL qualifies for index, follow
 */
export function evaluateCanIndex(params: {
  path: string;
  wordCount: number;
  liveEntitiesCount: number;
  contentText?: string;
  siblingContentText?: string;
  isExpiredOrClosed?: boolean;
}): UniquenessEvaluationResult {
  const { path, wordCount, liveEntitiesCount, contentText = '', siblingContentText, isExpiredOrClosed = false } = params;
  
  const similarityHash = computeContentHash(contentText);

  // Hard rejection if vacancy is closed or expired
  if (isExpiredOrClosed) {
    return {
      canIndex: false,
      robotsDirective: 'noindex, follow',
      wordCount,
      liveEntitiesCount,
      similarityHash,
      reason: 'Closed or expired vacancy/entity'
    };
  }

  // Gate 1: Minimum Unique Word Count (>= 400 words)
  if (wordCount < 400) {
    return {
      canIndex: false,
      robotsDirective: 'noindex, follow',
      wordCount,
      liveEntitiesCount,
      similarityHash,
      reason: `Insufficient unique word count (${wordCount} < 400 threshold)`
    };
  }

  // Gate 2: Minimum Live Entity Backing (>= 3 records)
  if (liveEntitiesCount < 3) {
    return {
      canIndex: false,
      robotsDirective: 'noindex, follow',
      wordCount,
      liveEntitiesCount,
      similarityHash,
      reason: `Thin backing entities (${liveEntitiesCount} < 3 threshold)`
    };
  }

  // Gate 3: Pairwise Similarity Guard (Template overlap < 75%)
  if (siblingContentText && contentText) {
    const similarity = computeTokenSimilarity(contentText, siblingContentText);
    if (similarity > 0.75) {
      return {
        canIndex: false,
        robotsDirective: 'noindex, follow',
        wordCount,
        liveEntitiesCount,
        similarityHash,
        reason: `Template boilerplate overlap too high (${(similarity * 100).toFixed(1)}% > 75%)`
      };
    }
  }

  // All 3 Gates Passed!
  return {
    canIndex: true,
    robotsDirective: 'index, follow',
    wordCount,
    liveEntitiesCount,
    similarityHash,
    reason: 'Passed 3-Gate Quality & Uniqueness standards'
  };
}
