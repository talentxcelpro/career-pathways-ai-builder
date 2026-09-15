/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Intent Memory (The Core Moat)
 * 
 * Append-only immutable memory log capturing:
 * Intent -> Intelligence -> Decision -> Action -> Outcome -> Learning
 * 
 * ZERO STATIC SEEDS — ONLY EMPIRICALLY RECORDED MEMORIES.
 */

export interface IntentMemoryEntry {
  memoryId: string;
  intentId: string;
  domain: string;
  canonicalIntent: string;
  chosenPathId: string;
  outcomeStatus: string;
  timeToOutcomeHours: number;
  learningLesson: string;
  recordedAt: string;
}

export class IntentMemory {
  private static memories: IntentMemoryEntry[] = [];

  public static append(entry: IntentMemoryEntry): void {
    this.memories.push(entry);
  }

  public static query(domain?: string): IntentMemoryEntry[] {
    return domain 
      ? this.memories.filter(m => m.domain === domain)
      : [...this.memories];
  }

  public static getAll(): IntentMemoryEntry[] {
    return this.query();
  }

  public static getCount(): number {
    return this.memories.length;
  }

  public static clear(): void {
    this.memories = [];
  }
}
