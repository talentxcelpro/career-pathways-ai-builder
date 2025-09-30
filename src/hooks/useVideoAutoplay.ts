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
    threshold = 0.5,
    rootMargin = '0px',
    enableSound = true,
    preloadNext = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(!enableSound);
  const [error, setError] = useState<string | null>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [canPlayWithSound, setCanPlayWithSound] = useState(false);

  const startTimeRef = useRef<number>(0);
  const [containerRef, isIntersecting] = useIntersectionObserver({
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

  // Enhanced auto play/pause with sound detection
  useEffect(() => {
    if (!videoElement || error) return;

    const playVideo = async () => {
      try {
        // First try to play with sound if user has interacted and sound is enabled
        if (hasUserInteracted && enableSound && !isMuted) {
          videoElement.muted = false;
          await videoElement.play();
          setCanPlayWithSound(true);
          console.log('Playing with sound after user interaction');
        } else {
          // Fallback to muted autoplay
          videoElement.muted = true;
          await videoElement.play();
          console.log('Playing muted for autoplay policy compliance');
        }
      } catch (err) {
        console.error('Failed to autoplay video:', err);
        // Try muted as fallback
        try {
          videoElement.muted = true;
          setIsMuted(true);
          await videoElement.play();
        } catch (mutedErr) {
          console.error('Even muted autoplay failed:', mutedErr);
          setError('Autoplay failed');
        }
      }
    };

    if (isVisible) {
      playVideo();
    } else {
      videoElement.pause();
    }
  }, [isVisible, videoElement, error, isMuted, hasUserInteracted, enableSound]);

  // Enhanced toggle play/pause with user interaction
  const togglePlay = useCallback(async () => {
    if (!videoElement || error) return;

    setHasUserInteracted(true);
    
    try {
      if (isPlaying) {
        videoElement.pause();
      } else {
        // If user is playing and sound is enabled, try with sound
        if (enableSound && !isMuted) {
          videoElement.muted = false;
          setCanPlayWithSound(true);
        }
        await videoElement.play();
        console.log('User initiated play');
      }
    } catch (err) {
      console.error('Failed to toggle video:', err);
      setError('Playback failed');
    }
  }, [videoElement, isPlaying, error, enableSound, isMuted]);

  // Enhanced toggle mute with user interaction tracking
  const toggleMute = useCallback(() => {
    if (!videoElement) return;
    
    setHasUserInteracted(true);
    const newMuted = !isMuted;
    videoElement.muted = newMuted;
    setIsMuted(newMuted);
    
    // If unmuting, try to enable sound
    if (!newMuted && enableSound) {
      setCanPlayWithSound(true);
      console.log('User unmuted - sound enabled');
    }
  }, [videoElement, isMuted, enableSound]);

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
    hasUserInteracted,
    canPlayWithSound,
    togglePlay,
    toggleMute,
    reset
  };
};