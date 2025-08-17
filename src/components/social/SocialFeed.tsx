import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SocialMediaUpload } from './SocialMediaUpload';
import { CommentsSection } from './CommentsSection';
import { EnhancedShareButton } from './EnhancedShareButton';
import { useSocialInteractions } from '@/hooks/useSocialInteractions';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  MapPin,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  content: string;
  media_urls: string[];
  post_type: string;
  tags: string[];
  location?: string;
  created_at: string;
  author_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  visibility: string;
  profiles: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    headline?: string;
    current_company?: string;
  };
}

interface SocialFeedProps {
  feedType?: 'explore' | 'following' | 'my-posts';
  userId?: string;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ 
  feedType = 'explore',
  userId 
}) => {
  const { user } = useAuth();

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['social-feed', feedType, userId],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          media_urls,
          post_type,
          tags,
          location,
          created_at,
          author_id,
          likes_count,
          comments_count,
          shares_count,
          visibility,
          profiles!posts_author_id_fkey(
            id,
            full_name,
            profile_picture_url,
            headline,
            current_company
          )
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      // Apply filters based on feed type
      if (feedType === 'my-posts' && userId) {
        query = query.eq('author_id', userId);
      } else if (feedType === 'following' && user) {
        // TODO: Implement following logic with connections
        query = query.eq('visibility', 'public');
      } else {
        query = query.eq('visibility', 'public');
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data as Post[];
    },
    enabled: !!user
  });

  const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const { interactions, toggleLike, toggleBookmark, isLiking, isBookmarking } = useSocialInteractions(post.id);
    const [videoPlaying, setVideoPlaying] = React.useState(false);
    const [videoMuted, setVideoMuted] = React.useState(true);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    const hasImages = post.media_urls.some(url => /\.(jpg|jpeg|png|gif|webp)$/i.test(url));
    const hasVideos = post.media_urls.some(url => /\.(mp4|mov|webm|avi)$/i.test(url));

    const toggleVideoPlay = () => {
      if (videoRef.current) {
        if (videoPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setVideoPlaying(!videoPlaying);
      }
    };

    const toggleVideoMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = !videoMuted;
        setVideoMuted(!videoMuted);
      }
    };

    return (
      <Card className="w-full">
        <CardContent className="p-4 space-y-4">
          {/* Post Header */}
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profiles.profile_picture_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {post.profiles.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm">{post.profiles.full_name}</h4>
                {post.profiles.headline && (
                  <Badge variant="secondary" className="text-xs">
                    {post.profiles.headline}
                  </Badge>
                )}
                {post.profiles.current_company && (
                  <span className="text-xs text-muted-foreground">
                    at {post.profiles.current_company}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                {post.location && (
                  <>
                    <MapPin className="h-3 w-3 ml-2" />
                    <span>{post.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Post Content */}
          {post.content && (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm whitespace-pre-wrap">{post.content}</p>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {post.tags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 5} more
                </Badge>
              )}
            </div>
          )}

          {/* Media */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              {hasVideos ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full max-h-[400px] object-cover"
                    src={post.media_urls.find(url => /\.(mp4|mov|webm|avi)$/i.test(url))}
                    loop
                    muted={videoMuted}
                    playsInline
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                  />
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                      onClick={toggleVideoPlay}
                    >
                      {videoPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                      onClick={toggleVideoMute}
                    >
                      {videoMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              ) : hasImages ? (
                <div className={`grid gap-2 ${post.media_urls.length === 1 ? 'grid-cols-1' : post.media_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
                  {post.media_urls.slice(0, 4).map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Post media ${index + 1}`}
                        className="w-full h-full object-cover aspect-square"
                      />
                      {index === 3 && post.media_urls.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                          +{post.media_urls.length - 4} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLike}
                disabled={isLiking}
                className="gap-1"
              >
                <Heart className={`h-4 w-4 ${interactions.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                {interactions.likesCount > 0 && interactions.likesCount}
              </Button>

              <CommentsSection
                postId={post.id}
                commentsCount={interactions.commentsCount}
              />

              <EnhancedShareButton
                content={{
                  id: post.id,
                  type: 'post',
                  title: post.content?.split('\n')[0] || 'Check out this post',
                  description: post.content,
                  imageUrl: post.media_urls.find(url => /\.(jpg|jpeg|png|gif|webp)$/i.test(url))
                }}
                sharesCount={interactions.sharesCount}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBookmark}
              disabled={isBookmarking}
            >
              <Bookmark className={`h-4 w-4 ${interactions.isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      {feedType !== 'my-posts' && (
        <Card>
          <CardContent className="p-4">
            <SocialMediaUpload />
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="h-12 w-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No posts yet</h3>
                <p className="text-muted-foreground">
                  {feedType === 'my-posts' ? 
                    "You haven't created any posts yet. Share your career journey!" :
                    "Be the first to share something with the community!"
                  }
                </p>
              </div>
              {feedType !== 'my-posts' && <SocialMediaUpload />}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};