import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, User, Briefcase, ThumbsUp, Send, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import VideoPlayer from '@/components/posts/VideoPlayer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { MobileCreatePost } from './MobileCreatePost';
import { EnhancedPostMenu } from '@/components/posts/EnhancedPostMenu';
import { useUrlDetection } from '@/hooks/useUrlDetection';
import LinkPreview from '@/components/shared/LinkPreview';
import { useQueryClient } from '@tanstack/react-query';

interface LinkedInPost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    company?: string;
    isFollowing?: boolean;
    isConnection?: boolean;
  };
  content: {
    type: 'video' | 'image' | 'text' | 'article';
    url?: string;
    text?: string;
    title?: string;
    duration?: number;
  };
  caption?: string;
  stats: {
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    isBookmarked: boolean;
  };
  isJobPost?: boolean;
  isPromoted?: boolean;
  jobDetails?: {
    company: string;
    position: string;
    location: string;
    applyUrl?: string;
  };
  timestamp: string;
  engagement?: {
    likedBy: string[];
    topComment?: {
      user: string;
      text: string;
    };
  };
}

interface LinkedInMobileFeedProps {
  posts: LinkedInPost[];
  loading?: boolean;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onConnect?: (userId: string) => void;
  onApply?: (jobUrl: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

const LinkedInPostCard: React.FC<{
  post: LinkedInPost;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onConnect?: (userId: string) => void;
  onApply?: (jobUrl: string) => void;
}> = ({ post, onLike, onBookmark, onShare, onComment, onConnect, onApply }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.stats.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.stats.isBookmarked);
  const [likesCount, setLikesCount] = useState(post.stats.likes);
  const [showFullCaption, setShowFullCaption] = useState(false);
  
  // URL detection for link previews
  const { detectedUrls } = useUrlDetection(post.caption || '');

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(post.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id);
  };

  const truncatedCaption = post.caption && post.caption.length > 150 
    ? post.caption.substring(0, 150) + '...' 
    : post.caption;

  return (
    <Card className="bg-white border-0 border-b border-gray-100 rounded-3xl shadow-sm mb-4 mx-3 overflow-hidden backdrop-blur-xl">
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <button
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                onClick={() => navigate(`/user/${post.user.id}`)}
              >
                <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg hover:ring-blue-200 transition-all cursor-pointer">
                  <AvatarImage src={post.user.avatar} alt={post.user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <button
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded text-left"
                    onClick={() => navigate(`/user/${post.user.id}`)}
                  >
                    <h3 className="font-semibold text-gray-900 text-sm truncate hover:text-blue-600 transition-colors">
                      {post.user.name}
                    </h3>
                  </button>
                {post.isPromoted && (
                  <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                    Promoted
                  </Badge>
                )}
              </div>
                  <button
                    onClick={() => window.location.href = `/user/${post.user.id}`}
                    className="text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded w-full"
                  >
                    <p className="text-xs text-gray-600 truncate font-medium hover:text-blue-600 transition-colors">{post.user.title}</p>
                    {post.user.company && (
                      <p className="text-xs text-gray-500 truncate hover:text-blue-600 transition-colors">{post.user.company}</p>
                    )}
                  </button>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">{post.timestamp}</span>
                {post.isJobPost && (
                  <Badge variant="outline" className="text-xs rounded-full border-blue-200 bg-blue-50 text-blue-600">
                    <Briefcase className="w-3 h-3 mr-1" />
                    Job
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!post.user.isConnection && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-4 text-xs border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full font-medium shadow-sm"
                onClick={() => onConnect?.(post.user.id)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Connect
              </Button>
            )}
            <EnhancedPostMenu
              postId={post.id}
              authorId={post.user.id}
              currentUserId={post.user.id}
              postContent={post.caption || ''}
              isOwnPost={true}
            />
          </div>
        </div>
      </div>

      {/* Post Content */}
      {post.caption && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-800 leading-relaxed">
            {showFullCaption ? post.caption : truncatedCaption}
            {post.caption.length > 150 && (
              <button
                className="text-primary text-sm ml-2 font-medium"
                onClick={() => setShowFullCaption(!showFullCaption)}
              >
                {showFullCaption ? 'Show less' : 'Show more'}
              </button>
            )}
          </p>
          
          {/* Link Previews */}
          {detectedUrls.length > 0 && (
            <div className="mt-3 space-y-2">
              {detectedUrls.slice(0, 1).map((urlData, index) => (
                <LinkPreview 
                  key={`${urlData.url}-${index}`}
                  url={urlData.url}
                  className="border rounded-lg"
                  compact={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media Content - Clickable to view full post */}
      {post.content.url && (
        <div 
          className="relative rounded-2xl overflow-hidden mx-4 mb-4 shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => window.location.href = `/network/posts/${post.id}`}
          title="View full post"
        >
          {post.content.type === 'video' ? (
            <div className="aspect-video bg-black rounded-2xl overflow-hidden">
              <VideoPlayer
                url={post.content.url}
                className="w-full h-full object-cover rounded-2xl pointer-events-none"
                isMessage={false}
              />
            </div>
          ) : post.content.type === 'image' ? (
            <img
              src={post.content.url}
              alt="Post content"
              className="w-full max-h-96 object-contain bg-muted rounded-2xl"
            />
          ) : null}
        </div>
      )}

      {/* Job Details */}
      {post.isJobPost && post.jobDetails && (
        <div className="mx-4 my-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 text-sm font-medium">Job Opportunity</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{post.jobDetails.position}</h3>
          <p className="text-gray-700 text-sm mb-1">{post.jobDetails.company}</p>
          <p className="text-gray-500 text-xs mb-3">{post.jobDetails.location}</p>
          {post.jobDetails.applyUrl && (
            <Button
              size="sm"
              className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-xl font-medium shadow-md"
              onClick={() => onApply?.(post.jobDetails.applyUrl!)}
            >
              Apply Now
            </Button>
          )}
        </div>
      )}

      {/* Engagement Info */}
      {(post.stats.likes > 0 || post.stats.comments > 0) && (
        <div className="px-5 py-3 border-b border-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {post.stats.likes > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex items-center space-x-1">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                    <ThumbsUp className="w-2.5 h-2.5 text-white fill-current" />
                  </div>
                  <span className="font-medium">{likesCount} likes</span>
                </div>
              </div>
            )}
            {post.stats.comments > 0 && (
              <span className="font-medium">{post.stats.comments} comments</span>
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
            onClick={() => onComment?.(post.id)}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all duration-200"
            onClick={() => onShare?.(post.id)}
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

      {/* Top Comment Preview */}
      {post.engagement?.topComment && (
        <div className="px-5 pb-4 pt-0">
          <div className="bg-gray-50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <Avatar className="w-7 h-7 ring-1 ring-white shadow-sm">
                <AvatarFallback className="text-xs bg-gradient-to-br from-gray-400 to-gray-500 text-white">
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed">
                  <span className="font-semibold text-gray-900">{post.engagement.topComment.user}</span>{' '}
                  <span className="text-gray-700">{post.engagement.topComment.text}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export const LinkedInMobileFeed: React.FC<LinkedInMobileFeedProps> = ({ 
  posts, 
  loading = false,
  onLike, 
  onBookmark, 
  onShare, 
  onComment, 
  onConnect, 
  onApply,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-3xl p-8 shadow-2xl max-w-sm border border-gray-100 backdrop-blur-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sign in to view feed</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">Join TalentXcel to see personalized content and connect with professionals</p>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl h-12 font-medium shadow-lg">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-2xl mx-auto pt-4 pb-20">
        {/* Create Post Section */}
        <MobileCreatePost onPostCreate={() => {
          // Refresh the posts data without reloading the page
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
          queryClient.invalidateQueries({ queryKey: ['global-feed-posts'] });
          queryClient.invalidateQueries({ queryKey: ['linkedInMobilePosts'] });
        }} />
        
        {/* Posts Feed */}
        {posts.map((post) => (
          <LinkedInPostCard
            key={post.id}
            post={post}
            onLike={onLike}
            onBookmark={onBookmark}
            onShare={onShare}
            onComment={onComment}
            onConnect={onConnect}
            onApply={onApply}
          />
        ))}

        {/* Load More Section */}
        {hasNextPage && (
          <div className="flex justify-center py-8 px-4">
            <Button 
              onClick={onLoadMore}
              disabled={isFetchingNextPage}
              className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl h-12 font-medium shadow-lg transition-all duration-200"
            >
              {isFetchingNextPage ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading more posts...</span>
                </div>
              ) : (
                <span>Load More Posts</span>
              )}
            </Button>
          </div>
        )}

        {/* End of Feed Message */}
        {!hasNextPage && posts.length > 0 && (
          <div className="text-center py-8 px-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mx-4 shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">You're all caught up!</h3>
              <p className="text-gray-600 text-sm">
                You've seen all the latest posts from your network
              </p>
            </div>
          </div>
        )}

        {/* Empty State - Only show if not loading */}
        {posts.length === 0 && !loading && !isFetchingNextPage && (
          <div className="text-center py-12 px-4">
            <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm mx-auto border border-gray-100">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start Connecting</h3>
              <p className="text-gray-600 mb-6">Connect with professionals to see their posts and updates</p>
              <Button 
                onClick={() => window.location.href = '/network/people'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 font-medium"
              >
                Discover People
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};