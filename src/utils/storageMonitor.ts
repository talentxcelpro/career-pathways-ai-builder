// Storage optimization monitoring and performance tracking
import { redisCache } from './redis';
import { optimizedStorage } from './optimizedStorage';

interface StorageMetrics {
  uploadCount: number;
  downloadCount: number;
  cacheHitRate: number;
  avgUploadTime: number;
  avgDownloadTime: number;
  totalDataTransferred: number;
  errorRate: number;
}

class StorageMonitor {
  private static instance: StorageMonitor;
  private metrics: StorageMetrics = {
    uploadCount: 0,
    downloadCount: 0,
    cacheHitRate: 0,
    avgUploadTime: 0,
    avgDownloadTime: 0,
    totalDataTransferred: 0,
    errorRate: 0
  };

  static getInstance(): StorageMonitor {
    if (!StorageMonitor.instance) {
      StorageMonitor.instance = new StorageMonitor();
    }
    return StorageMonitor.instance;
  }

  // Track upload performance
  async trackUpload(size: number, duration: number, success: boolean) {
    this.metrics.uploadCount++;
    this.metrics.totalDataTransferred += size;
    
    if (success) {
      this.metrics.avgUploadTime = 
        (this.metrics.avgUploadTime * (this.metrics.uploadCount - 1) + duration) / this.metrics.uploadCount;
    } else {
      this.metrics.errorRate = 
        (this.metrics.errorRate * (this.metrics.uploadCount - 1) + 1) / this.metrics.uploadCount;
    }

    await this.persistMetrics();
  }

  // Track download performance
  async trackDownload(size: number, duration: number, fromCache: boolean) {
    this.metrics.downloadCount++;
    this.metrics.totalDataTransferred += size;
    
    if (fromCache) {
      this.metrics.cacheHitRate = 
        (this.metrics.cacheHitRate * (this.metrics.downloadCount - 1) + 1) / this.metrics.downloadCount;
    }

    this.metrics.avgDownloadTime = 
      (this.metrics.avgDownloadTime * (this.metrics.downloadCount - 1) + duration) / this.metrics.downloadCount;

    await this.persistMetrics();
  }

  // Get current metrics
  getMetrics(): StorageMetrics {
    return { ...this.metrics };
  }

  // Persist metrics to cache for dashboard
  private async persistMetrics() {
    await redisCache.set('storage_metrics', this.metrics, {
      ttl: 3600, // 1 hour
      tags: ['metrics', 'storage']
    });
  }

  // Get optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.cacheHitRate < 0.7) {
      recommendations.push('Consider increasing cache TTL or warming more frequently accessed files');
    }

    if (this.metrics.avgUploadTime > 5000) {
      recommendations.push('Upload times are high - consider implementing upload compression');
    }

    if (this.metrics.errorRate > 0.1) {
      recommendations.push('Error rate is high - review file validation and retry logic');
    }

    if (this.metrics.totalDataTransferred > 100 * 1024 * 1024 && this.metrics.cacheHitRate < 0.5) {
      recommendations.push('High data transfer with low cache hit rate - optimize caching strategy');
    }

    return recommendations;
  }

  // Reset metrics (for testing or periodic resets)
  resetMetrics() {
    this.metrics = {
      uploadCount: 0,
      downloadCount: 0,
      cacheHitRate: 0,
      avgUploadTime: 0,
      avgDownloadTime: 0,
      totalDataTransferred: 0,
      errorRate: 0
    };
  }
}

export const storageMonitor = StorageMonitor.getInstance();

// Performance wrapper for optimized storage
export const monitoredStorage = {
  async uploadFile(bucket: string, path: string, file: File | Blob, options?: any) {
    const startTime = Date.now();
    let success = false;
    
    try {
      const result = await optimizedStorage.uploadFile(bucket, path, file, options);
      success = !result.error;
      return result;
    } finally {
      const duration = Date.now() - startTime;
      await storageMonitor.trackUpload(file.size, duration, success);
    }
  },

  async getPublicUrl(bucket: string, path: string, useCache = true) {
    const startTime = Date.now();
    
    try {
      const url = await optimizedStorage.getPublicUrl(bucket, path, useCache);
      const duration = Date.now() - startTime;
      await storageMonitor.trackDownload(0, duration, useCache);
      return url;
    } catch (error) {
      const duration = Date.now() - startTime;
      await storageMonitor.trackDownload(0, duration, false);
      throw error;
    }
  },

  // Pass through other methods
  batchUpload: optimizedStorage.batchUpload.bind(optimizedStorage),
  getBulkPublicUrls: optimizedStorage.getBulkPublicUrls.bind(optimizedStorage),
  fileExists: optimizedStorage.fileExists.bind(optimizedStorage),
  deleteFile: optimizedStorage.deleteFile.bind(optimizedStorage),
  invalidateBucketCache: optimizedStorage.invalidateBucketCache.bind(optimizedStorage),
  clearUploadCache: optimizedStorage.clearUploadCache.bind(optimizedStorage),
  getStorageStats: optimizedStorage.getStorageStats.bind(optimizedStorage)
};