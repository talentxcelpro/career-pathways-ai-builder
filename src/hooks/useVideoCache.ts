import { useCallback, useState, useEffect } from 'react';

interface CachedVideo {
  id: string;
  url: string;
  quality: string;
  size: number;
  timestamp: number;
  blob?: Blob;
}

interface VideoProgress {
  lessonId: string;
  progress: number;
  currentTime: number;
  timestamp: number;
}

export const useVideoCache = () => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [cacheStats, setCacheStats] = useState({ count: 0, size: 0 });

  // Initialize cache stats
  useEffect(() => {
    updateCacheStats();
  }, []);

  const updateCacheStats = useCallback(async () => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['videos'], 'readonly');
      const store = transaction.objectStore('videos');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const videos = request.result as CachedVideo[];
        const totalSize = videos.reduce((sum, video) => sum + video.size, 0);
        setCacheStats({ count: videos.length, size: totalSize });
      };
    } catch (error) {
      console.error('Failed to update cache stats:', error);
    }
  }, []);

  const openDatabase = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VideoCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create videos store
        if (!db.objectStoreNames.contains('videos')) {
          const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
          videoStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Create progress store
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'lessonId' });
          progressStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }, []);

  const cacheVideo = useCallback(async (
    lessonId: string, 
    url: string, 
    quality: string
  ): Promise<void> => {
    try {
      setDownloadProgress(0);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const contentLength = response.headers.get('content-length');
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream not available');
      
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        if (totalSize > 0) {
          const progress = (receivedLength / totalSize) * 100;
          setDownloadProgress(progress);
        }
      }
      
      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }
      
      const blob = new Blob([allChunks], { type: 'video/mp4' });
      
      const db = await openDatabase();
      const transaction = db.transaction(['videos'], 'readwrite');
      const store = transaction.objectStore('videos');
      
      const cachedVideo: CachedVideo = {
        id: lessonId,
        url,
        quality,
        size: blob.size,
        timestamp: Date.now(),
        blob
      };
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(cachedVideo);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      setDownloadProgress(100);
      updateCacheStats();
      
      // Clean up old cache if needed
      await cleanupOldCache();
      
    } catch (error) {
      console.error('Video caching failed:', error);
      setDownloadProgress(0);
      throw error;
    }
  }, [updateCacheStats]);

  const getCachedVideo = useCallback(async (lessonId: string): Promise<string | null> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['videos'], 'readonly');
      const store = transaction.objectStore('videos');
      
      return new Promise((resolve) => {
        const request = store.get(lessonId);
        
        request.onsuccess = () => {
          const cachedVideo = request.result as CachedVideo;
          if (cachedVideo?.blob) {
            const url = URL.createObjectURL(cachedVideo.blob);
            resolve(url);
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Failed to get cached video:', error);
      return null;
    }
  }, []);

  const isVideoCached = useCallback(async (lessonId: string): Promise<boolean> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['videos'], 'readonly');
      const store = transaction.objectStore('videos');
      
      return new Promise((resolve) => {
        const request = store.get(lessonId);
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error('Failed to check cache:', error);
      return false;
    }
  }, []);

  const removeCachedVideo = useCallback(async (lessonId: string): Promise<void> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['videos'], 'readwrite');
      const store = transaction.objectStore('videos');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(lessonId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      updateCacheStats();
    } catch (error) {
      console.error('Failed to remove cached video:', error);
      throw error;
    }
  }, [updateCacheStats]);

  const cleanupOldCache = useCallback(async (): Promise<void> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['videos'], 'readwrite');
      const store = transaction.objectStore('videos');
      const index = store.index('timestamp');
      
      // Remove videos older than 30 days
      const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const range = IDBKeyRange.upperBound(cutoffDate);
      
      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      // Also cleanup if cache size exceeds 1GB
      const allVideos = await new Promise<CachedVideo[]>((resolve) => {
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => resolve([]);
      });
      
      const totalSize = allVideos.reduce((sum, video) => sum + video.size, 0);
      const maxSize = 1024 * 1024 * 1024; // 1GB
      
      if (totalSize > maxSize) {
        // Remove oldest videos first
        const sortedVideos = allVideos.sort((a, b) => a.timestamp - b.timestamp);
        let currentSize = totalSize;
        
        for (const video of sortedVideos) {
          if (currentSize <= maxSize * 0.8) break; // Keep 80% of max size
          
          await new Promise<void>((resolve) => {
            const deleteRequest = store.delete(video.id);
            deleteRequest.onsuccess = () => {
              currentSize -= video.size;
              resolve();
            };
            deleteRequest.onerror = () => resolve();
          });
        }
      }
      
      updateCacheStats();
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }, [updateCacheStats]);

  const saveProgress = useCallback(async (
    lessonId: string,
    progress: number,
    currentTime: number
  ): Promise<void> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['progress'], 'readwrite');
      const store = transaction.objectStore('progress');
      
      const progressData: VideoProgress = {
        lessonId,
        progress,
        currentTime,
        timestamp: Date.now()
      };
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(progressData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, []);

  const getProgress = useCallback(async (lessonId: string): Promise<VideoProgress | null> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['progress'], 'readonly');
      const store = transaction.objectStore('progress');
      
      return new Promise((resolve) => {
        const request = store.get(lessonId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Failed to get progress:', error);
      return null;
    }
  }, []);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['videos', 'progress'], 'readwrite');
      
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore('videos').clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore('progress').clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      ]);
      
      updateCacheStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }, [updateCacheStats]);

  return {
    cacheVideo,
    getCachedVideo,
    isVideoCached,
    removeCachedVideo,
    cleanupOldCache,
    saveProgress,
    getProgress,
    clearCache,
    downloadProgress,
    cacheStats
  };
};