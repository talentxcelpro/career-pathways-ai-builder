import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Eye, 
  MessageCircle, 
  Heart, 
  Share2, 
  Bookmark,
  Calendar,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArticleCardProps {
  article: {
    id: string;
    headline: string;
    tagline: string;
    content: string;
    featured_image_url: string;
    article_category: string;
    reading_time: number;
    word_count: number;
    created_at: string;
    author_id: string;
    status?: string;
    likes_count?: number;
    comments_count?: number;
    shares_count?: number;
    views_count?: number;
    profiles?: {
      id: string;
      full_name: string;
      profile_picture_url?: string;
      title?: string;
      current_company?: string;
    };
  };
  variant?: 'default' | 'compact';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  variant = 'default' 
}) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const formatDisplayName = (profile: any) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    return 'Anonymous Author';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Anonymous Author') return 'AA';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      news: 'bg-red-100 text-red-800',
      opinion: 'bg-purple-100 text-purple-800',
      tutorial: 'bg-blue-100 text-blue-800',
      industry_update: 'bg-green-100 text-green-800',
      career_advice: 'bg-yellow-100 text-yellow-800',
      technology: 'bg-indigo-100 text-indigo-800',
      business: 'bg-gray-100 text-gray-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      news: 'News',
      opinion: 'Opinion',
      tutorial: 'Tutorial',
      industry_update: 'Industry Update',
      career_advice: 'Career Advice',
      technology: 'Technology',
      business: 'Business',
      other: 'Other'
    };
    return labels[category] || 'Article';
  };

  // Compact variant for sidebar or grid layouts
  if (variant === 'compact') {
    return (
      <Link to={`/network/articles/${article.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {article.featured_image_url && (
                <img
                  src={article.featured_image_url}
                  alt={article.headline}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getCategoryColor(article.article_category)}`}
                  >
                    {getCategoryLabel(article.article_category)}
                  </Badge>
                  {article.status === 'draft' && (
                    <Badge className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                      📝 Draft
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                  {article.headline}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{article.reading_time} min read</span>
                  <span>•</span>
                  <span>{formatTimeAgo(article.created_at)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default card variant
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Featured Image */}
      {article.featured_image_url && (
        <div className="relative h-48 overflow-hidden">
          <Link to={`/network/articles/${article.id}`}>
            <img
              src={article.featured_image_url}
              alt={article.headline}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge 
              className={getCategoryColor(article.article_category)}
            >
              {getCategoryLabel(article.article_category)}
            </Badge>
            {article.status === 'draft' && (
              <Badge className="bg-amber-500 text-white font-bold text-xs shadow-xs">
                📝 Saved Draft
              </Badge>
            )}
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <Link to={`/network/people/${article.author_id}`}>
            <Avatar className="h-10 w-10 ring-2 ring-background hover:ring-primary/20 transition-all">
              <AvatarImage src={article.profiles?.profile_picture_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                {generateInitials(article.profiles)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link 
              to={`/network/people/${article.author_id}`}
              className="font-semibold hover:text-primary transition-colors"
            >
              {formatDisplayName(article.profiles)}
            </Link>
            {article.profiles?.title && (
              <p className="text-sm text-muted-foreground">
                {article.profiles.title}
                {article.profiles?.current_company && ` at ${article.profiles.current_company}`}
              </p>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatTimeAgo(article.created_at)}
          </div>
        </div>

        {/* Article Content */}
        <div className="space-y-3">
          {article.status === 'draft' && !article.featured_image_url && (
            <Badge className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold w-fit">
              📝 Saved Draft
            </Badge>
          )}
          <Link to={`/network/articles/${article.id}`}>
            <h2 className="text-xl font-bold hover:text-primary transition-colors cursor-pointer line-clamp-2">
              {article.headline}
            </h2>
          </Link>
          
          <p className="text-muted-foreground line-clamp-2">
            {article.tagline}
          </p>

          {/* Article Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{article.reading_time} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.views_count || 0} views</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              <span>{article.likes_count || 0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>{article.comments_count || 0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              <span>{article.shares_count || 0}</span>
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Link to={`/network/articles/${article.id}`}>
              <Button variant="outline" size="sm">
                Read More
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};