import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
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

  // Enhanced infinite scrolling reels fetch
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery<VideoReel[], Error, VideoReel[], any, number>({
    queryKey: ['mobile-reels-infinite', user?.id, refreshTrigger],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('🎬 Fetching reels page:', pageParam, 'User:', user?.id);
      const limit = 10;
      const page = typeof pageParam === 'number' ? pageParam : Number(pageParam) || 0;
      const offset = page * limit;
      
      try {
        // First get posts with video media from posts table
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            created_at,
            media_urls,
            author_id,
            likes_count,
            comments_count,
            shares_count,
            tags,
            visibility,
            is_deleted
          `)
          .eq('visibility', 'public')
          .eq('is_deleted', false)
          .not('media_urls', 'is', null)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (postsError) {
          console.error('🎬 Posts query error:', postsError);
          throw postsError;
        }

        console.log('🎬 Raw posts data:', postsData?.length || 0, 'posts found');

        // Get unique author IDs
        const authorIds = [...new Set((postsData || []).map(post => post.author_id))];
        console.log('🎬 Author IDs to fetch:', authorIds.length);
        
        // Fetch author profiles separately
        let profilesData = [];
        if (authorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, profile_picture_url, headline, current_company')
            .in('id', authorIds);
          profilesData = profiles || [];
        }

        console.log('🎬 Profiles fetched:', profilesData.length);

        // Create a map of profiles for quick lookup
        const profilesMap = new Map(
          profilesData.map(profile => [profile.id, profile])
        );

        // Filter and transform posts with videos
        const videoReels = (postsData || [])
          .filter((post: any) => {
            const media = (post.media_urls || []) as string[];
            const hasVideo = media.some((m) => /\.(mp4|mov|webm|avi)$/i.test(m));
            console.log('🎬 Post', post.id, 'has video:', hasVideo, 'media:', media);
            return hasVideo;
          })
          .map((post: any) => {
            const media = (post.media_urls || []) as string[];
            const firstVideo = media.find((m) => /\.(mp4|mov|webm|avi)$/i.test(m)) || '';
            const profile = profilesMap.get(post.author_id);
            
            console.log('🎬 Processing post:', post.id, 'video:', firstVideo);
            
            return {
              id: post.id,
              video_url: firstVideo,
              thumbnail_url: undefined,
              title: (post.content || '').split('\n')[0] || 'Professional Reel',
              description: post.content,
              created_at: post.created_at,
              author: {
                id: post.author_id || '',
                first_name: profile?.full_name?.split(' ')[0] || 'Professional',
                last_name: profile?.full_name?.split(' ').slice(1).join(' ') || 'User',
                avatar_url: profile?.profile_picture_url,
                title: profile?.headline || 'TalentXcel Member',
                company: profile?.current_company || 'TalentXcel',
              },
              stats: {
                likes: post.likes_count || Math.floor(Math.random() * 500) + 50,
                comments: post.comments_count || Math.floor(Math.random() * 100) + 10,
                shares: post.shares_count || Math.floor(Math.random() * 50) + 5,
                views: Math.floor(Math.random() * 10000) + 500,
              },
              tags: post.tags || extractHashtags(post.content || ''),
              is_liked: false,
              is_bookmarked: false,
            } as VideoReel;
          });

        console.log('🎬 Final video reels:', videoReels.length);

        // Combine with published videos from Edge Function on first page
        let combinedReels: VideoReel[] = [...videoReels];
        if (pageParam === 0) {
          const { data: ytData, error: ytErr } = await supabase.functions.invoke('yt-feed');
          if (ytErr) {
            console.warn('🎬 yt-feed error:', ytErr);
          } else {
            const ytReels: VideoReel[] = (ytData as any[] | null || []).map((v: any) => ({
              id: `video-${v.id}`,
              video_url: '',
              thumbnail_url: v.thumbnail_url || undefined,
              title: v.title || 'Video',
              description: v.caption || '',
              created_at: v.created_at,
              author: {
                id: 'talentxcel',
                first_name: 'TalentXcel',
                last_name: 'Video',
                avatar_url: undefined,
                title: 'Curated Video',
                company: 'TalentXcel',
              },
              stats: {
                likes: Math.floor(Math.random() * 500) + 50,
                comments: Math.floor(Math.random() * 100) + 10,
                shares: Math.floor(Math.random() * 50) + 5,
                views: Math.floor(Math.random() * 10000) + 500,
              },
              tags: [],
              is_liked: false,
              is_bookmarked: false,
              provider: 'youtube',
              provider_video_id: v.provider_video_id || '',
            }));
            combinedReels = [...ytReels, ...combinedReels];
          }
        }

        if (combinedReels.length > 0) {
          return combinedReels;
        }

        // Fallback: Return sample data only if no real videos found and it's the first page
        if (pageParam === 0) {
          console.log('🎬 No real videos found, providing sample content');
          return [{
            id: 'sample-1',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnail_url: undefined,
            title: 'Welcome to TalentXcel Reels',
            description: 'Share your professional journey and connect with talent worldwide! 🚀 #TalentXcel #Professional #Career',
            created_at: new Date().toISOString(),
            author: {
              id: 'system',
              first_name: 'TalentXcel',
              last_name: 'Team',
              avatar_url: undefined,
              title: 'Professional Platform',
              company: 'TalentXcel',
            },
            stats: {
              likes: 1250,
              comments: 89,
              shares: 45,
              views: 15000,
            },
            tags: ['TalentXcel', 'Professional', 'Career'],
            is_liked: false,
            is_bookmarked: false,
            provider: 'storage',
          }];
        }

        // For subsequent pages with no data, return empty array
        return [];
      } catch (error) {
        console.error('🎬 Query failed:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 10 ? pages.length : undefined;
    },
    initialPageParam: 0,
    enabled: true // Enable regardless of user state to show sample data
  });

  // Flatten all pages into single array
  const d: any = data as any;
  const reels: VideoReel[] = Array.isArray(d)
    ? (d as VideoReel[])
    : Array.isArray(d?.pages)
      ? (d.pages as VideoReel[][]).flat()
      : [];

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

    // Load more when near the end
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      scrollTop + container.clientHeight >= container.scrollHeight - 1000
    ) {
      fetchNextPage();
    }
  }, [currentVideoIndex, reels.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  const handleLike = async (reelId: string) => {
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
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', reelId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', reelId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: reelId,
            user_id: user.id
          });
      }
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-black/30 hover:bg-black/50 text-white relative"
                      onClick={() => handleLike(reel.id)}
                    >
                      <Heart className={`h-6 w-6 ${reel.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="absolute -bottom-6 text-xs">{reel.stats.likes}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-black/30 hover:bg-black/50 text-white relative"
                      onClick={() => handleComment(reel)}
                    >
                      <MessageCircle className="h-6 w-6" />
                      <span className="absolute -bottom-6 text-xs">{reel.stats.comments}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-black/30 hover:bg-black/50 text-white relative"
                      onClick={() => handleShare(reel.id)}
                    >
                      <Share className="h-6 w-6" />
                      <span className="absolute -bottom-6 text-xs">{reel.stats.shares}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-black/30 hover:bg-black/50 text-white"
                      onClick={() => console.log('Bookmark reel:', reel.id)}
                    >
                      <Bookmark className={`h-6 w-6 ${reel.is_bookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    </Button>
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