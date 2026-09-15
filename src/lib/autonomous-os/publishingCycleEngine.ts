// src/lib/autonomous-os/publishingCycleEngine.ts
// Single-Master Execution, Cycle Identity, Idempotency & Dead-Letter Queue Manager

export type ItemValidationStatus = 'VALIDATED' | 'QUARANTINED' | 'FAILED_RETRYABLE' | 'FAILED_PERMANENT' | 'PUBLISHED';

export interface PublishingCycleRecord {
  cycleId: string;
  pod: 'jobs' | 'colleges' | 'articles';
  sourceId: string;
  canonicalUrl: string;
  fingerprint: string;
  status: ItemValidationStatus;
  quarantineReason?: string;
  createdAt: string;
  publishedAt?: string;
}

export interface CycleExecutionSummary {
  cycleId: string;
  startedAt: string;
  completedAt?: string;
  totalEvaluated: number;
  totalPublished: number;
  totalQuarantined: number;
  jobsPublished: number;
  collegesPublished: number;
  articlesPublished: number;
  governorState: string;
  gateSummary: {
    dataProvenance: boolean;
    schemaConformance: boolean;
    seoCanonical: boolean;
    duplicationFingerprint: boolean;
    linkIntegrity: boolean;
    securityRbac: boolean;
    ssrRenderability: boolean;
    sitemapPartition: boolean;
  };
}

export function generateCycleId(date: Date = new Date(), sequence: number = 1): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const seqStr = String(sequence).padStart(3, '0');
  return `${yyyy}-${mm}-${dd}-PUBLISH-${seqStr}`;
}

export function generateContentFingerprint(sourceId: string, title: string, entityContext: string): string {
  const normTitle = title.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normEntity = entityContext.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  return `${sourceId}::${normTitle}::${normEntity}`;
}

// In-Memory Cycle Store & Dead Letter Quarantine Ledger
export class PublishingCycleLedger {
  private static instance: PublishingCycleLedger;
  private records: Map<string, PublishingCycleRecord> = new Map();
  private cycleSummaries: Map<string, CycleExecutionSummary> = new Map();
  private activeLock: string | null = null;

  private constructor() {}

  public static getInstance(): PublishingCycleLedger {
    if (!PublishingCycleLedger.instance) {
      PublishingCycleLedger.instance = new PublishingCycleLedger();
    }
    return PublishingCycleLedger.instance;
  }

  public acquireLock(cycleId: string): boolean {
    if (this.activeLock && this.activeLock !== cycleId) {
      return false; // Lock held by another master cycle
    }
    this.activeLock = cycleId;
    return true;
  }

  public releaseLock(cycleId: string): void {
    if (this.activeLock === cycleId) {
      this.activeLock = null;
    }
  }

  public recordItem(item: PublishingCycleRecord): void {
    const key = `${item.cycleId}:${item.sourceId}`;
    this.records.set(key, item);
  }

  public isAlreadyPublished(sourceId: string, fingerprint: string): boolean {
    for (const record of this.records.values()) {
      if (record.status === 'PUBLISHED' && (record.sourceId === sourceId || record.fingerprint === fingerprint)) {
        return true;
      }
    }
    return false;
  }

  public quarantineItem(cycleId: string, pod: 'jobs' | 'colleges' | 'articles', sourceId: string, canonicalUrl: string, reason: string): void {
    const record: PublishingCycleRecord = {
      cycleId,
      pod,
      sourceId,
      canonicalUrl,
      fingerprint: `${sourceId}::quarantined`,
      status: 'QUARANTINED',
      quarantineReason: reason,
      createdAt: new Date().toISOString()
    };
    this.recordItem(record);
  }

  public recordCycleSummary(summary: CycleExecutionSummary): void {
    this.cycleSummaries.set(summary.cycleId, summary);
  }

  public getCycleSummary(cycleId: string): CycleExecutionSummary | undefined {
    return this.cycleSummaries.get(cycleId);
  }

  public getAllQuarantined(): PublishingCycleRecord[] {
    return Array.from(this.records.values()).filter(r => r.status === 'QUARANTINED');
  }

  public getRecentSummaries(limit: number = 7): CycleExecutionSummary[] {
    return Array.from(this.cycleSummaries.values()).slice(-limit);
  }
}
