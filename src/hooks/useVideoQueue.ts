import { useCallback, useRef, useState, useEffect } from 'react';

interface VideoQueueItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  preloaded: boolean;
  element?: HTMLVideoElement;
}

interface VideoQueueOptions {
  preloadNext?: boolean;
  maxPreloadedVideos?: number;
  preloadDistance?: number;
}

export const useVideoQueue = (
  videos: Array<{ id: string; videoUrl: string; thumbnailUrl?: string }>,
  options: VideoQueueOptions = {}
) => {
  const {
    preloadNext = true,
    maxPreloadedVideos = 3,
    preloadDistance = 1
  } = options;

  const [queue, setQueue] = useState<VideoQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const preloadedRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Initialize queue
  useEffect(() => {
    const initialQueue = videos.map(video => ({
      ...video,
      preloaded: false
    }));
    setQueue(initialQueue);
  }, [videos]);

  // Preload videos around current index
  useEffect(() => {
    if (!preloadNext || queue.length === 0) return;

    const preloadVideo = async (item: VideoQueueItem) => {
      if (item.preloaded || preloadedRefs.current.has(item.id)) return;

      try {
        const video = document.createElement('video');
        video.src = item.videoUrl;
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        await new Promise((resolve, reject) => {
          video.addEventListener('loadedmetadata', resolve);
          video.addEventListener('error', reject);
          video.load();
        });

        preloadedRefs.current.set(item.id, video);
        
        setQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, preloaded: true, element: video } : q
        ));
      } catch (error) {
        console.warn(`Failed to preload video ${item.id}:`, error);
      }
    };

    // Preload videos within distance
    const startIndex = Math.max(0, currentIndex - preloadDistance);
    const endIndex = Math.min(queue.length - 1, currentIndex + preloadDistance);

    for (let i = startIndex; i <= endIndex; i++) {
      if (preloadedRefs.current.size < maxPreloadedVideos) {
        preloadVideo(queue[i]);
      }
    }

    // Cleanup old preloaded videos
    const activeIds = new Set(queue.slice(startIndex, endIndex + 1).map(item => item.id));
    preloadedRefs.current.forEach((video, id) => {
      if (!activeIds.has(id)) {
        video.src = '';
        preloadedRefs.current.delete(id);
      }
    });

  }, [currentIndex, queue, preloadNext, maxPreloadedVideos, preloadDistance]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, queue.length - 1));
  }, [queue.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < queue.length) {
      setCurrentIndex(index);
    }
  }, [queue.length]);

  const getCurrentVideo = useCallback(() => {
    return queue[currentIndex] || null;
  }, [queue, currentIndex]);

  const getPreloadedVideo = useCallback((videoId: string) => {
    return preloadedRefs.current.get(videoId);
  }, []);

  const cleanup = useCallback(() => {
    preloadedRefs.current.forEach(video => {
      video.src = '';
    });
    preloadedRefs.current.clear();
  }, []);

  return {
    queue,
    currentIndex,
    currentVideo: getCurrentVideo(),
    goToNext,
    goToPrevious,
    goToIndex,
    getPreloadedVideo,
    hasNext: currentIndex < queue.length - 1,
    hasPrevious: currentIndex > 0,
    cleanup
  };
};