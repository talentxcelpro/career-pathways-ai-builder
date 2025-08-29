import React, { memo, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OptimizedNetworkPostCard } from '@/components/performance/OptimizedNetworkPostCard';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, Zap, Brain } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface SmartFeedPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  headline?: string;
  media_urls?: string[];
  tags?: string[];
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  engagement_score?: number;
  similarity_score?: number;
  trending_score?: number;
  profiles?: {
    id: string;
    full_name?: string;
    profile_picture_url?: string;
    title?: string;
    current_company?: string;
    pro_plan?: string;
    pro_status?: string;
    pro_expires_at?: string;
  };
}

interface SmartFeedAlgorithmProps {
  userId?: string | null;
  feedType?: 'smart' | 'trending' | 'personalized';
  className?: string;
}

// Advanced engagement scoring function
const calculateEngagementScore = (post: SmartFeedPost): number => {
  const likes = post.likes_count || 0;
  const comments = post.comments_count || 0;
  const shares = post.shares_count || 0;
  
  // Weighted scoring system
  const engagementScore = (likes * 1) + (comments * 3) + (shares * 5);
  
  // Time decay factor
  const postAge = Date.now() - new Date(post.created_at).getTime();
  const hoursAge = postAge / (1000 * 60 * 60);
  const timeDecay = Math.exp(-hoursAge / 24); // 24-hour half-life
  
  return engagementScore * timeDecay;
};

// Content similarity scoring
const calculateContentSimilarity = (post: SmartFeedPost, userPreferences: string[]): number => {
  if (!userPreferences.length) return 0.5; // Default neutral score
  
  const content = (post.content + ' ' + (post.headline || '')).toLowerCase();
  const matchCount = userPreferences.filter(pref => 
    content.includes(pref.toLowerCase())
  ).length;
  
  return Math.min(matchCount / userPreferences.length, 1);
};

const SmartFeedAlgorithmComponent: React.FC<SmartFeedAlgorithmProps> = ({
  userId,
  feedType = 'smart',
  className
}) => {
  const queryClient = useQueryClient();

  // Get user's interaction history and preferences
  const { data: userPreferences = [] } = useQuery({
    queryKey: ['user-preferences', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data } = await supabase
        .from('user_feed_preferences')
        .select('preference_value, weight')
        .eq('user_id', userId)
        .order('weight', { ascending: false });
      
      return data?.map(p => p.preference_value) || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get user's connection network for personalization
  const { data: connectionIds = [] } = useQuery({
    queryKey: ['user-connections', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('status', 'accepted');
      
      const ids = new Set<string>();
      data?.forEach(conn => {
        if (conn.requester_id === userId) ids.add(conn.recipient_id);
        if (conn.recipient_id === userId) ids.add(conn.requester_id);
      });
      
      return Array.from(ids);
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Smart feed algorithm with AI-powered ranking
  const { data: smartPosts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['smart-feed', userId, feedType, connectionIds, userPreferences],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            full_name,
            profile_picture_url,
            title,
            current_company,
            pro_plan,
            pro_status,
            pro_expires_at
          )
        `)
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      // Apply algorithm-specific filtering
      if (feedType === 'trending') {
        // Focus on high-engagement recent posts
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', yesterday);
      } else if (feedType === 'personalized' && connectionIds.length > 0) {
        // Prioritize posts from connections
        query = query.in('author_id', connectionIds);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      // Apply smart ranking algorithm
      const rankedPosts = (data as SmartFeedPost[])
        .map(post => {
          // Calculate multiple scoring factors
          const engagementScore = calculateEngagementScore(post);
          const similarityScore = calculateContentSimilarity(post, userPreferences);
          const connectionBoost = connectionIds.includes(post.author_id) ? 1.5 : 1;
          
          // Trending boost based on velocity
          const postAge = Date.now() - new Date(post.created_at).getTime();
          const hoursAge = postAge / (1000 * 60 * 60);
          const trendingBoost = hoursAge < 6 ? 1.3 : hoursAge < 24 ? 1.1 : 1;
          
          // Composite smart score
          const smartScore = (
            engagementScore * 0.4 +
            similarityScore * 0.3 +
            (connectionBoost - 1) * 0.2 +
            (trendingBoost - 1) * 0.1
          );

          return {
            ...post,
            engagement_score: engagementScore,
            similarity_score: similarityScore,
            trending_score: smartScore
          };
        })
        .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0));

      return rankedPosts.slice(0, 20); // Return top 20 smartly ranked posts
    },
    enabled: true,
    refetchInterval: 60000, // Refresh every minute for real-time updates
  });

  // Track user engagement for algorithm improvement
  const trackEngagement = useCallback(async (postId: string, engagementType: string) => {
    if (!userId) return;

    try {
      await supabase.from('post_analytics').insert({
        post_id: postId,
        user_id: userId,
        engagement_type: engagementType,
        engagement_value: 1,
        created_at: new Date().toISOString()
      });

      // Update user interaction patterns
      const postAuthor = smartPosts.find(p => p.id === postId)?.author_id;
      if (postAuthor && postAuthor !== userId) {
        await supabase.rpc('update_user_interaction', {
          p_user_id: userId,
          p_target_user_id: postAuthor,
          p_interaction_type: 'post_engagement',
          p_strength_increment: engagementType === 'view' ? 0.1 : 1
        });
      }
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }, [userId, smartPosts]);

  // Memoized algorithm indicator
  const AlgorithmIndicator = useMemo(() => {
    const getAlgorithmInfo = () => {
      switch (feedType) {
        case 'trending':
          return {
            icon: <TrendingUp className="h-4 w-4" />,
            label: 'Trending Algorithm',
            description: 'High-velocity posts with growing engagement'
          };
        case 'personalized':
          return {
            icon: <Brain className="h-4 w-4" />,
            label: 'Personalized AI',
            description: 'Tailored based on your interests and connections'
          };
        default:
          return {
            icon: <Zap className="h-4 w-4" />,
            label: 'Smart Feed',
            description: 'AI-powered mix of relevance and engagement'
          };
      }
    };

    const info = getAlgorithmInfo();
    
    return (
      <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          {info.icon}
          <Badge variant="secondary" className="text-xs">
            {info.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{info.description}</p>
      </div>
    );
  }, [feedType]);

  if (isLoading) {
    return (
      <div className={className}>
        {AlgorithmIndicator}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-card/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Smart Feed Unavailable
            </h3>
            <p className="text-muted-foreground mb-4">
              Unable to load your personalized feed. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry Smart Feed
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (smartPosts.length === 0) {
    return (
      <div className={className}>
        {AlgorithmIndicator}
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Building Your Smart Feed
            </h3>
            <p className="text-muted-foreground">
              The AI algorithm is learning your preferences. Connect with more professionals 
              and engage with content to improve your personalized feed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {AlgorithmIndicator}
      
      <div className="space-y-6">
        {smartPosts.map((post, index) => (
          <div key={post.id} className="relative">
            {/* Algorithm confidence indicator */}
            {post.trending_score && post.trending_score > 5 && (
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  <Zap className="h-3 w-3 mr-1" />
                  High Match
                </Badge>
              </div>
            )}
            
            <OptimizedNetworkPostCard
              post={post}
              currentUserId={userId}
              onCommentClick={(postId) => {
                trackEngagement(postId, 'comment');
              }}
            />
            
            {/* Engagement tracking on view */}
            <div 
              className="absolute inset-0 pointer-events-none"
              onMouseEnter={() => trackEngagement(post.id, 'view')}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SmartFeedAlgorithm = memo(SmartFeedAlgorithmComponent);
SmartFeedAlgorithm.displayName = 'SmartFeedAlgorithm';