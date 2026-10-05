// src/lib/storage/storageGovernor.ts
// TalentXcel Automatic Storage Governor
// Implements Phase 13: Pre-upload governance decisions (ALLOW, OPTIMIZE, DEDUPLICATE, REJECT)
// Implements Phase 12: Warning thresholds (50% monitor, 70% warning, 80% action, 90% critical)

import { StorageBucket, STORAGE_LIMITS, BUCKET_MIME_ALLOWLIST } from './types';

export type GovernorVerdict = 'ALLOW' | 'OPTIMIZE' | 'DEDUPLICATE' | 'REJECT';

export interface StorageEvaluation {
  verdict: GovernorVerdict;
  allowed: boolean;
  reason: string;
  recommendedAction: string;
  suggestedMime?: string;
  suggestedMaxBytes?: number;
}

export const FREE_TIER_QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GB (Supabase limit)
export const TALENTXCEL_INTERNAL_CEILING_MB = 300; // TalentXcel strict internal operational target (< 300 MB)
export const TALENTXCEL_INTERNAL_CEILING_BYTES = TALENTXCEL_INTERNAL_CEILING_MB * 1024 * 1024;

export interface StorageQuotaStatus {
  totalBytes: number;
  totalMb: number;
  quotaBytes: number;
  percentageUsed: number;
  internalCeilingMb: number;
  internalPercentageUsed: number;
  internalHeadroomMb: number;
  healthLevel: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
  internalHealth: 'GREEN' | 'WATCH' | 'WARNING' | 'ACTION' | 'CRITICAL';
  warningMessage?: string;
  recommendedAction?: string;
}

export function evaluateQuota(currentBytes: number): StorageQuotaStatus {
  const percentageUsed = +((currentBytes / FREE_TIER_QUOTA_BYTES) * 100).toFixed(1);
  const totalMb = +(currentBytes / (1024 * 1024)).toFixed(2);
  const internalPercentageUsed = +((currentBytes / TALENTXCEL_INTERNAL_CEILING_BYTES) * 100).toFixed(1);
  const internalHeadroomMb = +(Math.max(0, TALENTXCEL_INTERNAL_CEILING_MB - totalMb)).toFixed(2);

  let healthLevel: StorageQuotaStatus['healthLevel'] = 'HEALTHY';
  let internalHealth: StorageQuotaStatus['internalHealth'] = 'GREEN';
  let warningMessage: string | undefined;
  let recommendedAction: string | undefined;

  // 1. Supabase 1 GB Free Tier checks (Platform Thresholds)
  if (percentageUsed >= 90) {
    healthLevel = 'EMERGENCY';
    warningMessage = 'EMERGENCY: Storage exceeds 90% of Supabase 1 GB free quota. Immediate action required.';
    recommendedAction = 'Halt all non-essential uploads. Run aggressive CAS sweep and transcode large media.';
  } else if (percentageUsed >= 80) {
    healthLevel = 'CRITICAL';
    warningMessage = 'CRITICAL: Storage exceeds 80% of Supabase quota. Quota restriction imminent.';
    recommendedAction = 'Enforce strict 2 MB cap on all uploads; purge verified orphaned records.';
  } else if (percentageUsed >= 70) {
    healthLevel = 'WARNING';
    warningMessage = 'WARNING: Storage exceeds 70% of Supabase quota. Headroom shrinking.';
    recommendedAction = 'Require client-side WebP compression and deduplicate active media.';
  } else {
    healthLevel = 'HEALTHY';
  }

  // 2. TalentXcel Internal Operating Ceiling (< 300 MB) — 5-Band Governor
  if (totalMb > 300) {
    internalHealth = 'CRITICAL';
    warningMessage = warningMessage || `CRITICAL: Storage (${totalMb} MB) exceeds the 300 MB internal operating ceiling!`;
    recommendedAction = recommendedAction || 'Trigger automatic orphan cleanup and transcode photographic PNGs to WebP.';
  } else if (totalMb >= 275) {
    internalHealth = 'ACTION';
    warningMessage = warningMessage || `ACTION REQUIRED: Storage (${totalMb} MB) is between 275-300 MB. Nearing ceiling.`;
    recommendedAction = recommendedAction || 'Block uploads > 5 MB; run CAS deduplication review.';
  } else if (totalMb >= 250) {
    internalHealth = 'WARNING';
    warningMessage = warningMessage || `WARNING: Storage (${totalMb} MB) is between 250-275 MB.`;
    recommendedAction = recommendedAction || 'Mandate client-side WebP conversion on all image uploads.';
  } else if (totalMb >= 200) {
    internalHealth = 'WATCH';
    warningMessage = warningMessage || `WATCH: Storage (${totalMb} MB) is in the 200-250 MB operational monitor zone.`;
    recommendedAction = recommendedAction || 'Monitor daily upload velocity.';
  } else {
    internalHealth = 'GREEN';
    recommendedAction = 'Operating in optimal green state. Zero quota risk.';
  }

  return {
    totalBytes: currentBytes,
    totalMb,
    quotaBytes: FREE_TIER_QUOTA_BYTES,
    percentageUsed,
    internalCeilingMb: TALENTXCEL_INTERNAL_CEILING_MB,
    internalPercentageUsed,
    internalHeadroomMb,
    healthLevel,
    internalHealth,
    warningMessage,
    recommendedAction
  };
}

export function evaluateStorageUpload(params: {
  bucket: StorageBucket;
  fileSizeBytes: number;
  mimeType: string;
  filename: string;
  isKnownDuplicateHash?: boolean;
}): StorageEvaluation {
  const { bucket, fileSizeBytes, mimeType, isKnownDuplicateHash } = params;

  // 1. MIME Validation (Phase 5)
  const allowed = BUCKET_MIME_ALLOWLIST[bucket] || [];
  if (allowed.length > 0 && !allowed.includes(mimeType)) {
    return {
      verdict: 'REJECT',
      allowed: false,
      reason: `MIME type "${mimeType}" is prohibited in bucket "${bucket}". Allowed: ${allowed.join(', ')}`,
      recommendedAction: 'Choose a supported file format.'
    };
  }

  // 2. Size Validation (Phase 7)
  const limit = STORAGE_LIMITS[bucket] || STORAGE_LIMITS.default;
  if (fileSizeBytes > limit.maxBytes) {
    return {
      verdict: 'REJECT',
      allowed: false,
      reason: `File size (${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds bucket limit of ${limit.label}`,
      recommendedAction: 'Compress file before uploading.',
      suggestedMaxBytes: limit.maxBytes
    };
  }

  // 3. Deduplication Check (Phase 9)
  if (isKnownDuplicateHash) {
    return {
      verdict: 'DEDUPLICATE',
      allowed: true,
      reason: 'Identical file content already exists in storage.',
      recommendedAction: 'Reuse existing canonical object without storing duplicate bytes.'
    };
  }

  // 4. Image Optimization Check (Phase 3)
  if (mimeType.startsWith('image/') && mimeType !== 'image/webp' && mimeType !== 'image/svg+xml' && fileSizeBytes > 300 * 1024) {
    return {
      verdict: 'OPTIMIZE',
      allowed: true,
      reason: `Uncompressed image format (${mimeType}) > 300 KB.`,
      recommendedAction: 'Compress to WebP client-side before dispatching to Supabase.',
      suggestedMime: 'image/webp'
    };
  }

  return {
    verdict: 'ALLOW',
    allowed: true,
    reason: 'File passes all size, MIME, and governance checks.',
    recommendedAction: 'Proceed with standard upload.'
  };
}
