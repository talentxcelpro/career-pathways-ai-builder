import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX, Heart, AlertCircle } from 'lucide-react';

interface VideoReelPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  isActive: boolean;
  onVideoLoad?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onDoubleTapLike?: () => void;
  muted?: boolean;
  onToggleMute?: () => void;
  className?: string;
}

export const VideoReelPlayer: React.FC<VideoReelPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  isActive,
  onVideoLoad,
  onTimeUpdate,
  onPlayStateChange,
  onDoubleTapLike,
  muted,
  onToggleMute,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState<'play' | 'pause' | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [progress, setProgress] = useState(0);

  // Persistent session audio state
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof muted === 'boolean') return muted;
    try {
      return sessionStorage.getItem('txc_reels_muted') === 'false' ? false : true;
    } catch {
      return true;
    }
  });

  const lastTapRef = useRef<number>(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep internal muted state synchronized if parent passes muted prop
  useEffect(() => {
    if (typeof muted === 'boolean') {
      setIsMuted(muted);
    }
  }, [muted]);

  // Autoplay handler when active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = isMuted;
      video.playsInline = true;
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            setError(false);
            onPlayStateChange?.(true);
          })
          .catch((err) => {
            // If browser autoplay policy blocked sound, fallback to muted immediately
            if (!video.muted) {
              video.muted = true;
              setIsMuted(true);
              video
                .play()
                .then(() => {
                  setIsPlaying(true);
                  setIsLoading(false);
                  setError(false);
                  onPlayStateChange?.(true);
                })
                .catch((muteErr) => {
                  console.warn('Autoplay error:', muteErr);
                  setIsPlaying(false);
                  onPlayStateChange?.(false);
                });
            }
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }
  }, [isActive, isMuted, onPlayStateChange]);

  const toggleMute = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (video) {
      video.muted = nextMuted;
      if (!nextMuted && video.paused && isActive) {
        video.play().catch(() => {});
      }
    }

    try {
      sessionStorage.setItem('txc_reels_muted', nextMuted ? 'true' : 'false');
    } catch {}

    onToggleMute?.();
  }, [isMuted, isActive, onToggleMute]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        setShowCenterIcon('play');
        setTimeout(() => setShowCenterIcon(null), 600);
        onPlayStateChange?.(true);
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      setShowCenterIcon('pause');
      setTimeout(() => setShowCenterIcon(null), 600);
      onPlayStateChange?.(false);
    }
  }, [onPlayStateChange]);

  // Click & Double-Tap detection
  const handleVideoTap = useCallback((e: React.MouseEvent) => {
    // Avoid double-tap when clicking interactive buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
      onDoubleTapLike?.();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      tapTimerRef.current = setTimeout(() => {
        togglePlayPause();
      }, DOUBLE_TAP_DELAY);
    }
  }, [togglePlayPause, onDoubleTapLike]);

  const handleLoadedData = () => {
    setIsLoading(false);
    onVideoLoad?.();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      const current = video.currentTime;
      const duration = video.duration || 1;
      setProgress((current / duration) * 100);
      onTimeUpdate?.(current);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div
      className={cn("relative w-full h-full bg-black select-none overflow-hidden cursor-pointer", className)}
      onClick={handleVideoTap}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        preload="auto"
        onLoadedData={handleLoadedData}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-10 pointer-events-none">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white z-20 pointer-events-none p-4 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
          <p className="text-sm font-semibold">Video preview unavailable</p>
          <p className="text-xs text-white/60 mt-1">Tap to browse next reel</p>
        </div>
      )}

      {/* Always-Visible Sleek Volume Pill (Top Right) */}
      <div className="absolute top-14 right-4 z-40">
        <button
          type="button"
          onClick={toggleMute}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-medium border border-white/15 transition-transform active:scale-95 shadow-md"
          aria-label={isMuted ? "Unmute reel" : "Mute reel"}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] text-white/90">Sound Off</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-300">Sound On</span>
            </>
          )}
        </button>
      </div>

      {/* Central Play/Pause Tap Animation */}
      {showCenterIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 text-white animate-in zoom-in-75 fade-out-0 duration-500 shadow-2xl">
            {showCenterIcon === 'play' ? (
              <Play className="w-8 h-8 fill-white ml-1" />
            ) : (
              <Pause className="w-8 h-8 fill-white" />
            )}
          </div>
        </div>
      )}

      {/* Double Tap Heart Burst Animation */}
      {showHeartBurst && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <Heart className="w-28 h-28 text-rose-500 fill-rose-500 animate-in zoom-in-50 fade-out-0 duration-700 drop-shadow-[0_10px_20px_rgba(244,63,94,0.6)]" />
        </div>
      )}

      {/* Progress Bar along bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};