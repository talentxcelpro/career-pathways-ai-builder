import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Settings,
  Subtitles,
  Download,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoPlayerProps {
  src: string;
  title: string;
  duration?: number;
  thumbnail?: string;
  subtitles?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  duration = 0,
  thumbnail,
  subtitles,
  onProgress,
  onComplete,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [quality, setQuality] = useState('auto');

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-hide controls
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progress = (video.currentTime / video.duration) * 100;
      onProgress?.(progress);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
      toast.success('Video completed!');
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [onProgress, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          skipBackward();
          break;
        case 'ArrowRight':
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        await videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Video play/pause error:', error);
      toast.error('Video playback error');
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        videoDuration
      );
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0
      );
    }
  };

  const changeVolume = (delta: number) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const seekTo = (percentage: number) => {
    if (videoRef.current) {
      const newTime = (percentage / 100) * videoDuration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      toast.success(`Playback speed: ${rate}x`);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadVideo = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `${title}.mp4`;
    link.click();
    toast.success('Download started');
  };

  const shareVideo = async () => {
    try {
      await navigator.share({
        title: title,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Video URL copied to clipboard');
    }
  };

  return (
    <Card className={`relative overflow-hidden group ${className}`}>
      <CardContent className="p-0">
        <div 
          className="relative aspect-video bg-black"
          onMouseMove={resetControlsTimeout}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster={thumbnail}
            preload="metadata"
            playsInline
          >
            <source src={src} type="video/mp4" />
            {subtitles && (
              <track
                kind="subtitles"
                src={subtitles}
                srcLang="en"
                label="English"
                default
              />
            )}
            Your browser does not support the video tag.
          </video>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {/* Click to Play Overlay */}
          {!isPlaying && !isLoading && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
              onClick={togglePlay}
            >
              <Button size="lg" className="rounded-full w-16 h-16">
                <Play className="h-8 w-8" />
              </Button>
            </div>
          )}

          {/* Controls Overlay */}
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <h3 className="text-white font-medium truncate">{title}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setQuality(quality === 'auto' ? '720p' : 'auto')}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={shareVideo}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={downloadVideo}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Center Controls */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={skipBackward}
                >
                  <SkipBack className="h-6 w-6" />
                </Button>
                <Button
                  size="lg"
                  className="rounded-full w-12 h-12"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={skipForward}
                >
                  <SkipForward className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4 space-y-3">
              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <span className="text-white text-sm min-w-[40px]">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[(currentTime / videoDuration) * 100]}
                  max={100}
                  step={0.1}
                  className="flex-1"
                  onValueChange={(value) => seekTo(value[0])}
                />
                <span className="text-white text-sm min-w-[40px]">
                  {formatTime(videoDuration)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    className="w-20"
                    onValueChange={(value) => {
                      const newVolume = value[0] / 100;
                      if (videoRef.current) {
                        videoRef.current.volume = newVolume;
                        videoRef.current.muted = newVolume === 0;
                      }
                    }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Playback Speed */}
                  <select
                    value={playbackRate}
                    onChange={(e) => changePlaybackRate(Number(e.target.value))}
                    className="bg-transparent text-white text-sm border border-white/20 rounded px-2 py-1"
                  >
                    <option value={0.5} className="text-black">0.5x</option>
                    <option value={0.75} className="text-black">0.75x</option>
                    <option value={1} className="text-black">1x</option>
                    <option value={1.25} className="text-black">1.25x</option>
                    <option value={1.5} className="text-black">1.5x</option>
                    <option value={2} className="text-black">2x</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Subtitles className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};