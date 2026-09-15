// Service Worker for video caching and offline support
const CACHE_NAME = 'video-cache-v1';
const VIDEO_CACHE_NAME = 'video-files-v1';

interface CacheItem {
  url: string;
  lessonId: string;
  quality: string;
  timestamp: number;
  size: number;
}

class VideoService {
  private static instance: VideoService;
  private cacheIndex: Map<string, CacheItem> = new Map();
  private downloadQueue: Map<string, Promise<void>> = new Map();

  static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  constructor() {
    this.initializeCache();
    this.registerServiceWorker();
  }

  private async initializeCache() {
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const metadata = response.headers.get('x-cache-metadata');
          if (metadata) {
            const item: CacheItem = JSON.parse(metadata);
            this.cacheIndex.set(item.lessonId, item);
          }
        }
      }
    } catch (error) {
      console.error('Cache initialization failed:', error);
    }
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/video-sw.js');
        console.log('Video service worker registered');
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  }

  async preloadVideo(lessonId: string, url: string, quality: string): Promise<void> {
    // Check if already in queue
    const existingDownload = this.downloadQueue.get(lessonId);
    if (existingDownload) {
      return existingDownload;
    }

    const downloadPromise = this.downloadVideo(lessonId, url, quality);
    this.downloadQueue.set(lessonId, downloadPromise);
    
    try {
      await downloadPromise;
    } finally {
      this.downloadQueue.delete(lessonId);
    }
  }

  private async downloadVideo(lessonId: string, url: string, quality: string): Promise<void> {
    try {
      const cache = await caches.open(VIDEO_CACHE_NAME);
      const request = new Request(url);
      
      // Check if already cached
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log(`Video already cached: ${lessonId}`);
        return;
      }

      console.log(`Downloading video: ${lessonId} (${quality})`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Clone response to avoid consuming it
      const responseClone = response.clone();
      
      // Create metadata
      const metadata: CacheItem = {
        url,
        lessonId,
        quality,
        timestamp: Date.now(),
        size: parseInt(response.headers.get('content-length') || '0', 10)
      };

      // Add metadata to headers
      const modifiedResponse = new Response(responseClone.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'x-cache-metadata': JSON.stringify(metadata)
        }
      });

      await cache.put(request, modifiedResponse);
      this.cacheIndex.set(lessonId, metadata);
      
      console.log(`Video cached successfully: ${lessonId}`);
    } catch (error) {
      console.error(`Video download failed for ${lessonId}:`, error);
      throw error;
    }
  }

  async getCachedVideo(lessonId: string): Promise<string | null> {
    try {
      const cacheItem = this.cacheIndex.get(lessonId);
      if (!cacheItem) return null;

      const cache = await caches.open(VIDEO_CACHE_NAME);
      const response = await cache.match(cacheItem.url);
      
      if (response) {
        // Create blob URL for cached video
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached video:', error);
      return null;
    }
  }

  async isVideoCached(lessonId: string): Promise<boolean> {
    return this.cacheIndex.has(lessonId);
  }

  async removeCachedVideo(lessonId: string): Promise<void> {
    try {
      const cacheItem = this.cacheIndex.get(lessonId);
      if (!cacheItem) return;

      const cache = await caches.open(VIDEO_CACHE_NAME);
      await cache.delete(cacheItem.url);
      this.cacheIndex.delete(lessonId);
      
      console.log(`Video removed from cache: ${lessonId}`);
    } catch (error) {
      console.error('Failed to remove cached video:', error);
    }
  }

  async getCacheStats(): Promise<{ count: number; size: number }> {
    let totalSize = 0;
    for (const item of this.cacheIndex.values()) {
      totalSize += item.size;
    }
    return {
      count: this.cacheIndex.size,
      size: totalSize
    };
  }

  async clearCache(): Promise<void> {
    try {
      await caches.delete(VIDEO_CACHE_NAME);
      await caches.delete(CACHE_NAME);
      this.cacheIndex.clear();
      console.log('Video cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async cleanupOldCache(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    const cutoff = Date.now() - maxAge;
    const itemsToDelete: string[] = [];

    for (const [lessonId, item] of this.cacheIndex.entries()) {
      if (item.timestamp < cutoff) {
        itemsToDelete.push(lessonId);
      }
    }

    for (const lessonId of itemsToDelete) {
      await this.removeCachedVideo(lessonId);
    }

    console.log(`Cleaned up ${itemsToDelete.length} old cached videos`);
  }

  // Intelligent prefetching based on user behavior
  async intelligentPrefetch(
    currentLessonId: string,
    allLessons: Array<{ id: string; videoUrl: string }>,
    userBehavior: {
      completionRate: number;
      averageWatchTime: number;
      sequentialViewing: boolean;
    }
  ): Promise<void> {
    // Only prefetch if user shows good engagement
    if (userBehavior.completionRate < 0.3) return;

    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex === -1) return;

    // Prefetch next lesson if user watches sequentially
    if (userBehavior.sequentialViewing && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (!await this.isVideoCached(nextLesson.id)) {
        this.preloadVideo(nextLesson.id, nextLesson.videoUrl, '720p').catch(console.error);
      }
    }

    // Prefetch next 2 lessons if user has high completion rate
    if (userBehavior.completionRate > 0.8) {
      for (let i = 1; i <= 2; i++) {
        const futureIndex = currentIndex + i;
        if (futureIndex < allLessons.length) {
          const futureLesson = allLessons[futureIndex];
          if (!await this.isVideoCached(futureLesson.id)) {
            // Use lower quality for speculative prefetching
            this.preloadVideo(futureLesson.id, futureLesson.videoUrl, '480p').catch(console.error);
          }
        }
      }
    }
  }

  // Adaptive quality selection based on network and device
  getOptimalQuality(
    availableQualities: Array<{ label: string; bandwidth: number }>,
    networkSpeed: number,
    deviceType: 'mobile' | 'tablet' | 'desktop'
  ): string {
    // Filter qualities based on network speed (with 2x buffer for smooth playback)
    const suitableQualities = availableQualities.filter(
      q => q.bandwidth <= networkSpeed * 1000 * 2 // Convert Mbps to kbps with buffer
    );

    if (suitableQualities.length === 0) {
      return availableQualities[0]?.label || '360p';
    }

    // Select based on device type
    const sortedQualities = suitableQualities.sort((a, b) => b.bandwidth - a.bandwidth);
    
    switch (deviceType) {
      case 'mobile':
        // Prefer battery/data efficiency on mobile
        return sortedQualities[Math.min(1, sortedQualities.length - 1)]?.label || '480p';
      case 'tablet':
        // Balanced quality for tablets
        return sortedQualities[0]?.label || '720p';
      case 'desktop':
        // Highest quality for desktop
        return sortedQualities[0]?.label || '1080p';
      default:
        return sortedQualities[0]?.label || '720p';
    }
  }
}

export const videoService = VideoService.getInstance();