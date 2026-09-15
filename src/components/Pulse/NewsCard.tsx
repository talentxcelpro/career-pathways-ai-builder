import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, User, TrendingUp, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewsCardProps {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  source: string;
  author?: string;
  publishedAt: string;
  readTime: string;
  category: string;
  trending?: boolean;
  url: string;
  className?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  summary,
  imageUrl,
  source,
  author,
  publishedAt,
  readTime,
  category,
  trending = false,
  url,
  className = ''
}) => {
  const handleReadMore = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className={`bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {imageUrl && (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full aspect-video object-cover object-center rounded-t-lg"
            loading="lazy"
          />
          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-blue-600/90 text-white">
              <BookOpen className="w-3 h-3 mr-1" />
              {category}
            </Badge>
          </div>
          {/* Trending Badge */}
          {trending && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="bg-red-500/90 text-white">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* News Source & Meta */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span className="font-medium text-primary">{source}</span>
            {author && (
              <>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{author}</span>
                </span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{readTime}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground line-clamp-3 leading-5 mb-2">
          {title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-4 mb-3">
          {summary}
        </p>

        {/* Publication Date */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">
            {new Date(publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          {!imageUrl && !trending && (
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReadMore}
            className="flex items-center space-x-2 text-xs hover:scale-105 transition-transform"
          >
            <span>Read Full Article</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Share
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};