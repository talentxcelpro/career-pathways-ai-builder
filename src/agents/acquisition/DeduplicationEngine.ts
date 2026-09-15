// src/agents/acquisition/DeduplicationEngine.ts
// Deduplication Engine for Multi-Dataset Acquisition
// Enforces deterministic hashing to prevent duplicate companies, jobs, colleges, or contacts.

export class DeduplicationEngine {
  private seenHashes = new Set<string>();

  generateHash(components: string[]): string {
    const combined = components.map((c) => c.toLowerCase().trim()).join('::');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    return `hash-${Math.abs(hash).toString(36)}`;
  }

  isDuplicate(hash: string): boolean {
    if (this.seenHashes.has(hash)) return true;
    this.seenHashes.add(hash);
    return false;
  }

  clear() {
    this.seenHashes.clear();
  }
}

export const coreDeduplicationEngine = new DeduplicationEngine();
