import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  url_to_image?: string;
  published_at: string;
  source_name: string;
  category: string;
  is_trending: boolean;
}

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'default' | 'compact';
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'default' }) => {
  const handleReadMore = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleReadMore}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            {article.url_to_image && (
              <img
                src={article.url_to_image}
                alt={article.title}
                className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {article.source_name}
                </Badge>
                {article.is_trending && (
                  <Badge variant="default" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {article.url_to_image && (
        <div className="relative">
          <img
            src={article.url_to_image}
            alt={article.title}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {article.is_trending && (
            <Badge 
              variant="default" 
              className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">
            {article.source_name}
          </Badge>
          <p className="text-sm text-muted-foreground flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
          </p>
        </div>
        <CardTitle className="line-clamp-2">
          {article.title}
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {article.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Button onClick={handleReadMore} className="w-full" variant="outline">
          <ExternalLink className="h-4 w-4 mr-2" />
          Read Full Article
        </Button>
      </CardContent>
    </Card>
  );
};