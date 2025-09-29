import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { VideoProgressIndicator } from './VideoProgressIndicator';
import { VideoErrorFallback } from './VideoErrorFallback';
import { useVideoAutoplay } from '@/hooks/useVideoAutoplay';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Heart, 
  MessageCircle, 
  Share2, 
  Flag,
  User,
  Calendar,
  Eye,
  ThumbsUp
} from 'lucide-react';

interface VideoPlayerProps {
  videoIntro: {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url?: string;
    duration: number;
    views_count: number;
    likes_count: number;
    user_name: string;
    user_avatar?: string;
    user_title: string;
    created_at: string;
    tags?: string[];
  };
  autoplay?: boolean;
  showControls?: boolean;
  className?: string;
  onLike?: (videoId: string) => void;
  onShare?: (videoId: string) => void;
  onComment?: (videoId: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoIntro,
  autoplay = false,
  showControls = true,
  className = '',
  onLike,
  onShare,
  onComment
}) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(videoIntro.likes_count);

  const {
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
  } = useVideoAutoplay(videoRef.current, {
    threshold: 0.5,
    enableSound: true,
    preloadNext: true
  });

  useEffect(() => {
    if (autoplay && isVisible && !hasStartedPlaying) {
      togglePlay();
    }
  }, [autoplay, isVisible, hasStartedPlaying, togglePlay]);

  const handleLike = useCallback(async () => {
    if (hasLiked) return;
    
    setHasLiked(true);
    setCurrentLikes(prev => prev + 1);
    
    try {
      await onLike?.(videoIntro.id);
      toast({
        title: "Liked!",
        description: "You liked this video introduction",
      });
    } catch (error) {
      // Revert on error
      setHasLiked(false);
      setCurrentLikes(prev => prev - 1);
      toast({
        title: "Error",
        description: "Failed to like the video",
        variant: "destructive"
      });
    }
  }, [hasLiked, videoIntro.id, onLike, toast]);

  const handleShare = useCallback(async () => {
    try {
      const shareData = {
        title: videoIntro.title,
        text: `Check out this video introduction by ${videoIntro.user_name}`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied",
          description: "Video link copied to clipboard",
        });
      }

      onShare?.(videoIntro.id);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [videoIntro, onShare, toast]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [containerRef]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (error) {
    return (
      <VideoErrorFallback
        error={error}
        onRetry={reset}
        className={className}
      />
    );
  }

  return (
    <Card ref={containerRef} className={`overflow-hidden group ${className}`}>
      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoIntro.video_url}
          poster={videoIntro.thumbnail_url}
          className="w-full h-full object-cover"
          playsInline
          preload="metadata"
        />

        {/* Play/Pause Overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          {!isPlaying && (
            <Button
              size="lg"
              className="bg-white/90 hover:bg-white text-black rounded-full w-16 h-16 opacity-80 hover:opacity-100 transition-all duration-200"
            >
              <Play className="h-6 w-6 ml-1" />
            </Button>
          )}
        </div>

        {/* Video Controls */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Progress Bar */}
            <VideoProgressIndicator
              currentTime={videoRef.current?.currentTime || 0}
              duration={videoIntro.duration}
              className="mb-3"
            />

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <span className="text-white text-sm font-medium">
                  {formatTime(Math.floor(videoRef.current?.currentTime || 0))} / {formatTime(videoIntro.duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-white hover:bg-white/20"
                >
                  Info
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video Info Overlay */}
        {showInfo && (
          <div className="absolute top-4 left-4 right-4 bg-black/80 backdrop-blur-sm text-white rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {videoIntro.user_avatar ? (
                  <img src={videoIntro.user_avatar} alt={videoIntro.user_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-1">{videoIntro.title}</h3>
                <p className="text-xs text-gray-300 mb-1">{videoIntro.user_name} • {videoIntro.user_title}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {videoIntro.views_count.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(videoIntro.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Info Section */}
      <div className="p-4 space-y-4">
        {/* User Info */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
            {videoIntro.user_avatar ? (
              <img src={videoIntro.user_avatar} alt={videoIntro.user_name} className="w-full h-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-2">{videoIntro.title}</h3>
            <p className="text-sm text-muted-foreground">{videoIntro.user_name} • {videoIntro.user_title}</p>
          </div>
        </div>

        {/* Description */}
        {videoIntro.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {videoIntro.description}
          </p>
        )}

        {/* Tags */}
        {videoIntro.tags && videoIntro.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {videoIntro.tags.slice(0, 5).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLike}
              className={`flex items-center gap-2 ${hasLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{currentLikes}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onComment?.(videoIntro.id)}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">Comment</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{videoIntro.views_count.toLocaleString()} views</span>
          </div>
        </div>
      </div>
    </Card>
  );
};