// src/lib/storage/uploadAsset.ts
// TalentXcel Centralized Production Upload Utility
// Enforces Phase 5 (MIME whitelisting), Phase 6 (Deduplication & Compression),
// Phase 7 (Size Limits), and Phase 9 (CAS Pathing).

import { supabase } from '@/integrations/supabase/client';
import { StorageBucket, BUCKET_MIME_ALLOWLIST, STORAGE_LIMITS } from './types';
import { computeFileSha256, buildCasPath } from './casStorage';

export interface UploadAssetOptions {
  bucket: StorageBucket;
  customPath?: string;
  enableCasDeduplication?: boolean;
  maxDimension?: number; // e.g. 1920 for high-res, 1200 for articles, 400 for avatars
  imageQuality?: number;  // 0.80 default
}

export interface UploadAssetResult {
  success: boolean;
  publicUrl: string;
  path: string;
  bucket: StorageBucket;
  bytes: number;
  sha256: string;
  isDuplicateReused: boolean;
  error?: string;
}

/**
 * Compresses an image in the browser via HTML5 Canvas to WebP
 * Yields ~70-80% byte reduction before upload
 */
export async function compressImageToWebp(
  file: File,
  maxDimension: number = 1600,
  quality: number = 0.82
): Promise<Blob> {
  // If not an image or SVG/GIF (preserve animation/vector), return original
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // If already WebP and < 400KB, return directly
  if (file.type === 'image/webp' && file.size < 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file); // Keep original if compression didn't reduce size
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Master Centralized Upload Utility
 */
export async function uploadAsset(
  file: File,
  options: UploadAssetOptions
): Promise<UploadAssetResult> {
  const { bucket, customPath, enableCasDeduplication = true, maxDimension = 1600, imageQuality = 0.82 } = options;

  // 1. Validate MIME Type (Phase 5 Hardening)
  const allowedMimes = BUCKET_MIME_ALLOWLIST[bucket] || [];
  if (allowedMimes.length > 0 && !allowedMimes.includes(file.type)) {
    throw new Error(
      `File type "${file.type}" is not permitted in bucket "${bucket}". Permitted types: ${allowedMimes.join(', ')}`
    );
  }

  // 2. Validate Size Limit (Phase 7 Limits)
  const limit = STORAGE_LIMITS[bucket] || STORAGE_LIMITS.default;
  if (file.size > limit.maxBytes) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum limit of ${limit.label}`);
  }

  // 3. Client-Side Image Compression to WebP (Phase 3)
  let uploadBlob: Blob = file;
  let finalFilename = file.name;
  let finalMime = file.type;

  if (file.type.startsWith('image/') && file.type !== 'image/svg+xml' && file.type !== 'image/gif') {
    uploadBlob = await compressImageToWebp(file, maxDimension, imageQuality);
    finalMime = 'image/webp';
    finalFilename = `${file.name.replace(/\.[^.]+$/, '')}.webp`;
  }

  // 4. Generate Content Hash for Deduplication (Phase 9 CAS)
  const sha256 = await computeFileSha256(uploadBlob);

  // 5. Determine Storage Path
  let storagePath: string;
  if (enableCasDeduplication) {
    storagePath = buildCasPath(sha256, finalFilename);
  } else if (customPath) {
    storagePath = customPath;
  } else {
    const timestamp = Date.now();
    const sanitized = finalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    storagePath = `uploads/${timestamp}_${sanitized}`;
  }

  // 6. Check if identical CAS object already exists (Zero-byte Deduplication)
  if (enableCasDeduplication) {
    const folder = storagePath.split('/').slice(0, -1).join('/');
    const leaf = storagePath.split('/').pop();
    const { data: existingList } = await supabase.storage.from(bucket).list(folder, { limit: 10 });
    const exists = existingList?.some(item => item.name === leaf);

    if (exists) {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      return {
        success: true,
        publicUrl,
        path: storagePath,
        bucket,
        bytes: uploadBlob.size,
        sha256,
        isDuplicateReused: true
      };
    }
  }

  // 7. Perform Storage Upload
  const { data, error } = await supabase.storage.from(bucket).upload(storagePath, uploadBlob, {
    contentType: finalMime,
    cacheControl: '31536000', // 1-year immutable cache
    upsert: true
  });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    success: true,
    publicUrl,
    path: data.path,
    bucket,
    bytes: uploadBlob.size,
    sha256,
    isDuplicateReused: false
  };
}
