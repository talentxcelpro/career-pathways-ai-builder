import React, { useState, useCallback } from 'react';
import { useNetworkPosts } from '@/hooks/useNetworkPosts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { StoryBubbles } from '@/components/mobile/StoryBubbles';
import { MobilePostCreation } from '@/components/mobile/MobilePostCreation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Plus, Heart, MessageCircle, Share, Bookmark, MoreHorizontal, ThumbsUp, Repeat2, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { linkifyText } from '@/utils/textUtils';
import { CommentModal } from '@/components/mobile/CommentModal';
import { ReshareModal } from '@/components/mobile/ReshareModal';
import { ShareModal } from '@/components/mobile/ShareModal';
import { MobilePeopleSuggestions } from '@/components/network/MobilePeopleSuggestions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MobileNetworkPostCardProps {
  post: any;
  onCommentClick: (postId: string) => void;
}

const MobileNetworkPostCard: React.FC<MobileNetworkPostCardProps> = ({ post, onCommentClick }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showReshareModal, setShowReshareModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleConnect = async () => {
    if (!user || !post.profiles?.id) return;
    
    setIsConnecting(true);
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: post.profiles.id,
          status: 'pending',
          message: `Hi ${post.profiles.full_name}! I would love to connect with you.`
        });

      if (error) throw error;
      setIsConnected(true);
      toast.success('Connection request sent!');
    } catch (error) {
      toast.error('Failed to send connection request');
    } finally {
      setIsConnecting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  const truncatedContent = post.content && post.content.length > 150 
    ? post.content.substring(0, 150) + '...' 
    : post.content;

  const resharePost = {
    id: post.id,
    title: post.headline || (post.content ? post.content.substring(0, 80) : 'Professional Update'),
    description: post.content || '',
    type: 'content' as const,
    author: {
      name: post.profiles?.full_name || 'Professional User',
      avatar: post.profiles?.profile_picture_url
    }
  };

  return (
    <Card className="bg-white border-0 border-b border-gray-100 rounded-3xl shadow-sm mb-4 mx-3 overflow-hidden backdrop-blur-xl">
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
              <AvatarImage src={post.profiles?.profile_picture_url} alt={post.profiles?.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                {post.profiles?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {post.profiles?.full_name || 'Professional User'}
                </h3>
              </div>
              <p className="text-xs text-gray-600 truncate font-medium">{post.profiles?.title}</p>
              {post.profiles?.current_company && (
                <p className="text-xs text-gray-500 truncate">{post.profiles.current_company}</p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">{formatTimeAgo(post.created_at)}</span>
                {post.post_type === 'job_posting' && (
                  <Badge variant="outline" className="text-xs rounded-full border-blue-200 bg-blue-50 text-blue-600">
                    Job
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {/* Add Friend Button - only show if not current user */}
            {user && post.profiles?.id !== user.id && (
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "text-xs px-3 py-1.5 h-auto rounded-full transition-all duration-200",
                  isConnected 
                    ? "bg-green-50 text-green-600 border-green-200 cursor-default" 
                    : "border-blue-200 text-blue-600 hover:bg-blue-50"
                )}
                onClick={handleConnect}
                disabled={isConnecting || isConnected}
              >
                {isConnecting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isConnected ? (
                  'Request Sent'
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 mr-1" />
                    Connect
                  </>
                )}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Post Content */}
      {(post.headline || post.content) && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-800 leading-relaxed">
            {post.headline && (
              <span className="font-semibold block mb-2">{post.headline}</span>
            )}
            {post.content && linkifyText(showFullContent ? post.content : truncatedContent)}
            {post.content && post.content.length > 150 && (
              <button
                className="text-primary text-sm ml-2 font-medium"
                onClick={() => setShowFullContent(!showFullContent)}
              >
                {showFullContent ? 'Show less' : 'Show more'}
              </button>
            )}
          </p>
        </div>
      )}

      {/* Media Content */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden mx-4 mb-4 shadow-sm">
          <img
            src={post.media_urls[0]}
            alt="Post content"
            className="w-full max-h-96 object-cover rounded-2xl"
          />
        </div>
      )}

      {/* Engagement Info */}
      {(likesCount > 0 || post.comments_count > 0) && (
        <div className="px-5 py-3 border-b border-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {likesCount > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex items-center space-x-1">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                    <ThumbsUp className="w-2.5 h-2.5 text-white fill-current" />
                  </div>
                  <span className="font-medium">{likesCount} likes</span>
                </div>
              </div>
            )}
            {(post.comments_count || 0) > 0 && (
              <span className="font-medium">{post.comments_count} comments</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center space-x-2 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all duration-200",
              isLiked && "text-blue-600 bg-blue-50"
            )}
            onClick={handleLike}
          >
            <ThumbsUp className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span className="text-sm font-medium">Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all duration-200"
            onClick={() => setShowCommentModal(true)}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all duration-200"
            onClick={() => setShowReshareModal(true)}
          >
            <Repeat2 className="w-4 h-4" />
            <span className="text-sm font-medium">Reshare</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all duration-200"
            onClick={() => setShowShareModal(true)}
          >
            <Share className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center space-x-2 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all duration-200",
              isBookmarked && "text-amber-600 bg-amber-50"
            )}
            onClick={handleBookmark}
          >
            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ReshareModal
        isOpen={showReshareModal}
        onClose={() => setShowReshareModal(false)}
        post={resharePost}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={{
          id: post.id,
          title: post.headline || (post.content ? post.content.substring(0, 50) : 'Post'),
          description: post.content || '',
          type: 'content' as const
        }}
      />

      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        postId={post.id}
        postTitle={post.headline || (post.content ? post.content.substring(0, 50) : 'Post')}
      />
    </Card>
  );
};

export const MobileNetworkFeed: React.FC = () => {
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMore,
    error,
    refetch
  } = useNetworkPosts();

  // Set up infinite scroll
  const { isFetching } = useInfiniteScroll({
    hasNextPage: hasNextPage || false,
    fetchNextPage: loadMore,
    threshold: 500,
  });

  const handleCommentClick = useCallback((postId: string) => {
    setOpenComments(current => current === postId ? null : postId);
  }, []);

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Failed to load posts</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50">
        <StoryBubbles />
        
        {/* Quick Post Creation */}
        <div className="p-4">
          <Card className="p-3 bg-white/95 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.picture} />
                <AvatarFallback className="bg-primary text-white text-sm">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                className="flex-1 justify-start text-gray-500 h-9 rounded-xl bg-gray-50"
                onClick={() => setShowCreatePost(true)}
              >
                Share your thoughts...
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl"
                onClick={() => setShowCreatePost(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
        
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="pb-20">
            {/* People Suggestions */}
            <MobilePeopleSuggestions />
            
            {/* Posts Feed */}
            {posts && posts.map((post) => (
              <MobileNetworkPostCard
                key={post.id}
                post={post}
                onCommentClick={handleCommentClick}
              />
            ))}

            {/* Loading more indicator */}
            {(isFetchingNextPage || isFetching) && (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Loading more posts...</p>
                </div>
              </div>
            )}

            {/* No more posts indicator */}
            {!hasNextPage && posts && posts.length > 0 && (
              <div className="flex justify-center py-8">
                <p className="text-sm text-muted-foreground">
                  You've reached the end of the feed
                </p>
              </div>
            )}

            {/* Manual load more button (fallback) */}
            {hasNextPage && !isFetchingNextPage && !isFetching && (
              <div className="flex justify-center py-4">
                <Button 
                  onClick={loadMore}
                  variant="outline"
                  className="px-8"
                >
                  Load More Posts
                </Button>
              </div>
            )}
            
            {(!posts || posts.length === 0) && !isLoading && (
              <div className="p-8 text-center">
                <p className="text-gray-600">No posts available yet.</p>
                <p className="text-sm text-gray-500 mt-2">Connect with more professionals to see their updates!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Post Creation Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <MobilePostCreation
              onClose={() => setShowCreatePost(false)}
              onPostCreated={() => {
                setShowCreatePost(false);
                refetch();
              }}
            />
          </div>
        )}
      </div>
    </MobileLayout>
  );
};