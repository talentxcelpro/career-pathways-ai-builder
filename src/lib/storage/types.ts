// src/lib/storage/types.ts
// TalentXcel Storage Reference & Policy Architecture
// Enforces Phase 5, Phase 7, Phase 9, Phase 11 & Phase 13 storage invariants.

export type StorageBucket =
  | 'avatars'
  | 'post-media'
  | 'documents'
  | 'cv-files'
  | 'resumes'
  | 'article-images'
  | 'company-logos'
  | 'video-intros'
  | 'videos'
  | 'user-uploads';

export type AssetStatus = 'active' | 'processing' | 'orphaned' | 'archived' | 'deleted';

export interface StorageAssetReference {
  asset_id: string;
  bucket: StorageBucket;
  path: string;
  hash_sha256: string;
  mime_type: string;
  size_bytes: number;
  owner_id?: string;
  created_at: string;
  updated_at: string;
  status: AssetStatus;
  canonical_url: string;
  metadata?: Record<string, unknown>;
}

// Phase 7: Strict Pre-Upload Size Limits (Bytes)
export const STORAGE_LIMITS: Record<string, { maxBytes: number; label: string }> = {
  avatars: { maxBytes: 2 * 1024 * 1024, label: '2 MB' },
  'article-images': { maxBytes: 3 * 1024 * 1024, label: '3 MB' },
  'post-media': { maxBytes: 5 * 1024 * 1024, label: '5 MB (images) / 50 MB (video)' },
  'cv-files': { maxBytes: 10 * 1024 * 1024, label: '10 MB' },
  resumes: { maxBytes: 10 * 1024 * 1024, label: '10 MB' },
  documents: { maxBytes: 10 * 1024 * 1024, label: '10 MB' },
  'company-logos': { maxBytes: 2 * 1024 * 1024, label: '2 MB' },
  videos: { maxBytes: 50 * 1024 * 1024, label: '50 MB' },
  'video-intros': { maxBytes: 50 * 1024 * 1024, label: '50 MB' },
  default: { maxBytes: 5 * 1024 * 1024, label: '5 MB' },
};

// Phase 5: Avatar Bucket Hardening & Per-Bucket MIME Whitelists
export const BUCKET_MIME_ALLOWLIST: Record<StorageBucket, string[]> = {
  // Avatars strictly image only — NEVER video/mp4 or application/octet-stream
  avatars: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  'article-images': ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  'company-logos': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  'post-media': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
  'video-intros': ['video/mp4', 'video/webm'],
  videos: ['video/mp4', 'video/webm'],
  'cv-files': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  resumes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
  'user-uploads': ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

export function isBucketPublic(bucket: StorageBucket): boolean {
  const privateBuckets: StorageBucket[] = ['cv-files', 'documents', 'user-uploads'];
  return !privateBuckets.includes(bucket);
}
