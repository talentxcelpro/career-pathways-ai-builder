import { useEffect, useRef, useCallback, useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface VideoAutoplayOptions {
  threshold?: number;
  rootMargin?: string;
  enableSound?: boolean;
  preloadNext?: boolean;
}

export const useVideoAutoplay = (
  videoElement: HTMLVideoElement | null,
  options: VideoAutoplayOptions = {}
) => {
  const {
    threshold = 0.75,
    rootMargin = '50px',
    enableSound = false,
    preloadNext = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(!enableSound);
  const [error, setError] = useState<string | null>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const { isIntersecting } = useIntersectionObserver({
    element: containerRef.current,
    threshold,
    rootMargin
  });

  // Update visibility state
  useEffect(() => {
    setIsVisible(isIntersecting);
  }, [isIntersecting]);

  // Handle video play/pause based on visibility
  useEffect(() => {
    if (!videoElement) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setHasStartedPlaying(true);
      startTimeRef.current = Date.now();
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (startTimeRef.current > 0) {
        const sessionTime = Date.now() - startTimeRef.current;
        setWatchTime(prev => prev + sessionTime);
        startTimeRef.current = 0;
      }
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setError('Failed to load video');
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setError(null);
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('loadstart', handleLoadStart);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadstart', handleLoadStart);
    };
  }, [videoElement]);

  // Auto play/pause based on visibility
  useEffect(() => {
    if (!videoElement || error) return;

    const playVideo = async () => {
      try {
        videoElement.muted = isMuted;
        await videoElement.play();
      } catch (err) {
        console.error('Failed to autoplay video:', err);
        setError('Autoplay failed');
      }
    };

    if (isVisible) {
      playVideo();
    } else {
      videoElement.pause();
    }
  }, [isVisible, videoElement, error, isMuted]);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    if (!videoElement || error) return;

    try {
      if (isPlaying) {
        videoElement.pause();
      } else {
        await videoElement.play();
      }
    } catch (err) {
      console.error('Failed to toggle video:', err);
      setError('Playback failed');
    }
  }, [videoElement, isPlaying, error]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!videoElement) return;
    
    const newMuted = !isMuted;
    videoElement.muted = newMuted;
    setIsMuted(newMuted);
  }, [videoElement, isMuted]);

  // Reset function
  const reset = useCallback(() => {
    setIsPlaying(false);
    setError(null);
    setWatchTime(0);
    setHasStartedPlaying(false);
    startTimeRef.current = 0;
  }, []);

  return {
    containerRef,
    isVisible,
    isPlaying,
    isMuted,
    error,
    watchTime,
    hasStartedPlaying,
    togglePlay,
    toggleMute,
    reset
  };
};