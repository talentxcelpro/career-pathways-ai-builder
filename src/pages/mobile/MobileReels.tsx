import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  UserPlus
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
}

export const MobileReels = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Fetch real video reels from Supabase posts with media
  const { data: reels = [], isLoading } = useQuery({
    queryKey: ['mobile-reels', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          media_urls,
          author_id,
          profiles!posts_author_id_fkey(
            id,
            full_name,
            profile_picture_url,
            headline,
            current_company
          )
        `)
        .not('media_urls', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data as any[])
        .filter((post: any) => {
          const media = (post.media_urls || []) as string[];
          return media.some((m) => /\.(mp4|mov|webm)$/i.test(m));
        })
        .map((post: any) => {
          const media = (post.media_urls || []) as string[];
          const firstVideo = media.find((m) => /\.(mp4|mov|webm)$/i.test(m)) || '';
          return {
            id: post.id,
            video_url: firstVideo,
            thumbnail_url: undefined,
            title: (post.content || '').split('\n')[0] || 'Career Video',
            description: post.content,
            created_at: post.created_at,
            author: {
              id: post.profiles?.id || post.author_id || '',
              first_name: post.profiles?.full_name?.split(' ')[0] || 'Anonymous',
              last_name: post.profiles?.full_name?.split(' ').slice(1).join(' ') || 'User',
              avatar_url: post.profiles?.profile_picture_url,
              title: post.profiles?.headline,
              company: post.profiles?.current_company,
            },
            stats: {
              likes: Math.floor(Math.random() * 500) + 50,
              comments: Math.floor(Math.random() * 100) + 10,
              shares: Math.floor(Math.random() * 50) + 5,
              views: Math.floor(Math.random() * 10000) + 500,
            },
            tags: extractHashtags(post.content || ''),
            is_liked: false,
            is_bookmarked: false,
          } as VideoReel;
        });
    },
    enabled: !!user
  });

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

  // Handle scroll to change video
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentVideoIndex && newIndex < reels.length) {
      setCurrentVideoIndex(newIndex);
    }
  };

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

  const handleComment = (reelId: string) => {
    // TODO: Open comments modal
    console.log('Comment on reel:', reelId);
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

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black overflow-hidden">
      <div 
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        {reels.map((reel, index) => (
          <div 
            key={reel.id} 
            className="h-screen w-full relative snap-start flex items-center justify-center"
          >
            {/* Video */}
            <video
              ref={el => videoRefs.current[index] = el}
              className="w-full h-full object-cover"
              src={reel.video_url}
              poster={reel.thumbnail_url}
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onLoadStart={() => console.log('Video loading started:', reel.video_url)}
              onCanPlay={() => console.log('Video can play:', reel.video_url)}
              onError={(e) => console.error('Video error:', e, reel.video_url)}
              onClick={togglePlayPause}
            />

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

            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-lg">Reels</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/30 hover:bg-black/50 text-white"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/30 hover:bg-black/50 text-white"
                  >
                    <MoreHorizontal className="h-5 w-5" />
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

                  {/* Description */}
                  <p className="text-white text-sm mb-2 line-clamp-2">
                    {reel.description}
                  </p>

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
                    onClick={() => handleComment(reel.id)}
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
                    onClick={() => {
                      // Handle bookmark functionality
                      console.log('Bookmark reel:', reel.id);
                    }}
                  >
                    <Bookmark className={`h-6 w-6 ${reel.is_bookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};