import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SmartFeedPreferences {
  industries: string[];
  hashtags: string[];
  contentTypes: string[];
  excludedAuthors: string[];
  engagementThreshold: number;
  timePreference: 'recent' | 'balanced' | 'evergreen';
  similarityWeight: number;
  networkWeight: number;
  trendingWeight: number;
}

interface UserInteraction {
  targetUserId: string;
  interactionType: 'profile_view' | 'connection_request' | 'message' | 'post_engagement';
  strength: number;
  lastInteraction: string;
}

export const useAdvancedSmartFeed = (feedType: 'all' | 'smart' | 'trending' = 'smart') => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's smart feed preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['smart-feed-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_feed_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Convert database format to preferences object
      const prefs: SmartFeedPreferences = {
        industries: [],
        hashtags: [],
        contentTypes: [],
        excludedAuthors: [],
        engagementThreshold: 1,
        timePreference: 'balanced',
        similarityWeight: 0.3,
        networkWeight: 0.4,
        trendingWeight: 0.3
      };

      data?.forEach(pref => {
        switch (pref.preference_type) {
          case 'industry':
            prefs.industries.push(pref.preference_value);
            break;
          case 'hashtag':
            prefs.hashtags.push(pref.preference_value);
            break;
          case 'content_type':
            prefs.contentTypes.push(pref.preference_value);
            break;
        }
      });

      return prefs;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Get user's interaction history for relationship scoring
  const { data: interactions = [] } = useQuery({
    queryKey: ['user-interactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_interactions')
        .select('target_user_id, interaction_type, interaction_strength, last_interaction')
        .eq('user_id', user.id)
        .order('interaction_strength', { ascending: false })
        .limit(100);

      if (error) throw error;

      return data?.map((interaction): UserInteraction => ({
        targetUserId: interaction.target_user_id || '',
        interactionType: interaction.interaction_type as UserInteraction['interactionType'],
        strength: interaction.interaction_strength || 0,
        lastInteraction: interaction.last_interaction
      })) || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000
  });

  // Advanced smart feed query with ML-inspired ranking
  const {
    data: smartFeed = [],
    isLoading: feedLoading,
    error: feedError,
    refetch: refetchFeed
  } = useQuery({
    queryKey: ['advanced-smart-feed', user?.id, feedType, preferences, interactions],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get base posts
      let postsQuery = supabase
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
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply feed type filters
      if (feedType === 'trending') {
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
        postsQuery = postsQuery.gte('created_at', sixHoursAgo);
      }

      const { data: posts, error } = await postsQuery;
      if (error) throw error;

      // Get engagement analytics for posts
      const postIds = posts?.map(p => p.id) || [];
      const { data: analytics } = await supabase
        .from('post_analytics')
        .select('post_id, engagement_type, engagement_value')
        .in('post_id', postIds);

      // Build engagement map
      const engagementMap = new Map<string, number>();
      analytics?.forEach(analytic => {
        const current = engagementMap.get(analytic.post_id) || 0;
        const weight = analytic.engagement_type === 'like' ? 1 :
                      analytic.engagement_type === 'comment' ? 3 :
                      analytic.engagement_type === 'share' ? 5 : 1;
        engagementMap.set(analytic.post_id, current + (analytic.engagement_value * weight));
      });

      // Advanced ranking algorithm
      const rankedPosts = posts?.map(post => {
        let score = 0;
        const postAge = Date.now() - new Date(post.created_at).getTime();
        const hoursAge = postAge / (1000 * 60 * 60);

        // 1. Time decay factor
        const timeDecay = Math.exp(-hoursAge / 24); // 24-hour half-life
        
        // 2. Engagement score
        const engagementScore = engagementMap.get(post.id) || 0;
        
        // 3. Network relationship score
        const authorInteraction = interactions.find(i => i.targetUserId === post.author_id);
        const networkScore = authorInteraction ? Math.log(1 + authorInteraction.strength) : 0;
        
        // 4. Content similarity score
        let similarityScore = 0;
        if (preferences) {
          const content = (post.content + ' ' + (post.headline || '')).toLowerCase();
          
          // Industry matching
          const industryMatches = preferences.industries.filter(industry =>
            content.includes(industry.toLowerCase()) ||
            post.profiles?.current_company?.toLowerCase().includes(industry.toLowerCase())
          ).length;
          
          // Hashtag matching
          const hashtagMatches = preferences.hashtags.filter(hashtag =>
            post.hashtags?.includes(hashtag) || content.includes(`#${hashtag.toLowerCase()}`)
          ).length;
          
          similarityScore = (industryMatches + hashtagMatches) / 
                           Math.max(preferences.industries.length + preferences.hashtags.length, 1);
        }
        
        // 5. Trending boost
        const trendingBoost = hoursAge < 6 ? 1.5 : hoursAge < 24 ? 1.2 : 1;
        
        // 6. Pro user boost
        const proBoost = post.profiles?.pro_status === 'active' ? 1.1 : 1;

        // Composite score using user preferences or defaults
        const weights = preferences || {
          similarityWeight: 0.3,
          networkWeight: 0.4,
          trendingWeight: 0.3
        };

        score = (
          (engagementScore * timeDecay * weights.trendingWeight) +
          (networkScore * weights.networkWeight) +
          (similarityScore * 10 * weights.similarityWeight) +
          (Math.log(1 + trendingBoost) * 0.1)
        ) * proBoost;

        return {
          ...post,
          smart_score: score,
          engagement_analytics: engagementScore,
          network_score: networkScore,
          similarity_score: similarityScore
        };
      }).sort((a, b) => (b.smart_score || 0) - (a.smart_score || 0)).slice(0, 20) || [];

      return rankedPosts;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000 // Cache for 15 seconds
  });

  // Track engagement for algorithm learning
  const trackEngagementMutation = useMutation({
    mutationFn: async ({
      postId,
      engagementType,
      dwellTime
    }: {
      postId: string;
      engagementType: 'view' | 'like' | 'comment' | 'share' | 'click';
      dwellTime?: number;
    }) => {
      if (!user?.id) return;

      // Record engagement analytics
      await supabase.from('post_analytics').insert({
        post_id: postId,
        user_id: user.id,
        engagement_type: engagementType,
        engagement_value: 1,
        dwell_time_seconds: dwellTime
      });

      // Update user interaction if it's with another user's post
      const post = smartFeed.find(p => p.id === postId);
      if (post && post.author_id !== user.id) {
        await supabase.rpc('update_user_interaction', {
          p_user_id: user.id,
          p_target_user_id: post.author_id,
          p_interaction_type: 'post_engagement',
          p_strength_increment: engagementType === 'view' ? 0.1 : 1
        });
      }
    },
    onSuccess: () => {
      // Refresh feed to update scores
      queryClient.invalidateQueries({ queryKey: ['advanced-smart-feed'] });
    }
  });

  // Update feed preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<SmartFeedPreferences>) => {
      if (!user?.id) return;

      // Delete existing preferences
      await supabase
        .from('user_feed_preferences')
        .delete()
        .eq('user_id', user.id);

      // Insert new preferences
      const prefsToInsert = [];
      
      if (newPreferences.industries) {
        prefsToInsert.push(...newPreferences.industries.map(industry => ({
          user_id: user.id,
          preference_type: 'industry',
          preference_value: industry,
          weight: 1.0
        })));
      }
      
      if (newPreferences.hashtags) {
        prefsToInsert.push(...newPreferences.hashtags.map(hashtag => ({
          user_id: user.id,
          preference_type: 'hashtag',
          preference_value: hashtag,
          weight: 1.0
        })));
      }

      if (prefsToInsert.length > 0) {
        await supabase.from('user_feed_preferences').insert(prefsToInsert);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-feed-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-smart-feed'] });
    }
  });

  return {
    // Data
    smartFeed,
    preferences,
    interactions,
    
    // Loading states
    isLoading: feedLoading || preferencesLoading,
    error: feedError,
    
    // Actions
    refetchFeed,
    trackEngagement: trackEngagementMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,
    
    // Status
    isTrackingEngagement: trackEngagementMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending
  };
};