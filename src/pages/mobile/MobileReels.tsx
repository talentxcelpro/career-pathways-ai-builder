import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOptimizedInfiniteScroll, fetchReelsData } from '@/hooks/useOptimizedInfiniteScroll';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ReelsUploadModal } from '@/components/mobile/ReelsUploadModal';
import { ReelsCommentsModal } from '@/components/mobile/ReelsCommentsModal';
import { linkifyText } from '@/utils/textUtils';
import VideoPlayer from '@/components/posts/VideoPlayer';
import { useRealtimeEngagement } from '@/hooks/useRealtimeEngagement';
import { EngagementActions } from '@/components/engagement/EngagementActions';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreHorizontal,
  UserPlus,
  Plus,
  RefreshCw,
  Send
} from 'lucide-react';

interface VideoReel {
  id: string;
  video_url: string;
  thumbnail_url?: string;
  title: string;
  description?: string;
  duration?: number;
  created_at: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    title?: string;
    company?: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  tags: string[];
  is_liked: boolean;
  is_bookmarked: boolean;
  provider?: 'youtube' | 'storage';
  provider_video_id?: string;
}

export const MobileReels = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const engagement = useRealtimeEngagement('reels');
  
  console.log('🎬 MobileReels - User:', user ? 'Authenticated' : 'Not authenticated');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedReelForComments, setSelectedReelForComments] = useState<VideoReel | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use optimized infinite scroll with real data
  const {
    items: reels,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    lastItemRef,
  } = useOptimizedInfiniteScroll({
    queryKey: ['mobile-reels-optimized', user?.id, refreshTrigger],
    fetchFunction: fetchReelsData,
    enabled: true,
    pageSize: 10,
    threshold: 500,
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
  });

  // reels array is now directly available from useOptimizedInfiniteScroll

  const extractHashtags = (content: string): string[] => {
    const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    return hashtags.map(tag => tag.substring(1)).slice(0, 3);
  };

  // Handle video play/pause when scrolling
  useEffect(() => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.play();
      } else {
        currentVideo.pause();
      }
    }
  }, [currentVideoIndex, isPlaying]);

  // Enhanced scroll handling with infinite loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentVideoIndex && newIndex < reels.length) {
      setCurrentVideoIndex(newIndex);
    }

    // Infinite scroll is now handled by intersection observer
  }, [currentVideoIndex, reels.length]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      currentVideo.muted = !isMuted;
    }
  };

  const handleLike = async (reelId: string, reelOwnerId?: string) => {
    // Skip likes for external videos from videos table
    if (reelId.startsWith('video-')) return;
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to like reels.",
        variant: "destructive",
      });
      return;
    }

    try {
      await engagement.likeContent('reel', reelId, reelOwnerId);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleComment = (reel: VideoReel) => {
    setSelectedReelForComments(reel);
    setShowCommentsModal(true);
  };

  const handleShare = (reelId: string) => {
    const reel = reels.find(r => r.id === reelId);
    if (!reel) return;

    const shareUrl = `${window.location.origin}/reel/${reelId}`;
    if (navigator.share) {
      navigator.share({
        title: reel.title,
        text: reel.description,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Reel link copied to clipboard!",
      });
    }
  };

  const handleConnect = (authorId: string) => {
    // Connect functionality
    console.log('Connect with:', authorId);
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Success!",
      description: "Your reel has been uploaded and will appear in the feed",
    });
  };

  // Show error state with fallback
  if (error) {
    console.error('🎬 Reels query error:', error);
    return (
      <div className="h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Unable to load reels</p>
          <Button onClick={() => refetch()} className="bg-purple-600 text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-sm">Loading reels...</p>
        </div>
      </div>
    );
  }

  // If no reels loaded, show fallback content
  if (!reels || reels.length === 0) {
    console.log('🎬 No reels found, showing fallback');
    return (
      <div className="h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h2 className="text-xl mb-4">Welcome to TalentXcel Reels</h2>
          <p className="mb-4">No reels available yet. Be the first to create one!</p>
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="bg-purple-600 text-white"
          >
            Create First Reel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen bg-black overflow-hidden relative">
        <div 
          ref={containerRef}
          className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
        >
          {reels.map((reel, index) => (
            <div 
              key={reel.id} 
              ref={index === reels.length - 1 ? lastItemRef : null}
              className="h-screen w-full relative snap-start flex items-center justify-center"
            >
              {/* Video */}
              {reel.provider === 'youtube' && reel.provider_video_id ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${reel.provider_video_id}?autoplay=1&mute=${isMuted ? 1 : 0}&playsinline=1&controls=1&modestbranding=1&rel=0&loop=1&playlist=${reel.provider_video_id}`}
                  title={reel.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : reel.video_url && reel.video_url.includes('supabase.co/storage') ? (
                <VideoPlayer
                  url={reel.video_url}
                  className="w-full h-full"
                  fit="cover"
                />
              ) : (
                <video
                  ref={el => videoRefs.current[index] = el}
                  className="w-full h-full object-cover"
                  src={reel.video_url}
                  poster={reel.thumbnail_url}
                  loop
                  autoPlay
                  muted={isMuted}
                  playsInline
                  preload="metadata"
                  onLoadStart={() => console.log('Video loading started:', reel.video_url)}
                  onCanPlay={() => console.log('Video can play:', reel.video_url)}
                  onError={(e) => console.error('Video error:', e, reel.video_url)}
                  onClick={togglePlayPause}
                />
              )}

              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-16 w-16 rounded-full bg-black/30 hover:bg-black/50 text-white"
                    onClick={togglePlayPause}
                  >
                    <Play className="h-8 w-8" />
                  </Button>
                </div>
              )}

              {/* Top Controls with Upload Button */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-lg">Reels</span>
                    <Badge className="bg-purple-600 text-white text-xs">
                      {currentVideoIndex + 1}/{reels.length}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-black/30 hover:bg-black/50 text-white"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-black/30 hover:bg-black/50 text-white"
                      onClick={toggleMute}
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex justify-between items-end">
                  {/* Left side - Content */}
                  <div className="flex-1 pr-4">
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10 ring-2 ring-white">
                        <AvatarImage src={reel.author.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {reel.author.first_name[0]}{reel.author.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {reel.author.first_name} {reel.author.last_name}
                        </p>
                        {reel.author.title && (
                          <p className="text-gray-300 text-sm">
                            {reel.author.title} {reel.author.company && `at ${reel.author.company}`}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full bg-white text-black hover:bg-gray-200 px-4"
                        onClick={() => handleConnect(reel.author.id)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    </div>

                    {/* Description with enhanced linking */}
                    <div className="text-white text-sm mb-2 line-clamp-3 whitespace-pre-wrap">
                      {linkifyText(reel.description || '')}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {reel.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} className="bg-white/20 text-white text-xs rounded-full">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-white text-sm">
                      <span>{reel.stats.views.toLocaleString()} views</span>
                      <span>{reel.stats.likes} likes</span>
                      <span>{reel.stats.comments} comments</span>
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex flex-col gap-4 items-center">
                    <EngagementActions
                      contentType="reel"
                      contentId={reel.id}
                      contentOwnerId={reel.author.id}
                      module="reels"
                      initialStats={{
                        likes: reel.stats.likes,
                        comments: reel.stats.comments,
                        shares: reel.stats.shares,
                        views: reel.stats.views,
                        isLiked: reel.is_liked,
                        isBookmarked: reel.is_bookmarked
                      }}
                      variant="compact"
                      className="flex-col gap-3"
                      onComment={() => handleComment(reel)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator for infinite scroll */}
          {isFetchingNextPage && (
            <div className="h-screen w-full flex items-center justify-center bg-black">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-sm">Loading more reels...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Upload Modal */}
      <ReelsUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Comments Modal */}
      {selectedReelForComments && (
        <ReelsCommentsModal
          isOpen={showCommentsModal}
          onClose={() => {
            setShowCommentsModal(false);
            setSelectedReelForComments(null);
          }}
          postId={selectedReelForComments.id}
          postAuthor={`${selectedReelForComments.author.first_name} ${selectedReelForComments.author.last_name}`}
        />
      )}
    </>
  );
};