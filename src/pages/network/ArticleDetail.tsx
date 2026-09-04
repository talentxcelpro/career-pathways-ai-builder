import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  UserPlus,
  UserCheck,
  Calendar,
  MapPin,
  ExternalLink,
  Send,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useArticleSubscriptions, useArticleBookmarks } from '@/hooks/useArticleSubscriptions';
import { CommentsSection } from '@/components/posts/CommentsSection';
import { PostActions } from '@/components/posts/PostActions';
import { FOUNDATION_NEWS_ARTICLES } from '@/data/newsArticles';
import { toast } from 'sonner';

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

  const { 
    isSubscribedTo, 
    subscribe, 
    unsubscribe, 
    isSubscribing, 
    isUnsubscribing 
  } = useArticleSubscriptions(user?.id);

  const { 
    isBookmarked, 
    bookmark, 
    unbookmark, 
    isBookmarking, 
    isUnbookmarking 
  } = useArticleBookmarks(user?.id);

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishDraft = async () => {
    if (!id) return;
    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: 'published', is_public: true } as any)
        .eq('id', id);
      if (error) throw error;
      toast.success('Article published successfully! 🎉');
      setTimeout(() => window.location.reload(), 600);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish article');
    } finally {
      setIsPublishing(false);
    }
  };

  // Fetch article details
  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      if (!id) throw new Error('Article ID is required');

      // First get the post from DB
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!postData) {
        // Fallback to foundation news articles if it exists
        const foundFallback = (FOUNDATION_NEWS_ARTICLES || []).find((a: any) => a.id === id);
        if (foundFallback) {
          return {
            id: foundFallback.id,
            headline: foundFallback.title,
            tagline: foundFallback.summary || '',
            content: foundFallback.sections?.map((s: any) => `## ${s.heading}\n\n${s.body}`).join('\n\n') || foundFallback.summary || '',
            featured_image_url: foundFallback.imageUrl,
            article_category: foundFallback.category || 'career_advice',
            reading_time: foundFallback.readingTimeMinutes || 5,
            word_count: 500,
            created_at: foundFallback.publishedAt || new Date().toISOString(),
            author_id: 'talentxcel-research',
            status: 'published',
            profiles: {
              id: 'talentxcel-research',
              full_name: foundFallback.author?.name || 'TalentXcel Research Team',
              profile_picture_url: foundFallback.author?.avatarUrl,
              title: foundFallback.author?.role || 'Career Research Fellow'
            }
          };
        }
        throw new Error('Article not found');
      }

      // Then get the profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          profile_picture_url,
          title,
          current_company,
          headline,
          location
        `)
        .eq('id', postData.author_id)
        .maybeSingle();

      return {
        ...postData,
        profiles: profileData || null
      };
    },
    enabled: !!id
  });

  // Get subscriber count for the author
  const { data: subscriberCount } = useQuery({
    queryKey: ['subscriberCount', article?.author_id],
    queryFn: async () => {
      if (!article?.author_id) return 0;
      
      const { count, error } = await supabase
        .from('article_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', article.author_id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!article?.author_id
  });

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

  const handleSubscribeToggle = () => {
    if (!article?.author_id || !user) return;
    
    if (isSubscribedTo(article.author_id)) {
      unsubscribe(article.author_id);
    } else {
      subscribe(article.author_id);
    }
  };

  const handleBookmarkToggle = () => {
    if (!article?.id || !user) return;
    
    if (isBookmarked(article.id)) {
      unbookmark(article.id);
    } else {
      bookmark(article.id);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.headline,
          text: article?.tagline,
          url: url
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Article link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="animate-pulse">
            <div className="h-64 bg-gray-200" />
            <CardContent className="p-6 space-y-4">
              <div className="h-8 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Article not found</h2>
              <p className="text-muted-foreground mb-6">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/network/articles">
                <Button>Back to Articles</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/network/articles">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Button>
          </Link>
        </div>

        {/* Draft Notice Banner */}
        {article.status === 'draft' && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 dark:from-amber-950/40 dark:to-orange-950/20 dark:border-amber-800/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 bg-amber-100 dark:bg-amber-900/60 rounded-xl">📝</span>
              <div>
                <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm sm:text-base">This Article is Saved as a Draft</h4>
                <p className="text-xs text-amber-700 dark:text-amber-400">It is currently private and only visible to you. Publish it to make it live for the entire community.</p>
              </div>
            </div>
            {user?.id === article.author_id && (
              <Button
                size="sm"
                onClick={handlePublishDraft}
                disabled={isPublishing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shrink-0 h-9 px-4"
              >
                <Send className="w-3.5 h-3.5" />
                {isPublishing ? "Publishing..." : "Publish Article Now"}
              </Button>
            )}
          </div>
        )}

        {/* Article Card */}
        <Card className="overflow-hidden">
          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={article.featured_image_url}
                alt={article.headline}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <Badge 
                className={`absolute top-4 left-4 ${getCategoryColor(article.article_category)}`}
              >
                {getCategoryLabel(article.article_category)}
              </Badge>
            </div>
          )}

          <CardContent className="p-6 md:p-8">
            {/* Article Header */}
            <div className="space-y-4 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {article.headline}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {article.tagline}
              </p>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.reading_time || 5} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.likes_count || 0} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatTimeAgo(article.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg mb-8">
              <Link to={`/network/people/${article.author_id}`}>
                <Avatar className="h-12 w-12 ring-2 ring-background">
                  <AvatarImage src={article.profiles?.profile_picture_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                    {generateInitials(article.profiles)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link 
                  to={`/network/people/${article.author_id}`}
                  className="font-semibold text-lg hover:text-primary transition-colors"
                >
                  {formatDisplayName(article.profiles)}
                </Link>
                {article.profiles?.title && (
                  <p className="text-muted-foreground">
                    {article.profiles.title}
                    {article.profiles?.current_company && ` at ${article.profiles.current_company}`}
                  </p>
                )}
                {article.profiles?.headline && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {article.profiles.headline}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span>{subscriberCount} followers</span>
                  {article.profiles?.location && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{article.profiles.location}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {user && user.id !== article.author_id && (
                <Button
                  variant={isSubscribedTo(article.author_id) ? "outline" : "default"}
                  size="sm"
                  onClick={handleSubscribeToggle}
                  disabled={isSubscribing || isUnsubscribing}
                  className="gap-2"
                >
                  {isSubscribedTo(article.author_id) ? (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>

            <Separator className="my-8" />

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {article.content.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="mb-4 leading-relaxed text-gray-700">
                    {paragraph}
                  </p>
                )
              ))}
            </div>

            <Separator className="my-8" />

            {/* Article Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PostActions
                  postId={article.id}
                  initialLikes={article.likes_count || 0}
                  initialComments={article.comments_count || 0}
                  initialShares={article.shares_count || 0}
                  onCommentClick={() => setShowComments(!showComments)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmarkToggle}
                  disabled={isBookmarking || isUnbookmarking}
                  className={isBookmarked(article.id) ? "text-primary" : ""}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked(article.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-8 pt-8 border-t">
                <CommentsSection
                  postId={article.id}
                  isOpen={true}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArticleDetail;