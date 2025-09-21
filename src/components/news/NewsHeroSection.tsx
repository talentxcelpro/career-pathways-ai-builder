import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NewsArticle } from "@/hooks/useNewsArticles";
import { formatDistanceToNow } from 'date-fns';
import {
  ExternalLink,
  Clock,
  User,
  Bookmark,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
  BookOpen
} from 'lucide-react';

interface NewsHeroSectionProps {
  article: NewsArticle;
  isSaved?: boolean;
  onSave?: () => void;
}

export const NewsHeroSection: React.FC<NewsHeroSectionProps> = ({
  article,
  isSaved = false,
  onSave
}) => {
  const handleReadMore = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url,
      });
    } else {
      navigator.clipboard.writeText(article.url);
    }
  };

  const readingTime = Math.ceil(article.content.length / 200);

  return (
    <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <CardContent className="p-0">
        <div className="relative">
          {/* Background Image */}
          {article.image_url && (
            <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Hero Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured Story
                </Badge>
              </div>

              {/* Engagement Score */}
              {article.engagement_score > 7 && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500 text-yellow-900 backdrop-blur-sm">
                    <Star className="w-3 h-3 mr-1" />
                    {article.engagement_score.toFixed(1)}
                  </Badge>
                </div>
              )}

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                    {article.category}
                  </Badge>
                  {article.is_trending && (
                    <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-sm animate-pulse">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 text-shadow-lg">
                  {article.title}
                </h1>
                
                <p className="text-lg text-white/90 leading-relaxed mb-4 line-clamp-2">
                  {article.description}
                </p>

                {/* Author and Meta Info */}
                <div className="flex items-center gap-4 text-sm text-white/80 mb-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 border-2 border-white/30">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${article.author}`} />
                      <AvatarFallback className="text-xs bg-white/20">
                        {article.author?.charAt(0) || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{article.author || article.source_name}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{readingTime} min read</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleReadMore}
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 shadow-lg"
                  >
                    Read Full Story
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onSave}
                    className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Fallback for articles without images */}
          {!article.image_url && (
            <div className="relative h-64 bg-gradient-to-br from-primary via-primary/80 to-secondary p-6 text-primary-foreground">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.1%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {article.category}
                  </Badge>
                  <Badge className="bg-yellow-500 text-yellow-900">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-3">
                  {article.title}
                </h1>
                
                <p className="text-lg opacity-90 leading-relaxed mb-4">
                  {article.description}
                </p>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleReadMore}
                    size="lg"
                    variant="secondary"
                    className="shadow-lg"
                  >
                    Read Full Story
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onSave}
                    className="border-white/30 text-white bg-white/10 hover:bg-white/20"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};