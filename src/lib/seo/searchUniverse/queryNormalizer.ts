// src/lib/seo/searchUniverse/queryNormalizer.ts
// Deterministic Query Normalization Engine for TalentXcel 10M-20M Search Universe

export function normalizeSearchQuery(rawQuery: string): string {
  if (!rawQuery) return '';
  return rawQuery
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, ' ') // Remove special punctuation but keep word chars and hyphens
    .replace(/\s+/g, ' ')      // Collapse multiple whitespace
    .trim();
}

export function generateQueryHash(normalizedQuery: string): string {
  let hash = 5381;
  for (let i = 0; i < normalizedQuery.length; i++) {
    hash = (hash * 33) ^ normalizedQuery.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}
