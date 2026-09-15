import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocialProof } from '@/hooks/useSocialProof';
import { TrendingUp, Flame, Eye, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TrendingFeedProps {
  variant?: 'default' | 'compact';
  limit?: number;
  showActivityIndicators?: boolean;
  className?: string;
}

export const TrendingFeed: React.FC<TrendingFeedProps> = ({
  variant = 'default',
  limit = 10,
  showActivityIndicators = true,
  className
}) => {
  const {
    trendingContent,
    activityIndicators,
    isLoading,
    getTrendingPosts,
    getActiveUsersCount,
    formatActivityMessage
  } = useSocialProof();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading trending content...</p>
        </CardContent>
      </Card>
    );
  }

  const trendingPosts = getTrendingPosts().slice(0, limit);
  const activeUsers = getActiveUsersCount();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Now
            </CardTitle>
            <CardDescription>
              What's hot in your network
            </CardDescription>
          </div>
          {activeUsers > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {activeUsers}+ active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showActivityIndicators && activityIndicators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-4"
          >
            <p className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              {formatActivityMessage(activityIndicators[0])}
            </p>
          </motion.div>
        )}

        <ScrollArea className={cn(variant === 'compact' ? 'h-[300px]' : 'h-[500px]')}>
          <div className="space-y-3">
            {trendingPosts.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      #{index + 1}
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-2 mb-2">
                      {item.content?.content || 'Trending post'}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{(item.engagement_score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span>+{item.velocity} eng/hr</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {trendingPosts.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No trending content yet. Be the first to post!
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
