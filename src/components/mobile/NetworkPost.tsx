import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Repeat2,
  Bookmark,
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  Eye
} from 'lucide-react';
import { CommentModal } from './CommentModal';
import { ShareModal } from './ShareModal';
import { ReshareModal } from './ReshareModal';
import { linkifyText } from '@/utils/textUtils';

interface NetworkPostProps {
  post: {
    id: string;
    type: 'job' | 'content';
    title: string;
    company?: string;
    location?: string;
    salary?: string;
    image?: string;
    video?: string;
    description: string;
    tags?: string[];
    timeAgo: string;
    interactions: {
      interested: number;
      comments: number;
      shares: number;
    };
    author?: {
      name: string;
      avatar?: string;
    };
  };
}

export const NetworkPost: React.FC<NetworkPostProps> = ({ post }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(post.interactions.interested);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReshareModal, setShowReshareModal] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to like posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikes(prev => newLikedState ? prev + 1 : prev - 1);

      if (newLikedState) {
        await supabase
          .from('post_likes')
          .upsert({
            post_id: post.id,
            user_id: user.id
          });
      } else {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Like error:', error);
      // Revert on error
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  const handleComment = () => {
    setShowCommentModal(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleReshare = () => {
    setShowReshareModal(true);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Bookmarked",
      description: isBookmarked ? "Post removed from your bookmarks." : "Post saved to your bookmarks.",
    });
  };

  const handleApplyNow = () => {
    if (post.type === 'job') {
      window.location.href = `/jobs/${post.id}`;
    }
  };

  const handleViewDetails = () => {
    if (post.type === 'job') {
      window.location.href = `/jobs/${post.id}`;
    } else {
      window.location.href = `/posts/${post.id}`;
    }
  };

  return (
    <Card className="rounded-none border-0 border-b border-gray-100 bg-white shadow-none">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                {post.company?.[0] || post.author?.name?.[0] || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">{post.company || post.author?.name || 'Company'}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{post.timeAgo}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold">
            Follow
          </Button>
        </div>

        {/* Media - Only show if image exists */}
        {post.image && (
          <div className="relative aspect-[4/3] bg-gray-100">
            {post.video ? (
              <video 
                className="w-full h-full object-cover"
                poster={post.image}
                controls
                playsInline
              >
                <source src={post.video} type="video/mp4" />
              </video>
            ) : (
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide broken images
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            {post.type === 'job' && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm">
                  Job Opening
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 pt-3">
          <div className="mb-3">
            <h2 className="font-bold text-lg text-gray-900 mb-2">{post.title}</h2>
            
            {post.type === 'job' && (
              <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-600">
                {post.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{post.location}</span>
                  </div>
                )}
                {post.salary && (
                  <div className="flex items-center gap-1 text-green-600 font-semibold">
                    <DollarSign className="h-3 w-3" />
                    <span>{post.salary}</span>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-gray-700 text-sm leading-relaxed">
              {linkifyText(post.description)}
            </p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons for Jobs */}
          {post.type === 'job' && (
            <div className="flex gap-2 mb-4">
              <Button 
                className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                onClick={handleApplyNow}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 rounded-2xl"
                onClick={handleViewDetails}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          )}

          {/* Interaction Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3 px-1">
            <div className="flex items-center gap-4">
              <span>{likes} interested</span>
              <span>{post.interactions.comments} comments</span>
              <span>{post.interactions.shares} shares</span>
            </div>
            <span>{post.timeAgo}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center border-t pt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 gap-2 hover:bg-gray-50"
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              <span className="text-xs">{post.type === 'job' ? 'Interested' : 'Like'}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 gap-2 hover:bg-gray-50"
              onClick={handleComment}
            >
              <MessageCircle className="h-4 w-4 text-gray-600" />
              <span className="text-xs">Comment</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 gap-2 hover:bg-gray-50"
              onClick={handleReshare}
            >
              <Repeat2 className="h-4 w-4 text-gray-600" />
              <span className="text-xs">Reshare</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 gap-2 hover:bg-gray-50"
              onClick={handleShare}
            >
              <Share className="h-4 w-4 text-gray-600" />
              <span className="text-xs">Share</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2 hover:bg-gray-50"
              onClick={handleBookmark}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
            </Button>
          </div>
        </div>
        
        {/* Modals */}
        <CommentModal 
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          postId={post.id}
          postTitle={post.title}
        />
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={post}
        />
        <ReshareModal 
          isOpen={showReshareModal}
          onClose={() => setShowReshareModal(false)}
          post={post}
        />
      </CardContent>
    </Card>
  );
};