import React, { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Hash, Briefcase, MapPin, Flame, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrendingTopic {
  topic: string;
  topic_type: 'hashtag' | 'industry' | 'skill' | 'company';
  trend_score: number;
  velocity_score: number;
  post_count: number;
  engagement_count: number;
  time_period: string;
}

interface EnhancedTrendingSystemProps {
  timeFilter?: '1h' | '6h' | '12h' | '24h' | '7d';
  maxItems?: number;
  showVelocity?: boolean;
}

const EnhancedTrendingSystemComponent: React.FC<EnhancedTrendingSystemProps> = ({
  timeFilter = '24h',
  maxItems = 10,
  showVelocity = true
}) => {
  // Fetch trending topics with multi-factor algorithm
  const { data: trendingTopics = [], isLoading } = useQuery({
    queryKey: ['trending-topics', timeFilter],
    queryFn: async () => {
      // Get trending hashtags
      const { data: hashtags } = await supabase
        .from('posts')
        .select('hashtags, created_at, likes_count, comments_count, shares_count')
        .gte('created_at', getTimeThreshold(timeFilter))
        .not('hashtags', 'is', null)
        .not('hashtags', 'eq', '{}');

      // Get trending industries/companies from content
      const { data: posts } = await supabase
        .from('posts')
        .select('content, created_at, likes_count, comments_count, shares_count, profiles!posts_user_id_fkey(current_company)')
        .gte('created_at', getTimeThreshold(timeFilter));

      // Process hashtags
      const hashtagCounts = new Map<string, { count: number; engagement: number; velocity: number }>();
      hashtags?.forEach(post => {
        const engagement = (post.likes_count || 0) + (post.comments_count || 0) * 2 + (post.shares_count || 0) * 3;
        const postAge = Date.now() - new Date(post.created_at).getTime();
        const recencyBoost = Math.max(0, 1 - (postAge / (24 * 60 * 60 * 1000))); // 24-hour decay
        
        post.hashtags?.forEach((tag: string) => {
          if (tag && tag.length > 2) {
            const current = hashtagCounts.get(tag) || { count: 0, engagement: 0, velocity: 0 };
            hashtagCounts.set(tag, {
              count: current.count + 1,
              engagement: current.engagement + engagement,
              velocity: current.velocity + (1 + recencyBoost)
            });
          }
        });
      });

      // Process companies
      const companyCounts = new Map<string, { count: number; engagement: number; velocity: number }>();
      posts?.forEach(post => {
        if (post.profiles?.current_company) {
          const engagement = (post.likes_count || 0) + (post.comments_count || 0) * 2 + (post.shares_count || 0) * 3;
          const postAge = Date.now() - new Date(post.created_at).getTime();
          const recencyBoost = Math.max(0, 1 - (postAge / (24 * 60 * 60 * 1000)));
          
          const company = post.profiles.current_company;
          const current = companyCounts.get(company) || { count: 0, engagement: 0, velocity: 0 };
          companyCounts.set(company, {
            count: current.count + 1,
            engagement: current.engagement + engagement,
            velocity: current.velocity + (1 + recencyBoost)
          });
        }
      });

      // Convert to trending topics format
      const trending: TrendingTopic[] = [];

      // Add hashtags
      hashtagCounts.forEach((data, hashtag) => {
        const trendScore = (data.count * 0.3) + (data.engagement * 0.4) + (data.velocity * 0.3);
        trending.push({
          topic: hashtag,
          topic_type: 'hashtag',
          trend_score: trendScore,
          velocity_score: data.velocity,
          post_count: data.count,
          engagement_count: data.engagement,
          time_period: timeFilter
        });
      });

      // Add companies
      companyCounts.forEach((data, company) => {
        const trendScore = (data.count * 0.3) + (data.engagement * 0.4) + (data.velocity * 0.3);
        trending.push({
          topic: company,
          topic_type: 'company',
          trend_score: trendScore,
          velocity_score: data.velocity,
          post_count: data.count,
          engagement_count: data.engagement,
          time_period: timeFilter
        });
      });

      return trending
        .sort((a, b) => b.trend_score - a.trend_score)
        .slice(0, maxItems);
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000 // Cache for 2 minutes
  });

  // Get time threshold for filtering
  function getTimeThreshold(period: string): string {
    const now = new Date();
    switch (period) {
      case '1h':
        return new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();
      case '6h':
        return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
      case '12h':
        return new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  }

  // Get icon for topic type
  const getTopicIcon = (type: string) => {
    switch (type) {
      case 'hashtag':
        return <Hash className="h-4 w-4" />;
      case 'company':
        return <Briefcase className="h-4 w-4" />;
      case 'industry':
        return <MapPin className="h-4 w-4" />;
      case 'skill':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Flame className="h-4 w-4" />;
    }
  };

  // Get velocity indicator
  const getVelocityIndicator = (velocity: number) => {
    if (velocity > 10) return { label: 'Exploding', color: 'text-red-500', intensity: 'high' };
    if (velocity > 5) return { label: 'Hot', color: 'text-orange-500', intensity: 'medium' };
    if (velocity > 2) return { label: 'Rising', color: 'text-yellow-500', intensity: 'low' };
    return { label: 'Stable', color: 'text-muted-foreground', intensity: 'stable' };
  };

  // Memoized trending topics list
  const TrendingTopicsList = useMemo(() => {
    return trendingTopics.map((topic, index) => {
      const velocity = getVelocityIndicator(topic.velocity_score);
      
      return (
        <motion.div
          key={`${topic.topic}-${topic.topic_type}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {getTopicIcon(topic.topic_type)}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                #{index + 1}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground truncate">
                  {topic.topic_type === 'hashtag' ? `#${topic.topic}` : topic.topic}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {topic.topic_type}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{topic.post_count} posts</span>
                <span>•</span>
                <span>{topic.engagement_count} engagements</span>
                {showVelocity && (
                  <>
                    <span>•</span>
                    <span className={velocity.color}>{velocity.label}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showVelocity && (
              <div className="flex items-center gap-1">
                <TrendingUp className={`h-3 w-3 ${velocity.color}`} />
                <span className={`text-xs font-medium ${velocity.color}`}>
                  {topic.velocity_score.toFixed(1)}
                </span>
              </div>
            )}
            
            {/* Trend score indicator */}
            <div className="w-2 h-8 bg-muted rounded-full overflow-hidden">
              <div 
                className="bg-primary rounded-full transition-all duration-300"
                style={{ 
                  height: `${Math.min((topic.trend_score / Math.max(...trendingTopics.map(t => t.trend_score))) * 100, 100)}%`,
                  width: '100%'
                }}
              />
            </div>
          </div>
        </motion.div>
      );
    });
  }, [trendingTopics, showVelocity]);

  if (isLoading) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Trending Now</h3>
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {timeFilter}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-4 w-4 bg-muted rounded" />
                <div className="h-4 w-6 bg-muted rounded" />
                <div className="h-4 flex-1 bg-muted rounded" />
                <div className="h-4 w-8 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/60">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Trending Now</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {timeFilter}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {trendingTopics.length} topics
            </Badge>
          </div>
        </div>
        
        {trendingTopics.length === 0 ? (
          <div className="text-center py-6">
            <Flame className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No trending topics in the last {timeFilter}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {TrendingTopicsList}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const EnhancedTrendingSystem = memo(EnhancedTrendingSystemComponent);
EnhancedTrendingSystem.displayName = 'EnhancedTrendingSystem';