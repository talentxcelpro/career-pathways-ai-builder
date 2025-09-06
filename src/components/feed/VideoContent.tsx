import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Eye, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VideoContentProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  comments: number;
  channel: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  category: string;
  publishedAt: string;
  className?: string;
}

export const VideoContent: React.FC<VideoContentProps> = ({
  id,
  title,
  description,
  thumbnailUrl,
  videoUrl,
  duration,
  views,
  likes,
  comments,
  channel,
  category,
  publishedAt,
  className = ''
}) => {
  const handleVideoClick = () => {
    // Handle video play - could open modal, navigate to video page, etc.
    window.open(videoUrl, '_blank');
  };

  return (
    <Card className={`bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Video Thumbnail */}
      <div className="relative cursor-pointer" onClick={handleVideoClick}>
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="w-full aspect-video object-cover object-center rounded-t-lg"
          loading="lazy"
        />
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-lg group-hover:bg-black/30 transition-colors">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-primary ml-1" fill="currentColor" />
          </div>
        </div>
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
          {duration}
        </div>
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
            {category}
          </Badge>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        {/* Channel Info */}
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarImage src={channel.avatar} alt={channel.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {channel.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {channel.name}
              </p>
              {channel.verified && (
                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(publishedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Video Title & Description */}
        <div className="space-y-2 mb-3">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-5">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-4">
            {description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{views.toLocaleString()}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>{likes.toLocaleString()}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{comments.toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-500 transition-all hover:scale-105"
            >
              <Heart className="h-4 w-4" />
              <span className="text-xs">Like</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-500 transition-all hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Comment</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-500 transition-all hover:scale-105"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};