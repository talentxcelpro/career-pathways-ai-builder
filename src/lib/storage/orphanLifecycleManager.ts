// src/lib/storage/orphanLifecycleManager.ts
// TalentXcel Storage Asset Lifecycle & Automatic Orphan Governor
// Implements 5-state lifecycle: ACTIVE, PROCESSING, ORPHANED, ARCHIVED, DELETED
// Protects against upload abandonment, failed DB transactions, and unattached file leakage.

import { StorageBucket } from './types';

export type AssetLifecycleState = 'ACTIVE' | 'PROCESSING' | 'ORPHANED' | 'ARCHIVED' | 'DELETED';

export interface StorageAssetLifecycleRecord {
  assetId: string;
  bucket: StorageBucket;
  path: string;
  sha256: string;
  sizeBytes: number;
  mimeType: string;
  ownerId?: string;
  state: AssetLifecycleState;
  uploadedAt: string;
  confirmedAt?: string;
  orphanedAt?: string;
  deletedAt?: string;
  dbTable?: string;
  dbRecordId?: string;
  gracePeriodHours: number;
}

export interface OrphanSweepSummary {
  scannedCount: number;
  activeCount: number;
  processingCount: number;
  orphanedCount: number;
  prunedCount: number;
  bytesRecovered: number;
  prunedPaths: string[];
}

// In-memory / ephemeral ledger with persistence helper
const lifecycleRegistry = new Map<string, StorageAssetLifecycleRecord>();

function getRegistryKey(bucket: string, path: string): string {
  return `${bucket}::${path}`;
}

/**
 * Stage 1: Register an upload intent as PROCESSING.
 * Sets a 24-hour grace timer for database reference confirmation.
 */
export function registerUploadIntent(params: {
  bucket: StorageBucket;
  path: string;
  sha256: string;
  sizeBytes: number;
  mimeType: string;
  ownerId?: string;
  gracePeriodHours?: number;
}): StorageAssetLifecycleRecord {
  const { bucket, path, sha256, sizeBytes, mimeType, ownerId, gracePeriodHours = 24 } = params;
  const key = getRegistryKey(bucket, path);

  const record: StorageAssetLifecycleRecord = {
    assetId: `ast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    bucket,
    path,
    sha256,
    sizeBytes,
    mimeType,
    ownerId,
    state: 'PROCESSING',
    uploadedAt: new Date().toISOString(),
    gracePeriodHours
  };

  lifecycleRegistry.set(key, record);
  return record;
}

/**
 * Stage 2: Confirm upload is attached to a database record (transitions to ACTIVE).
 */
export function confirmUploadActive(params: {
  bucket: StorageBucket;
  path: string;
  dbTable: string;
  dbRecordId: string;
}): StorageAssetLifecycleRecord | null {
  const { bucket, path, dbTable, dbRecordId } = params;
  const key = getRegistryKey(bucket, path);
  const record = lifecycleRegistry.get(key);

  if (!record) return null;

  record.state = 'ACTIVE';
  record.confirmedAt = new Date().toISOString();
  record.dbTable = dbTable;
  record.dbRecordId = dbRecordId;

  lifecycleRegistry.set(key, record);
  return record;
}

/**
 * Stage 3: Classify unconfirmed uploads exceeding grace period as ORPHANED.
 */
export function identifyOrphanedCandidates(now = new Date()): StorageAssetLifecycleRecord[] {
  const orphans: StorageAssetLifecycleRecord[] = [];

  for (const record of lifecycleRegistry.values()) {
    if (record.state === 'PROCESSING') {
      const uploadedTime = new Date(record.uploadedAt).getTime();
      const ageHours = (now.getTime() - uploadedTime) / (1000 * 60 * 60);

      if (ageHours > record.gracePeriodHours) {
        record.state = 'ORPHANED';
        record.orphanedAt = now.toISOString();
        orphans.push(record);
      }
    }
  }

  return orphans;
}

/**
 * Stage 4: Sweep and execute safe deletion for verified orphans.
 */
export async function sweepOrphans(
  deleterFn: (bucket: StorageBucket, paths: string[]) => Promise<{ success: boolean; deletedCount: number }>,
  dryRun = false
): Promise<OrphanSweepSummary> {
  const orphans = identifyOrphanedCandidates();
  const summary: OrphanSweepSummary = {
    scannedCount: lifecycleRegistry.size,
    activeCount: 0,
    processingCount: 0,
    orphanedCount: orphans.length,
    prunedCount: 0,
    bytesRecovered: 0,
    prunedPaths: []
  };

  for (const r of lifecycleRegistry.values()) {
    if (r.state === 'ACTIVE') summary.activeCount++;
    if (r.state === 'PROCESSING') summary.processingCount++;
  }

  if (dryRun || orphans.length === 0) return summary;

  // Group by bucket
  const byBucket = new Map<StorageBucket, StorageAssetLifecycleRecord[]>();
  for (const o of orphans) {
    const list = byBucket.get(o.bucket) || [];
    list.push(o);
    byBucket.set(o.bucket, list);
  }

  for (const [bucket, list] of byBucket.entries()) {
    const paths = list.map(item => item.path);
    const result = await deleterFn(bucket, paths);
    if (result.success) {
      summary.prunedCount += result.deletedCount;
      for (const item of list) {
        item.state = 'DELETED';
        item.deletedAt = new Date().toISOString();
        summary.bytesRecovered += item.sizeBytes;
        summary.prunedPaths.push(`${bucket}/${item.path}`);
      }
    }
  }

  return summary;
}

/**
 * Retrieve current lifecycle statistics.
 */
export function getLifecycleStats(): {
  totalTracked: number;
  byState: Record<AssetLifecycleState, number>;
} {
  const byState: Record<AssetLifecycleState, number> = {
    ACTIVE: 0,
    PROCESSING: 0,
    ORPHANED: 0,
    ARCHIVED: 0,
    DELETED: 0
  };

  for (const r of lifecycleRegistry.values()) {
    byState[r.state]++;
  }

  return {
    totalTracked: lifecycleRegistry.size,
    byState
  };
}
