import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NewsArticle } from "@/hooks/useNewsArticles";
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ExternalLink,
  TrendingUp,
  Clock,
  User,
  Sparkles,
  Eye,
  ThumbsUp,
  BookOpen,
  Star
} from 'lucide-react';

interface EnhancedNewsCardProps {
  article: NewsArticle;
  variant?: 'full' | 'compact';
  isSaved?: boolean;
  onSave?: () => void;
}

export const EnhancedNewsCard: React.FC<EnhancedNewsCardProps> = ({
  article,
  variant = 'full',
  isSaved = false,
  onSave
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50) + 10);
  const [comments, setComments] = useState(Math.floor(Math.random() * 20) + 5);
  const [shares, setShares] = useState(Math.floor(Math.random() * 15) + 3);
  const [showPreview, setShowPreview] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
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
    setShares(prev => prev + 1);
  };

  const handleReadMore = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const readingTime = Math.ceil(article.content.length / 200);
  const categoryColor = {
    technology: 'bg-purple-100 text-purple-800 border-purple-200',
    business: 'bg-green-100 text-green-800 border-green-200',
    career: 'bg-orange-100 text-orange-800 border-orange-200',
    industry: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  if (variant === 'compact') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/60 hover:border-l-primary">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {article.image_url && (
              <div className="flex-shrink-0">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${categoryColor[article.category.toLowerCase() as keyof typeof categoryColor] || categoryColor.default}`}
                >
                  {article.category}
                </Badge>
                {article.is_trending && (
                  <Badge variant="secondary" className="text-xs animate-pulse">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>{article.source_name}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="flex-shrink-0"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-primary' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-md bg-gradient-to-br from-card to-card/80"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      {/* Image Header */}
      {article.image_url && (
        <div className="relative overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge 
              className={`${categoryColor[article.category.toLowerCase() as keyof typeof categoryColor] || categoryColor.default} backdrop-blur-sm`}
            >
              {article.category}
            </Badge>
            {article.is_trending && (
              <Badge variant="destructive" className="animate-pulse backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Hot
              </Badge>
            )}
          </div>

          {/* Engagement Score */}
          {article.engagement_score > 7 && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-yellow-500 text-yellow-900 backdrop-blur-sm">
                <Star className="w-3 h-3 mr-1" />
                {article.engagement_score.toFixed(1)}
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2">
              {article.title}
            </h3>
            
            {/* Author and metadata */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${article.author}`} />
                  <AvatarFallback className="text-xs">
                    {article.author?.charAt(0) || <User className="w-3 h-3" />}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{article.author || article.source_name}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>{readingTime} min read</span>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="text-muted-foreground hover:text-primary"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-primary' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
          {article.description}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs hover:bg-primary/10 cursor-pointer">
                #{tag}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{article.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Engagement Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`text-muted-foreground hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-blue-500"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="text-xs">{comments}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-green-500"
            >
              <Share2 className="w-4 h-4 mr-1" />
              <span className="text-xs">{shares}</span>
            </Button>
          </div>

          <Button
            onClick={handleReadMore}
            size="sm"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Read Full Article
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* Quick Preview on Hover */}
        {showPreview && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm p-4 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <h4 className="font-semibold mb-2">Quick Preview</h4>
            <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
              {article.content.substring(0, 200)}...
            </p>
            <Button onClick={handleReadMore} className="w-full">
              Read Full Article
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};