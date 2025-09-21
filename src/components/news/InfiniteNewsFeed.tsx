import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedNewsCard } from "@/components/news/EnhancedNewsCard";
import { useNewsArticles } from "@/hooks/useNewsArticles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface InfiniteNewsFeedProps {
  category?: string;
  searchQuery?: string;
  sortBy?: 'latest' | 'trending' | 'engagement';
  pageSize?: number;
}

export const InfiniteNewsFeed: React.FC<InfiniteNewsFeedProps> = ({
  category = 'all',
  searchQuery = '',
  sortBy = 'latest',
  pageSize = 10
}) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const loadingRef = useRef(false);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-time news updates
  useEffect(() => {
    if (!isOnline) return;

    const channel = supabase
      .channel('news-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news_articles'
        },
        (payload) => {
          const newArticle = payload.new;
          setArticles(prev => [newArticle, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'news_articles'
        },
        (payload) => {
          const updatedArticle = payload.new;
          setArticles(prev => prev.map(article => 
            article.id === updatedArticle.id ? updatedArticle : article
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline]);

  const loadArticles = useCallback(async (pageNum: number, reset = false) => {
    if (loadingRef.current || (!hasMore && !reset)) return;
    
    loadingRef.current = true;
    setLoading(true);

    try {
      let query = supabase
        .from('news_articles')
        .select('*')
        .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

      // Apply filters
      if (category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'trending':
          query = query.order('engagement_score', { ascending: false });
          break;
        case 'engagement':
          query = query.order('sentiment_score', { ascending: false });
          break;
        default:
          query = query.order('published_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      const newArticles = data || [];
      
      if (reset) {
        setArticles(newArticles);
        setPage(0);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
      }

      setHasMore(newArticles.length === pageSize);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [category, searchQuery, sortBy, pageSize, hasMore]);

  // Load more when in view
  useEffect(() => {
    if (inView && hasMore && !loading && isOnline) {
      loadArticles(page + 1);
    }
  }, [inView, hasMore, loading, page, loadArticles, isOnline]);

  // Reset on filter changes
  useEffect(() => {
    if (isOnline) {
      loadArticles(0, true);
    }
  }, [category, searchQuery, sortBy, isOnline]);

  // Image lazy loading with intersection observer
  const LazyImage: React.FC<{ src: string; alt: string; className: string }> = ({ src, alt, className }) => {
    const [imageSrc, setImageSrc] = useState<string>();
    const [imageRef, imageInView] = useInView({
      triggerOnce: true,
      rootMargin: '50px'
    });

    useEffect(() => {
      if (imageInView) {
        setImageSrc(src);
      }
    }, [imageInView, src]);

    return (
      <div ref={imageRef} className={className}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder on error
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-muted animate-pulse" />
        )}
      </div>
    );
  };

  const handleSaveArticle = useCallback((articleId: string) => {
    setSavedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });

    // Analytics tracking
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'article_save', {
        article_id: articleId,
        user_id: user?.id
      });
    }
  }, [user?.id]);

  const handleRefresh = () => {
    if (isOnline) {
      loadArticles(0, true);
    }
  };

  if (!isOnline) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <CardContent className="text-center py-8">
          <WifiOff className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">You're Offline</h3>
          <p className="text-muted-foreground mb-4">
            Check your internet connection to load the latest news.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Online Status Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wifi className="w-4 h-4 text-green-500" />
          <span>Live updates enabled</span>
        </div>
        <Button onClick={handleRefresh} variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <EnhancedNewsCard
            key={`${article.id}-${index}`}
            article={article}
            variant="full"
            isSaved={savedArticles.has(article.id)}
            onSave={() => handleSaveArticle(article.id)}
            LazyImage={LazyImage}
          />
        ))}
      </div>

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading more articles...</span>
          </div>
        )}
        {!hasMore && articles.length > 0 && (
          <div className="text-center text-muted-foreground">
            <p>You've reached the end!</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-2">
              Load Fresh Content
            </Button>
          </div>
        )}
      </div>

      {/* Performance Metrics (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-2 text-xs text-muted-foreground shadow-lg">
          <div>Articles: {articles.length}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Has More: {hasMore ? 'Yes' : 'No'}</div>
          <div>Online: {isOnline ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};