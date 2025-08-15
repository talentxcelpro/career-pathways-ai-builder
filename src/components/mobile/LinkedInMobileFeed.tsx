import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, User, Briefcase, ThumbsUp, Send, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import VideoPlayer from '@/components/posts/VideoPlayer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

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
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onConnect?: (userId: string) => void;
  onApply?: (jobUrl: string) => void;
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
  const [isLiked, setIsLiked] = useState(post.stats.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.stats.isBookmarked);
  const [likesCount, setLikesCount] = useState(post.stats.likes);
  const [showFullCaption, setShowFullCaption] = useState(false);

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
    <Card className="bg-white border-0 border-b border-gray-200 rounded-none shadow-none">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {post.user.name}
                </h3>
                {post.isPromoted && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    Promoted
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate">{post.user.title}</p>
              {post.user.company && (
                <p className="text-xs text-gray-500 truncate">{post.user.company}</p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">{post.timestamp}</span>
                {post.isJobPost && (
                  <Badge variant="outline" className="text-xs">
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
                className="h-8 px-3 text-xs border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => onConnect?.(post.user.id)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Connect
              </Button>
            )}
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Post Content */}
      {post.caption && (
        <div className="px-4 pb-3">
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
        </div>
      )}

      {/* Media Content */}
      {post.content.url && (
        <div className="relative">
          {post.content.type === 'video' ? (
            <div className="aspect-video bg-black">
              <VideoPlayer
                url={post.content.url}
                className="w-full h-full object-cover"
                isMessage={false}
              />
            </div>
          ) : post.content.type === 'image' ? (
            <img
              src={post.content.url}
              alt="Post content"
              className="w-full max-h-96 object-cover"
            />
          ) : null}
        </div>
      )}

      {/* Job Details */}
      {post.isJobPost && post.jobDetails && (
        <div className="mx-4 my-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 text-sm font-medium">Job Opportunity</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{post.jobDetails.position}</h3>
          <p className="text-gray-700 text-sm mb-1">{post.jobDetails.company}</p>
          <p className="text-gray-500 text-xs mb-3">{post.jobDetails.location}</p>
          {post.jobDetails.applyUrl && (
            <Button
              size="sm"
              className="w-full h-8 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => onApply?.(post.jobDetails.applyUrl!)}
            >
              Apply Now
            </Button>
          )}
        </div>
      )}

      {/* Engagement Info */}
      {(post.stats.likes > 0 || post.stats.comments > 0) && (
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {post.stats.likes > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <ThumbsUp className="w-2.5 h-2.5 text-white fill-current" />
                  </div>
                  <span>{likesCount} likes</span>
                </div>
              </div>
            )}
            {post.stats.comments > 0 && (
              <span>{post.stats.comments} comments</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3",
              isLiked && "text-primary"
            )}
            onClick={handleLike}
          >
            <ThumbsUp className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span className="text-sm font-medium">Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3"
            onClick={() => onComment?.(post.id)}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3"
            onClick={() => onShare?.(post.id)}
          >
            <Share className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3",
              isBookmarked && "text-primary"
            )}
            onClick={handleBookmark}
          >
            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
          </Button>
        </div>
      </div>

      {/* Top Comment Preview */}
      {post.engagement?.topComment && (
        <div className="px-4 pb-3 pt-0">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs">
                  <span className="font-medium text-gray-900">{post.engagement.topComment.user}</span>{' '}
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
  onLike, 
  onBookmark, 
  onShare, 
  onComment, 
  onConnect, 
  onApply 
}) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg max-w-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sign in to view feed</h2>
          <p className="text-gray-600 mb-6">Join TalentXcel to see personalized content and connect with professionals</p>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto">
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
      </div>
    </div>
  );
};