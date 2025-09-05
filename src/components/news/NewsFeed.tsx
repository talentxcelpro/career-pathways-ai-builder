import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, RefreshCw, TrendingUp, Briefcase } from 'lucide-react';
import { NewsCard } from './NewsCard';
import { useNewsArticles } from '@/hooks/useNewsArticles';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsFeedProps {
  variant?: 'full' | 'compact';
  maxItems?: number;
  category?: string;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ 
  variant = 'full', 
  maxItems = 10,
  category 
}) => {
  const { data: articles = [], isLoading: loading, error, refetch: refreshArticles } = useNewsArticles();

  const displayArticles = maxItems ? articles.slice(0, maxItems) : articles;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Career News
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: variant === 'compact' ? 3 : 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-20 h-20 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Career News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Failed to load news articles</p>
            <Button onClick={() => refreshArticles()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayArticles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Career News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No news articles available</p>
            <Button onClick={() => refreshArticles()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Latest Career News
            </CardTitle>
            <Button onClick={() => refreshArticles()} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayArticles.map((article) => (
            <NewsCard key={article.id} article={article} variant="compact" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Career News & Insights</h2>
        </div>
        <Button onClick={() => refreshArticles()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};