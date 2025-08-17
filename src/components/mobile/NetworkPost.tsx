import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark,
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  Eye
} from 'lucide-react';

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
  };
}

export const NetworkPost: React.FC<NetworkPostProps> = ({ post }) => {
  const [isInterested, setIsInterested] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Card className="rounded-none border-0 border-b border-gray-100 bg-white shadow-none">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                {post.company?.[0] || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">{post.company || 'Company'}</h3>
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

        {/* Media */}
        {(post.image || post.video) && (
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
              {post.description}
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
              <Button className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
              <Button variant="outline" className="flex-1 rounded-2xl">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          )}

          {/* Interaction Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <span>{formatNumber(post.interactions.interested)} interested</span>
              <span>{formatNumber(post.interactions.comments)} comments</span>
              <span>{formatNumber(post.interactions.shares)} shares</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${isInterested ? 'text-red-500' : 'text-gray-600'}`}
                onClick={() => setIsInterested(!isInterested)}
              >
                <Heart className={`h-5 w-5 ${isInterested ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {post.type === 'job' ? 'Interested' : 'Like'}
                </span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Comment</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                <Share className="h-5 w-5" />
                <span className="text-sm font-medium">Share</span>
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className={`${isSaved ? 'text-primary' : 'text-gray-600'}`}
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};