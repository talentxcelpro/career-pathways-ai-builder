import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Music, Play, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { VideoReelPlayer } from './VideoReelPlayer';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { supabase } from '@/integrations/supabase/client';

interface Reel {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  video: {
    url: string;
    thumbnail: string;
    duration: number;
  };
  caption: string;
  hashtags: string[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  isLiked: boolean;
}

interface InfiniteReelsFeedProps {
  onUploadClick: () => void;
}

export const InfiniteReelsFeed: React.FC<InfiniteReelsFeedProps> = ({ onUploadClick }) => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const { triggerHaptic } = useHapticFeedback();

  // Helper function to extract hashtags from content
  const extractHashtags = (content: string): string[] => {
    const hashtags = content.match(/#[\w]+/g) || [];
    return hashtags.slice(0, 5); // Limit to 5 hashtags
  };

  // Load ONLY real videos from database - NO MOCK CONTENT
  useEffect(() => {
    const loadRealVideos = async () => {
      try {
        console.log('🔍 Loading REAL videos from database (no mock content)...');
        
        const { data: posts, error } = await supabase
          .from('posts')
          .select(`
            id, 
            content, 
            media_urls, 
            created_at,
            user_id,
            likes_count,
            comments_count,
            shares_count,
            views_count,
            profiles!posts_user_id_fkey (
              full_name,
              profile_picture_url
            )
          `)
          .not('media_urls', 'is', null)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('❌ Database error:', error);
          setReels([]);
          setLoading(false);
          return;
        }

        console.log('📦 Posts found:', posts?.length || 0);

        if (posts && posts.length > 0) {
          // Filter ONLY posts that have MP4 videos
          const videoReels = posts
            .filter(post => {
              const hasVideos = post.media_urls && 
                Array.isArray(post.media_urls) && 
                post.media_urls.some((url: string) => url?.includes('.mp4'));
              
              if (hasVideos) {
                console.log(`✅ Found video in post ${post.id}:`, post.media_urls);
              }
              return hasVideos;
            })
            .map((post, index): Reel => {
              const videoUrl = post.media_urls.find((url: string) => url?.includes('.mp4')) || '';
              const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
              
              return {
                id: post.id,
                user: {
                  id: post.user_id,
                  name: profile?.full_name || 'TalentXcel User',
                  username: `@${(profile?.full_name || 'user').toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}`,
                  avatar: profile?.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=6366f1&color=fff`,
                  verified: post.user_id === '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'
                },
                video: {
                  url: videoUrl,
                  thumbnail: '',
                  duration: 30
                },
                caption: post.content || '',
                hashtags: extractHashtags(post.content || ''),
                stats: {
                  likes: post.likes_count || 0,
                  comments: post.comments_count || 0,
                  shares: post.shares_count || 0,
                  views: post.views_count || 0
                },
                isLiked: false
              };
            });

          console.log(`🎬 Created ${videoReels.length} real video reels`);
          setReels(videoReels);
        } else {
          console.log('📭 No posts found in database');
          setReels([]);
        }
      } catch (error) {
        console.error('💥 Error loading videos:', error);
        setReels([]);
      } finally {
        setLoading(false);
      }
    };

    loadRealVideos();
  }, []);

  const nextReel = useCallback(() => {
    if (currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(prev => prev + 1);
      triggerHaptic('light');
    }
  }, [currentReelIndex, reels.length, triggerHaptic]);

  const prevReel = useCallback(() => {
    if (currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
      triggerHaptic('light');
    }
  }, [currentReelIndex, triggerHaptic]);

  const swipeHandlers = useSwipeGestures({
    onSwipeUp: nextReel,
    onSwipeDown: prevReel,
    onDoubleTap: () => reels[currentReelIndex] && handleLike(reels[currentReelIndex].id),
    threshold: 30,
    velocity: 0.2
  });

  const handleLike = useCallback((reelId: string) => {
    triggerHaptic('light');
    toast.success('Liked!');
    
    // Update like state locally
    setReels(prev => prev.map(reel => 
      reel.id === reelId 
        ? { 
            ...reel, 
            isLiked: !reel.isLiked,
            stats: { 
              ...reel.stats, 
              likes: reel.isLiked ? reel.stats.likes - 1 : reel.stats.likes + 1 
            }
          }
        : reel
    ));
  }, [triggerHaptic]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-sm">Loading your content...</p>
        </div>
      </div>
    );
  }

  // Empty state - no real content found
  if (reels.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center px-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">No Video Content Found</h3>
          <p className="text-gray-400 text-sm mb-6">
            Upload some videos to your posts to see them here as reels
          </p>
          <Button 
            onClick={onUploadClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            Upload Your First Reel
          </Button>
        </div>
      </div>
    );
  }

  // Real content display
  return (
    <div 
      className="w-full h-screen overflow-hidden bg-black"
      {...swipeHandlers}
    >
      <div 
        className="flex flex-col transition-transform duration-300 ease-out"
        style={{ 
          transform: `translateY(-${currentReelIndex * 100}vh)`,
          height: `${reels.length * 100}vh`
        }}
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="relative w-full h-screen flex-shrink-0 bg-black overflow-hidden">
            <VideoReelPlayer
              videoUrl={reel.video.url}
              thumbnailUrl={reel.video.thumbnail}
              isActive={index === currentReelIndex}
              onPlayStateChange={(playing) => setIsPlaying(playing)}
              muted={isMuted}
              className="absolute inset-0 w-full h-full"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* User Info */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10 ring-2 ring-white/30">
                    <AvatarImage src={reel.user.avatar} alt={reel.user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {reel.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{reel.user.name}</p>
                      <p className="text-gray-300 text-xs">{reel.user.username}</p>
                    </div>
                    {reel.user.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-black"
                >
                  Follow
                </Button>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-4 left-4 right-20 z-10">
              <div className="mb-4">
                <p className="text-white text-sm leading-relaxed mb-2 line-clamp-3">{reel.caption}</p>
                {reel.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {reel.hashtags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-blue-300 text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 bg-black/30 rounded-full px-3 py-1 w-fit">
                <Music className="w-3 h-3 text-white" />
                <span className="text-white text-xs">Original Audio</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-20 right-4 z-10 flex flex-col space-y-4">
              <div className="flex flex-col items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className={`w-12 h-12 rounded-full ${reel.isLiked ? 'text-red-500' : 'text-white'} hover:bg-white/20`}
                  onClick={() => handleLike(reel.id)}
                >
                  <Heart className={`w-6 h-6 ${reel.isLiked ? 'fill-current' : ''}`} />
                </Button>
                <span className="text-white text-xs font-medium">
                  {reel.stats.likes > 0 ? reel.stats.likes : ''}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12 rounded-full text-white hover:bg-white/20"
                >
                  <MessageCircle className="w-6 h-6" />
                </Button>
                <span className="text-white text-xs font-medium">
                  {reel.stats.comments > 0 ? reel.stats.comments : ''}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12 rounded-full text-white hover:bg-white/20"
                >
                  <Share2 className="w-6 h-6" />
                </Button>
                <span className="text-white text-xs font-medium">
                  {reel.stats.shares > 0 ? reel.stats.shares : ''}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12 rounded-full text-white hover:bg-white/20"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10">
              <div 
                className="h-full bg-white transition-all duration-100"
                style={{ width: index === currentReelIndex ? '100%' : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reel Indicators */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-2">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-colors cursor-pointer ${
              index === currentReelIndex ? 'bg-white' : 'bg-white/30'
            }`}
            onClick={() => setCurrentReelIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};