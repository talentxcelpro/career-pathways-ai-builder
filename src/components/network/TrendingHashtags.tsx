import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hash, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrendingHashtag {
  hashtag: string;
  count: number;
  date: string;
}

interface TrendingHashtagsProps {
  className?: string;
  limit?: number;
}

export const TrendingHashtags: React.FC<TrendingHashtagsProps> = ({ 
  className,
  limit = 10 
}) => {
  const { data: hashtags, isLoading } = useQuery({
    queryKey: ['trendingHashtags', limit],
    queryFn: async (): Promise<TrendingHashtag[]> => {
      const { data, error } = await supabase
        .from('trending_hashtags')
        .select('hashtag, count, date')
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Trending Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hashtags || hashtags.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Trending Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No trending hashtags yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Hashtags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hashtags.map((hashtag, index) => (
            <Link
              key={hashtag.hashtag}
              to={`/network?hashtag=${hashtag.hashtag}`}
              className="block group hover:bg-muted/50 -mx-2 p-2 rounded-md transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}.
                  </span>
                  <Badge variant="secondary" className="text-sm">
                    #{hashtag.hashtag}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {hashtag.count} posts
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};