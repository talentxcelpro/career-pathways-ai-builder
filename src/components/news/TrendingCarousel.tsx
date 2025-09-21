import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewsArticle } from "@/hooks/useNewsArticles";
import { formatDistanceToNow } from 'date-fns';
import {
  TrendingUp,
  Clock,
  ExternalLink,
  Bookmark,
  Flame,
  Zap
} from 'lucide-react';

interface TrendingCarouselProps {
  articles: NewsArticle[];
  savedArticles: Set<string>;
  onSave: (articleId: string) => void;
}

export const TrendingCarousel: React.FC<TrendingCarouselProps> = ({
  articles,
  savedArticles,
  onSave
}) => {
  const handleReadMore = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Trending Now
          </h2>
        </div>
        <Badge variant="destructive" className="animate-pulse">
          <Zap className="w-3 h-3 mr-1" />
          Hot Topics
        </Badge>
      </div>
      
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {articles.map((article, index) => (
            <Card
              key={article.id}
              className="flex-none w-80 bg-gradient-to-br from-card to-muted/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-0">
                <div className="relative">
                  {/* Image */}
                  {article.image_url ? (
                    <div className="relative h-32 overflow-hidden rounded-t-lg">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Trending Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          #{index + 1} Trending
                        </Badge>
                      </div>

                      {/* Save Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSave(article.id)}
                        className="absolute top-2 right-2 text-white hover:bg-white/20"
                      >
                        <Bookmark className={`w-4 h-4 ${savedArticles.has(article.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          #{index + 1} Trending
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                      </div>
                    </div>

                    <h3 className="font-semibold line-clamp-2 leading-tight hover:text-primary transition-colors cursor-pointer">
                      {article.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-muted-foreground">
                        {article.source_name}
                      </div>
                      <Button
                        onClick={() => handleReadMore(article.url)}
                        size="sm"
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      >
                        Read
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Gradient fade on edges */}
        <div className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
};