/**
 * Candidate Identity Normalizers
 * Multi-layer normalization for emails, phone numbers, person names, and CV content.
 */

/**
 * Layer 1: Email Normalization
 * Standardizes email addresses: lowercase, trim, remove internal spaces, normalize dots for gmail.
 */
export function normalizeEmail(email?: string | null): string {
  if (!email || typeof email !== 'string') return '';
  let cleaned = email.trim().toLowerCase();

  // Remove common surrounding quotes/brackets
  cleaned = cleaned.replace(/^[<"'\s]+|[>"'\s]+$/g, '');

  // Basic format check
  if (!cleaned.includes('@')) return '';

  const parts = cleaned.split('@');
  if (parts.length !== 2) return '';

  let [local, domain] = parts;

  // Handle gmail specific aliasing (dots and +tags)
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.split('+')[0]; // Remove +alias
    local = local.replace(/\./g, ''); // Remove dots in gmail
    domain = 'gmail.com';
  } else {
    // For other domains, strip +alias if present
    local = local.split('+')[0];
  }

  return `${local}@${domain}`;
}

/**
 * Layer 2: Phone Normalization
 * Country-aware phone normalization stripping formatting, spaces, dashes, parentheses.
 */
export function normalizePhone(phone?: string | null): string {
  if (!phone || typeof phone !== 'string') return '';
  
  // Extract all digits and optional leading '+'
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length < 8) return ''; // Too short to be a valid phone

  // Handle common India prefix 91 or 0
  if (!hasPlus && digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `+91${digitsOnly.slice(1)}`;
  }
  if (!hasPlus && digitsOnly.length === 10) {
    // Default to +91 if 10-digit Indian mobile
    return `+91${digitsOnly}`;
  }
  if (!hasPlus && digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  }

  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Layer 3: Name Normalization
 * Normalizes case, removes accents (Unicode NFKD), removes honorifics and parsing suffixes.
 */
export function normalizeName(name?: string | null): string {
  if (!name || typeof name !== 'string') return '';

  let cleaned = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, ''); // Unicode accent strip
  cleaned = cleaned.toLowerCase().trim();

  // Strip common honorifics and prefixes
  cleaned = cleaned.replace(/^(mr|mrs|ms|dr|prof|er|engr)\.?\s+/i, '');

  // Strip file extension or CV/resume artifacts
  cleaned = cleaned.replace(/\.(pdf|docx?|txt)$/i, '');
  cleaned = cleaned.replace(/\b(cv|resume|curriculum vitae|profile)\b/gi, '');

  // Strip special symbols, keep standard letters and single spaces
  cleaned = cleaned.replace(/[^a-z\s]/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Fuzzy Name Similarity [0.0 - 1.0]
 * Combines exact token overlap (Jaccard) with Levenshtein edit distance.
 */
export function calculateNameSimilarity(name1?: string | null, name2?: string | null): number {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);

  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;

  // Tokenize
  const tokens1 = new Set(norm1.split(' ').filter(Boolean));
  const tokens2 = new Set(norm2.split(' ').filter(Boolean));

  // Token Jaccard
  let intersection = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) intersection++;
  }
  const union = new Set([...tokens1, ...tokens2]).size;
  const tokenSim = union > 0 ? intersection / union : 0;

  // Edit distance similarity
  const maxLen = Math.max(norm1.length, norm2.length);
  const editDist = levenshteinDistance(norm1, norm2);
  const editSim = maxLen > 0 ? Math.max(0, 1 - editDist / maxLen) : 0;

  // Weighted combo: 60% token similarity, 40% character edit similarity
  return Number((tokenSim * 0.6 + editSim * 0.4).toFixed(3));
}

/**
 * Layer 4: CV Document Fingerprinting (SHA-256)
 * Generates cryptographic fingerprint of file content.
 */
export async function calculateFileHash(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === 'string') {
    buffer = new TextEncoder().encode(data).buffer;
  } else if (data instanceof Uint8Array) {
    buffer = data.buffer;
  } else {
    buffer = data;
  }

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback FNV-1a 64-bit hash if SubtleCrypto is unavailable
  let hash1 = 0x811c9dc5;
  const view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; i++) {
    hash1 ^= view[i];
    hash1 += (hash1 << 1) + (hash1 << 4) + (hash1 << 7) + (hash1 << 8) + (hash1 << 24);
  }
  return (hash1 >>> 0).toString(16).padStart(16, '0');
}

/**
 * Layer 5: CV Content Normalization & Shingle-based Fingerprinting
 */
export function normalizeCVContent(text?: string | null): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')       // Remove punctuation
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .trim();
}

/**
 * Content Similarity (Jaccard similarity on 3-word shingles)
 */
export function calculateContentSimilarity(text1?: string | null, text2?: string | null): number {
  const norm1 = normalizeCVContent(text1);
  const norm2 = normalizeCVContent(text2);

  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;

  const words1 = norm1.split(' ').filter(w => w.length > 2);
  const words2 = norm2.split(' ').filter(w => w.length > 2);

  if (words1.length < 5 || words2.length < 5) {
    // If text is short, calculate word overlap directly
    const s1 = new Set(words1);
    const s2 = new Set(words2);
    let common = 0;
    for (const w of s1) if (s2.has(w)) common++;
    const total = new Set([...s1, ...s2]).size;
    return total > 0 ? Number((common / total).toFixed(3)) : 0;
  }

  // Create 3-gram shingles
  const shingles1 = new Set<string>();
  for (let i = 0; i < words1.length - 2; i++) {
    shingles1.add(`${words1[i]} ${words1[i + 1]} ${words1[i + 2]}`);
  }

  const shingles2 = new Set<string>();
  for (let i = 0; i < words2.length - 2; i++) {
    shingles2.add(`${words2[i]} ${words2[i + 1]} ${words2[i + 2]}`);
  }

  let overlap = 0;
  for (const s of shingles1) {
    if (shingles2.has(s)) overlap++;
  }

  const union = new Set([...shingles1, ...shingles2]).size;
  return union > 0 ? Number((overlap / union).toFixed(3)) : 0;
}

/**
 * Skills Array Similarity
 */
export function calculateSkillsSimilarity(skills1?: string[] | null, skills2?: string[] | null): number {
  if (!skills1 || !skills2 || skills1.length === 0 || skills2.length === 0) return 0;

  const set1 = new Set(skills1.map(s => s.trim().toLowerCase()));
  const set2 = new Set(skills2.map(s => s.trim().toLowerCase()));

  let matches = 0;
  for (const s of set1) {
    if (set2.has(s)) matches++;
  }

  const union = new Set([...set1, ...set2]).size;
  return union > 0 ? Number((matches / union).toFixed(3)) : 0;
}
