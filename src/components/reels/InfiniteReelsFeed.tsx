import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';
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

  // Load real videos from database
  useEffect(() => {
    const loadRealVideos = async () => {
      try {
        const { data: posts } = await supabase
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

        if (posts) {
          // Filter posts that have MP4 videos
          const videoReels = posts
            .filter(post => 
              post.media_urls && 
              Array.isArray(post.media_urls) && 
              post.media_urls.some((url: string) => url?.includes('.mp4'))
            )
            .map((post, index): Reel => {
              const videoUrl = post.media_urls.find((url: string) => url?.includes('.mp4')) || '';
              const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
              
              return {
                id: post.id,
                user: {
                  id: post.user_id,
                  name: profile?.full_name || 'TalentXcel User',
                  username: `@${(profile?.full_name || 'user').toLowerCase().replace(/\s+/g, '')}`,
                  avatar: profile?.profile_picture_url || `https://images.unsplash.com/photo-${1500000000 + index}?w=150&h=150&fit=crop`,
                  verified: post.user_id === '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062' // Your user ID
                },
                video: {
                  url: videoUrl,
                  thumbnail: '', // We'll use the video itself as thumbnail
                  duration: 30 + (index * 5) // Estimated duration
                },
                caption: post.content || 'Check out this amazing content! 🚀',
                hashtags: extractHashtags(post.content || ''),
                stats: {
                  likes: post.likes_count || Math.floor(Math.random() * 10000) + 1000,
                  comments: post.comments_count || Math.floor(Math.random() * 500) + 50,
                  shares: post.shares_count || Math.floor(Math.random() * 200) + 20,
                  views: post.views_count || Math.floor(Math.random() * 50000) + 5000
                },
                isLiked: Math.random() > 0.7
              };
            });

          if (videoReels.length > 0) {
            setReels(videoReels);
          } else {
            // Fallback to working test videos if no real videos found
            setReels([
              {
                id: 'fallback-1',
                user: {
                  id: 'user-1',
                  name: 'TalentXcel Demo',
                  username: '@talentxcel',
                  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b60e9077?w=150&h=150&fit=crop',
                  verified: true
                },
                video: {
                  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                  thumbnail: 'https://images.unsplash.com/photo-1551818255-e6e10975cd5d?w=400&h=600&fit=crop',
                  duration: 30
                },
                caption: 'Welcome to TalentXcel! 🚀 Your career growth platform #TalentXcel #CareerGrowth',
                hashtags: ['#TalentXcel', '#CareerGrowth', '#Platform'],
                stats: { likes: 12500, comments: 340, shares: 890, views: 45600 },
                isLiked: false
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error loading real videos:', error);
        // Fallback videos
        setReels([
          {
            id: 'fallback-1',
            user: {
              id: 'user-1',
              name: 'TalentXcel Demo',
              username: '@talentxcel',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b60e9077?w=150&h=150&fit=crop',
              verified: true
            },
            video: {
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              thumbnail: 'https://images.unsplash.com/photo-1551818255-e6e10975cd5d?w=400&h=600&fit=crop',
              duration: 30
            },
            caption: 'Welcome to TalentXcel! 🚀 Your career growth platform #TalentXcel #CareerGrowth',
            hashtags: ['#TalentXcel', '#CareerGrowth', '#Platform'],
            stats: { likes: 12500, comments: 340, shares: 890, views: 45600 },
            isLiked: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadRealVideos();
  }, []);

  const nextReel = useCallback(() => {
    setCurrentReelIndex(prev => 
      prev < reels.length - 1 ? prev + 1 : prev
    );
    triggerHaptic('light');
  }, [triggerHaptic, reels.length]);

  const prevReel = useCallback(() => {
    setCurrentReelIndex(prev => prev > 0 ? prev - 1 : prev);
    triggerHaptic('light');
  }, [triggerHaptic]);

  const swipeHandlers = useSwipeGestures({
    onSwipeUp: nextReel,
    onSwipeDown: prevReel,
    onDoubleTap: () => handleLike(reels[currentReelIndex]?.id),
    threshold: 30,
    velocity: 0.2
  });

  const handleLike = useCallback((reelId: string) => {
    triggerHaptic('light');
    toast.success('Liked!');
  }, [triggerHaptic]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    triggerHaptic('light');
  }, [isPlaying, triggerHaptic]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

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
                <div className="flex flex-wrap gap-1">
                  {reel.hashtags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-blue-300 text-xs">{tag}</span>
                  ))}
                </div>
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
                  {reel.stats.likes > 1000 ? `${(reel.stats.likes / 1000).toFixed(1)}K` : reel.stats.likes}
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
                  {reel.stats.comments > 1000 ? `${(reel.stats.comments / 1000).toFixed(1)}K` : reel.stats.comments}
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
                  {reel.stats.shares > 1000 ? `${(reel.stats.shares / 1000).toFixed(1)}K` : reel.stats.shares}
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