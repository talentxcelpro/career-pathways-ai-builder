import { supabase } from '@/integrations/supabase/client';
import { redisCache } from './redis';
import { getCustomStorageUrl } from './storage';

interface UploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
  duplex?: 'half';
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  };
}

interface BatchUploadResult {
  successful: Array<{ path: string; url: string; size: number }>;
  failed: Array<{ file: File; error: string }>;
  totalSize: number;
  uploadTime: number;
}

class OptimizedStorage {
  private static instance: OptimizedStorage;
  private uploadQueue: Map<string, Promise<any>> = new Map();
  private connectionPool: Array<typeof supabase> = [];
  private maxConnections = 5;

  static getInstance(): OptimizedStorage {
    if (!OptimizedStorage.instance) {
      OptimizedStorage.instance = new OptimizedStorage();
    }
    return OptimizedStorage.instance;
  }

  private constructor() {
    this.initializeConnectionPool();
  }

  private initializeConnectionPool() {
    for (let i = 0; i < this.maxConnections; i++) {
      this.connectionPool.push(supabase);
    }
  }

  private getConnection() {
    return this.connectionPool[Math.floor(Math.random() * this.connectionPool.length)];
  }

  // Optimized single file upload with deduplication
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options: UploadOptions = {}
  ): Promise<{ data: any; error: any; customUrl?: string; cached?: boolean }> {
    const uploadKey = `${bucket}:${path}:${file.size}`;
    
    // Check if same upload is in progress
    if (this.uploadQueue.has(uploadKey)) {
      return this.uploadQueue.get(uploadKey)!;
    }

    // Check cache first for identical files
    const cacheKey = `upload:${uploadKey}`;
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const uploadPromise = this.performUpload(bucket, path, file, options);
    this.uploadQueue.set(uploadKey, uploadPromise);

    try {
      const result = await uploadPromise;
      
      // Cache successful uploads
      if (result.data && !result.error) {
        await redisCache.set(cacheKey, result, {
          ttl: 3600, // 1 hour
          tags: [`bucket:${bucket}`, 'uploads']
        });
      }

      return result;
    } finally {
      this.uploadQueue.delete(uploadKey);
    }
  }

  private async performUpload(
    bucket: string,
    path: string,
    file: File | Blob,
    options: UploadOptions
  ) {
    const client = this.getConnection();
    
    const uploadOptions = {
      cacheControl: options.cacheControl || 'public, max-age=31536000',
      contentType: options.contentType || (file as File).type,
      upsert: options.upsert || true,
      duplex: options.duplex as any
    };

    const result = await client.storage
      .from(bucket)
      .upload(path, file, uploadOptions);

    if (result.data && !result.error) {
      const { data: { publicUrl } } = client.storage
        .from(bucket)
        .getPublicUrl(result.data.path);
      
      const customUrl = getCustomStorageUrl(publicUrl);
      return { ...result, customUrl };
    }

    return result;
  }

  // Batch upload with parallel processing and progress tracking
  async batchUpload(
    bucket: string,
    files: Array<{ file: File | Blob; path: string }>,
    options: UploadOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<BatchUploadResult> {
    const startTime = Date.now();
    const batchSize = 3; // Process 3 files at a time
    const successful: Array<{ path: string; url: string; size: number }> = [];
    const failed: Array<{ file: File; error: string }> = [];
    let totalSize = 0;
    let completed = 0;

    // Process files in batches
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ file, path }) => {
        try {
          const result = await this.uploadFile(bucket, path, file, options);
          
          if (result.error) {
            failed.push({ file: file as File, error: result.error.message });
          } else {
            successful.push({
              path: result.data.path,
              url: result.customUrl || '',
              size: file.size
            });
            totalSize += file.size;
          }
        } catch (error) {
          failed.push({ 
            file: file as File, 
            error: error instanceof Error ? error.message : 'Upload failed' 
          });
        }
        
        completed++;
        onProgress?.(Math.round((completed / files.length) * 100));
      });

      await Promise.all(batchPromises);
    }

    return {
      successful,
      failed,
      totalSize,
      uploadTime: Date.now() - startTime
    };
  }

  // Optimized public URL retrieval with caching
  async getPublicUrl(bucket: string, path: string, useCache = true): Promise<string> {
    const cacheKey = `url:${bucket}:${path}`;
    
    if (useCache) {
      const cached = await redisCache.get<string>(cacheKey);
      if (cached) return cached;
    }

    const client = this.getConnection();
    const { data: { publicUrl } } = client.storage
      .from(bucket)
      .getPublicUrl(path);

    const customUrl = getCustomStorageUrl(publicUrl);
    
    if (useCache) {
      await redisCache.set(cacheKey, customUrl, {
        ttl: 86400, // 24 hours
        tags: [`bucket:${bucket}`, 'urls']
      });
    }

    return customUrl;
  }

  // Bulk public URL retrieval
  async getBulkPublicUrls(
    bucket: string, 
    paths: string[]
  ): Promise<Record<string, string>> {
    const cacheKeys = paths.map(path => `url:${bucket}:${path}`);
    const urls: Record<string, string> = {};
    const uncachedPaths: string[] = [];

    // Check cache first
    for (let i = 0; i < paths.length; i++) {
      const cached = await redisCache.get<string>(cacheKeys[i]);
      if (cached) {
        urls[paths[i]] = cached;
      } else {
        uncachedPaths.push(paths[i]);
      }
    }

    // Fetch uncached URLs in parallel
    if (uncachedPaths.length > 0) {
      const client = this.getConnection();
      const urlPromises = uncachedPaths.map(async (path) => {
        const { data: { publicUrl } } = client.storage
          .from(bucket)
          .getPublicUrl(path);
        
        const customUrl = getCustomStorageUrl(publicUrl);
        
        // Cache the result
        await redisCache.set(`url:${bucket}:${path}`, customUrl, {
          ttl: 86400,
          tags: [`bucket:${bucket}`, 'urls']
        });
        
        return { path, url: customUrl };
      });

      const results = await Promise.all(urlPromises);
      results.forEach(({ path, url }) => {
        urls[path] = url;
      });
    }

    return urls;
  }

  // File existence check with caching
  async fileExists(bucket: string, path: string): Promise<boolean> {
    const cacheKey = `exists:${bucket}:${path}`;
    const cached = await redisCache.get<boolean>(cacheKey);
    if (cached !== null) return cached;

    try {
      const client = this.getConnection();
      const { data, error } = await client.storage
        .from(bucket)
        .download(path);
      
      const exists = !error && !!data;
      
      // Cache existence for 5 minutes
      await redisCache.set(cacheKey, exists, {
        ttl: 300,
        tags: [`bucket:${bucket}`, 'existence']
      });
      
      return exists;
    } catch {
      return false;
    }
  }

  // Optimized file deletion with cache invalidation
  async deleteFile(bucket: string, path: string): Promise<{ data: any; error: any }> {
    const client = this.getConnection();
    const result = await client.storage
      .from(bucket)
      .remove([path]);

    if (!result.error) {
      // Invalidate related cache entries
      await Promise.all([
        redisCache.del(`url:${bucket}:${path}`),
        redisCache.del(`exists:${bucket}:${path}`),
        redisCache.del(`upload:${bucket}:${path}`)
      ]);
    }

    return result;
  }

  // Cache management
  async invalidateBucketCache(bucket: string): Promise<void> {
    await redisCache.invalidateByTag(`bucket:${bucket}`);
  }

  async clearUploadCache(): Promise<void> {
    await redisCache.invalidateByTag('uploads');
  }

  // Get storage stats
  async getStorageStats(): Promise<{
    cacheHitRate: number;
    activeUploads: number;
    connectionPoolSize: number;
  }> {
    const cacheStats = await redisCache.getStats();
    
    return {
      cacheHitRate: cacheStats.hitRate,
      activeUploads: this.uploadQueue.size,
      connectionPoolSize: this.connectionPool.length
    };
  }
}

export const optimizedStorage = OptimizedStorage.getInstance();

// Helper function for file validation
export const validateFile = (
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; error?: string } => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/*', 'video/*', 'application/pdf', 'text/*'],
    allowedExtensions = []
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`
    };
  }

  // Check file type
  const isTypeAllowed = allowedTypes.some(type => {
    if (type.endsWith('*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });

  // Check file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const isExtensionAllowed = allowedExtensions.length === 0 || 
    (fileExtension && allowedExtensions.includes(fileExtension));

  if (!isTypeAllowed || !isExtensionAllowed) {
    return {
      valid: false,
      error: 'File type not supported'
    };
  }

  return { valid: true };
};

// Export specific optimized functions
export const {
  uploadFile: optimizedUploadFile,
  batchUpload: optimizedBatchUpload,
  getPublicUrl: optimizedGetPublicUrl,
  getBulkPublicUrls: optimizedGetBulkPublicUrls,
  fileExists: optimizedFileExists,
  deleteFile: optimizedDeleteFile
} = optimizedStorage;