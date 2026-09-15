import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings, Download, Maximize, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface VideoQuality {
  label: string;
  url: string;
  bandwidth: number;
  resolution: string;
}

interface AdaptiveVideoPlayerProps {
  videoUrl: string;
  qualities?: VideoQuality[];
  lessonId: string;
  onProgress?: (progress: number, position: number) => void;
  onComplete?: () => void;
  className?: string;
  autoplay?: boolean;
  allowDownload?: boolean;
  userId?: string;
}

// Simplified hooks for now
const useNetworkStatus = () => ({
  isOnline: navigator.onLine,
  connectionSpeed: 5,
  effectiveType: '4g'
});

const useVideoCache = () => ({
  cacheVideo: async () => {},
  getCachedVideo: async () => null,
  isVideoCached: () => false,
  downloadProgress: 0
});

const useVideoAnalytics = () => ({
  trackVideoEvent: () => {},
  analytics: {}
});

export const AdaptiveVideoPlayer: React.FC<AdaptiveVideoPlayerProps> = ({
  videoUrl,
  qualities = [],
  lessonId,
  onProgress,
  onComplete,
  className,
  autoplay = false,
  allowDownload = false,
  userId
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Custom hooks
  const { isOnline, connectionSpeed, effectiveType } = useNetworkStatus();
  const { cacheVideo, downloadProgress } = useVideoCache();
  const { trackVideoEvent } = useVideoAnalytics();

  // Auto-select quality based on network
  useEffect(() => {
    if (!selectedQuality && qualities.length > 0) {
      let defaultQuality = qualities[0]; // Lowest quality as fallback
      
      if (connectionSpeed && effectiveType) {
        if (effectiveType === '4g' && connectionSpeed > 5) {
          defaultQuality = qualities[qualities.length - 1]; // Highest quality
        } else if (effectiveType === '3g' || (connectionSpeed && connectionSpeed > 1)) {
          const midIndex = Math.floor(qualities.length / 2);
          defaultQuality = qualities[midIndex] || qualities[0];
        }
      }
      
      setSelectedQuality(defaultQuality);
    }
  }, [qualities, connectionSpeed, effectiveType, selectedQuality]);

  // Enhanced play function with network awareness
  const handlePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setHasUserInteracted(true);
    
    try {
      if (isPlaying) {
        video.pause();
      } else {
        // Check if video is ready
        if (video.readyState < 2) {
          setIsLoading(true);
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Load timeout')), 10000);
            const onCanPlay = () => {
              clearTimeout(timeout);
              video.removeEventListener('canplay', onCanPlay);
              resolve(void 0);
            };
            video.addEventListener('canplay', onCanPlay);
          });
        }

        video.muted = isMuted;
        await video.play();
        setError(null);
      }
    } catch (err: any) {
      console.error('Play error:', err);
      
      // Fallback strategies
      if (!isPlaying && !isMuted) {
        try {
          video.muted = true;
          setIsMuted(true);
          await video.play();
        } catch (fallbackErr) {
          setError(`Playback failed: ${err.message}`);
        }
      } else {
        setError(`Playback failed: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, isMuted]);

  // Network-aware retry logic
  const handleRetry = useCallback(async () => {
    if (retryCount >= 3) {
      setError('Maximum retry attempts reached. Please check your connection.');
      return;
    }

    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
    
    // Auto-downgrade quality on network issues
    if (retryCount > 0 && selectedQuality && qualities.length > 1) {
      const currentIndex = qualities.findIndex(q => q.label === selectedQuality.label);
      if (currentIndex > 0) {
        const lowerQuality = qualities[currentIndex - 1];
        setSelectedQuality(lowerQuality);
      }
    }

    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [retryCount, selectedQuality, qualities]);

  // Download for offline viewing
  const handleDownload = useCallback(async () => {
    if (!selectedQuality || !allowDownload) return;
    
    try {
      await cacheVideo();
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [selectedQuality, allowDownload, cacheVideo]);

  // Quality change handler
  const handleQualityChange = useCallback((quality: VideoQuality) => {
    const video = videoRef.current;
    if (!video || quality === selectedQuality) return;

    const currentTime = video.currentTime;
    const wasPlaying = !video.paused;
    
    setSelectedQuality(quality);
    setIsLoading(true);
    
    const onLoadedData = () => {
      video.currentTime = currentTime;
      if (wasPlaying) {
        video.play().catch(console.error);
      }
      setIsLoading(false);
      video.removeEventListener('loadeddata', onLoadedData);
    };
    
    video.addEventListener('loadeddata', onLoadedData);
    video.src = quality.url;
    video.load();
  }, [selectedQuality]);

  // Set video source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    // Set the video source - this was missing!
    video.src = selectedQuality?.url || videoUrl;
    video.load();
  }, [videoUrl, selectedQuality]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      const progress = video.duration ? (video.currentTime / video.duration) * 100 : 0;
      setCurrentTime(video.currentTime);
      onProgress?.(progress, video.currentTime);
      
      // Update buffered
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      const errorCode = target.error?.code;
      const errorMessage = target.error?.message || 'Unknown error';
      
      console.error('Video error:', { errorCode, errorMessage });
      setIsLoading(false);
      setError(`Video error (${errorCode}): ${errorMessage}`);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onProgress, onComplete]);

  // Update video source when quality changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedQuality) return;

    video.src = selectedQuality.url;
    video.load();
  }, [selectedQuality]);

  // Fullscreen handling
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [isFullscreen]);

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Control visibility
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showControls && isPlaying) {
      timer = setTimeout(() => setShowControls(false), 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showControls, isPlaying]);

  if (error && retryCount >= 3) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-lg", className)}>
        <div className="text-center p-8">
          <div className="text-destructive mb-4">
            {!isOnline ? <WifiOff className="h-12 w-12 mx-auto" /> : <div className="h-12 w-12 mx-auto bg-destructive rounded-full flex items-center justify-center">!</div>}
          </div>
          <p className="text-lg font-semibold mb-2">
            {!isOnline ? 'No Internet Connection' : 'Video Error'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={handleRetry} disabled={!isOnline}>
              {!isOnline ? 'Waiting for Connection...' : 'Retry'}
            </Button>
            <Button variant="outline" onClick={() => {
              console.log('Play offline version clicked');
            }}>
              Play Offline Version
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying || setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Network status indicator */}
      <div className="absolute top-4 right-4 z-30 flex items-center space-x-2">
        {!isOnline && (
          <div className="bg-destructive text-white px-2 py-1 rounded text-xs flex items-center">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </div>
        )}
        {effectiveType && (
          <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
            {effectiveType.toUpperCase()}
          </div>
        )}
      </div>

      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay={autoplay}
        playsInline
        preload="metadata"
        muted={isMuted}
        crossOrigin="anonymous"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
            <p className="text-lg">Loading video...</p>
            {selectedQuality && (
              <p className="text-sm opacity-75 mt-2">
                Quality: {selectedQuality.label} • {selectedQuality.resolution}
              </p>
            )}
            {downloadProgress > 0 && downloadProgress < 100 && (
              <div className="mt-2">
                <div className="w-32 h-1 bg-white/30 rounded-full mx-auto">
                  <div 
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <p className="text-xs mt-1">Downloading: {Math.round(downloadProgress)}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Center play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={handlePlay}
            size="lg"
            variant="ghost"
            className={cn(
              "h-16 w-16 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all",
              isPlaying && showControls ? "opacity-0" : "opacity-100"
            )}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress bar with buffer indicator */}
          <div className="space-y-1">
            <div className="relative">
              {/* Buffer bar */}
              <div className="absolute inset-0 h-1 bg-white/20 rounded-full">
                <div 
                  className="h-full bg-white/40 rounded-full transition-all"
                  style={{ width: `${buffered}%` }}
                />
              </div>
              {/* Progress bar */}
              <Slider
                value={[duration ? (currentTime / duration) * 100 : 0]}
                onValueChange={(value) => {
                  if (videoRef.current && value[0] !== undefined) {
                    const newTime = (value[0] / 100) * duration;
                    videoRef.current.currentTime = newTime;
                  }
                }}
                max={100}
                step={0.1}
                className="w-full cursor-pointer relative z-10"
              />
            </div>
            <div className="flex justify-between text-xs text-white/80">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={handlePlay}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    if (!isPlaying) videoRef.current.play();
                  }
                }}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => {
                    setHasUserInteracted(true);
                    setIsMuted(!isMuted);
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                    }
                  }}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={(value) => {
                      if (value[0] !== undefined && videoRef.current) {
                        const newVolume = value[0] / 100;
                        videoRef.current.volume = newVolume;
                        setVolume(newVolume);
                        if (newVolume > 0 && isMuted) {
                          setIsMuted(false);
                          videoRef.current.muted = false;
                        }
                      }
                    }}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Speed control */}
              <Select value={playbackRate.toString()} onValueChange={(value) => {
                const rate = parseFloat(value);
                setPlaybackRate(rate);
                if (videoRef.current) {
                  videoRef.current.playbackRate = rate;
                }
              }}>
                <SelectTrigger className="w-16 h-8 text-white border-white/20 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              {/* Quality selector */}
              {qualities.length > 0 && (
                <Select 
                  value={selectedQuality?.label || ''} 
                  onValueChange={(value) => {
                    const quality = qualities.find(q => q.label === value);
                    if (quality) handleQualityChange(quality);
                  }}
                >
                  <SelectTrigger className="w-20 h-8 text-white border-white/20 bg-transparent">
                    <Settings className="h-3 w-3" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualities.map((quality) => (
                      <SelectItem key={quality.label} value={quality.label}>
                        {quality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Download button */}
              {allowDownload && selectedQuality && (
                <Button
                  onClick={handleDownload}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  disabled={downloadProgress > 0}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}

              <Button
                onClick={toggleFullscreen}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};