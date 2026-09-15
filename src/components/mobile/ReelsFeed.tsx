import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import VideoPlayer from '@/components/posts/VideoPlayer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useMobileGestures } from '@/hooks/useMobileGestures';
import { useAuth } from '@/contexts/AuthContext';

interface ReelsPost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    isFollowing?: boolean;
  };
  content: {
    type: 'video' | 'image' | 'text';
    url?: string;
    text?: string;
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
  jobDetails?: {
    company: string;
    position: string;
    location: string;
    applyUrl?: string;
  };
  timestamp: string;
}

interface ReelsFeedProps {
  posts: ReelsPost[];
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onFollow?: (userId: string) => void;
  onApply?: (jobUrl: string) => void;
}

const ReelsFeedItem: React.FC<{
  post: ReelsPost;
  isActive: boolean;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onFollow?: (userId: string) => void;
  onApply?: (jobUrl: string) => void;
}> = ({ post, isActive, onLike, onBookmark, onShare, onComment, onFollow, onApply }) => {
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

  const handleDoubleClick = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  const truncatedCaption = post.caption && post.caption.length > 100 
    ? post.caption.substring(0, 100) + '...' 
    : post.caption;

  return (
    <div className="relative w-full h-screen bg-black flex flex-col">
      {/* Video/Image Content */}
      <div 
        className="flex-1 relative bg-black"
        onDoubleClick={handleDoubleClick}
      >
        {post.content.type === 'video' && post.content.url ? (
          <div 
            className="w-full h-full cursor-pointer"
            onClick={() => window.location.href = `/network/posts/${post.id}`}
            title="View full post"
          >
            <VideoPlayer
              url={post.content.url}
              className="w-full h-full object-cover pointer-events-none"
              isMessage={false}
            />
          </div>
        ) : post.content.type === 'image' && post.content.url ? (
          <img
            src={post.content.url}
            alt="Post content"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => window.location.href = `/network/posts/${post.id}`}
            title="View full post"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6">
            <div className="text-white text-center">
              <p className="text-lg leading-relaxed">{post.content.text}</p>
            </div>
          </div>
        )}

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Right side action buttons */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full w-12 h-12 bg-black/20 backdrop-blur-sm",
              isLiked ? "text-red-500" : "text-white"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
          </Button>
          <span className="text-white text-xs mt-1 font-medium">
            {likesCount > 999 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-12 h-12 bg-black/20 backdrop-blur-sm text-white"
            onClick={() => onComment?.(post.id)}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          <span className="text-white text-xs mt-1 font-medium">
            {post.stats.comments > 999 ? `${(post.stats.comments / 1000).toFixed(1)}k` : post.stats.comments}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-12 h-12 bg-black/20 backdrop-blur-sm text-white"
            onClick={() => onShare?.(post.id)}
          >
            <Share className="w-6 h-6" />
          </Button>
          <span className="text-white text-xs mt-1 font-medium">
            {post.stats.shares}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full w-12 h-12 bg-black/20 backdrop-blur-sm",
            isBookmarked ? "text-yellow-400" : "text-white"
          )}
          onClick={handleBookmark}
        >
          <Bookmark className={cn("w-6 h-6", isBookmarked && "fill-current")} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-12 h-12 bg-black/20 backdrop-blur-sm text-white"
        >
          <MoreHorizontal className="w-6 h-6" />
        </Button>
      </div>

      {/* Bottom content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6">
        {/* User info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold text-sm">{post.user.name}</span>
                {!post.user.isFollowing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-3 text-xs bg-transparent border-white text-white hover:bg-white hover:text-black"
                    onClick={() => onFollow?.(post.user.id)}
                  >
                    Follow
                  </Button>
                )}
              </div>
              {post.user.title && (
                <p className="text-white/80 text-xs">{post.user.title}</p>
              )}
            </div>
          </div>
          <span className="text-white/60 text-xs">{post.timestamp}</span>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="mb-3">
            <p className="text-white text-sm leading-relaxed">
              {showFullCaption ? post.caption : truncatedCaption}
              {post.caption.length > 100 && (
                <button
                  className="text-white/80 text-sm ml-2 underline"
                  onClick={() => setShowFullCaption(!showFullCaption)}
                >
                  {showFullCaption ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Job post details */}
        {post.isJobPost && post.jobDetails && (
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Job Opportunity</span>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">{post.jobDetails.position}</h3>
            <p className="text-white/80 text-xs mb-1">{post.jobDetails.company}</p>
            <p className="text-white/60 text-xs mb-2">{post.jobDetails.location}</p>
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
      </div>
    </div>
  );
};

export const ReelsFeed: React.FC<ReelsFeedProps> = ({ 
  posts, 
  onLike, 
  onBookmark, 
  onShare, 
  onComment, 
  onFollow, 
  onApply 
}) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { swipe, handlers, resetSwipe } = useMobileGestures(50, 0.3);

  // Handle swipe gestures
  useEffect(() => {
    if (swipe?.direction === 'up' && currentIndex < posts.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetSwipe();
    } else if (swipe?.direction === 'down' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      resetSwipe();
    }
  }, [swipe, currentIndex, posts.length, resetSwipe]);

  // Scroll to current post
  useEffect(() => {
    if (containerRef.current) {
      const scrollTop = currentIndex * window.innerHeight;
      containerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-6">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Sign in to view feed</h2>
          <p className="text-white/80 mb-6">Join TalentXcel to see personalized content and connect with professionals</p>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      {...handlers}
    >
      <div className="relative">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="w-full h-screen"
            style={{ transform: `translateY(${(index - currentIndex) * 100}vh)` }}
          >
            <ReelsFeedItem
              post={post}
              isActive={index === currentIndex}
              onLike={onLike}
              onBookmark={onBookmark}
              onShare={onShare}
              onComment={onComment}
              onFollow={onFollow}
              onApply={onApply}
            />
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="absolute top-safe-area-top right-4 flex flex-col space-y-1 z-50">
        {posts.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1 h-8 rounded-full transition-all duration-300",
              index === currentIndex ? "bg-white" : "bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};