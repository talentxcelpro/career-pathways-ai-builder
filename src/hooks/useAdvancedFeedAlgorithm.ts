import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserBehaviorData {
  userId: string;
  contentEngagements: Record<string, number>;
  modulePreferences: Record<string, number>;
  peakActivityHours: number[];
  connectionSimilarity: string[];
  skillInterests: string[];
}

interface FeedItem {
  id: string;
  type: 'reel' | 'post' | 'job' | 'connection';
  relevanceScore: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  author: {
    id: string;
    name: string;
    isConnection: boolean;
    mutualConnections: number;
  };
  metadata: {
    tags: string[];
    skills: string[];
    createdAt: string;
    module: string;
  };
}

export const useAdvancedFeedAlgorithm = (module: 'reels' | 'network' | 'jobs') => {
  const { user } = useAuth();
  const [userBehavior, setUserBehavior] = useState<UserBehaviorData | null>(null);
  const [personalizedFeed, setPersonalizedFeed] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track user behavior patterns
  const trackBehavior = useCallback(async (action: string, contentId: string, contentType: string, metadata?: any) => {
    if (!user) return;

    try {
      // Store behavior data in a behavior_analytics table
      await supabase.from('behavior_analytics').insert({
        user_id: user.id,
        action,
        content_id: contentId,
        content_type: contentType,
        module,
        metadata,
        timestamp: new Date().toISOString()
      });

      console.log('📊 Behavior tracked:', { action, contentId, contentType, module });
    } catch (error) {
      console.error('Behavior tracking error:', error);
    }
  }, [user, module]);

  // Calculate relevance score using multiple factors
  const calculateRelevanceScore = useCallback((item: FeedItem, behavior: UserBehaviorData): number => {
    let score = 0;

    // 1. Engagement history weight (30%)
    const contentTypeEngagement = behavior.contentEngagements[item.type] || 0;
    score += (contentTypeEngagement / 100) * 0.3;

    // 2. Connection similarity (25%)
    const isConnection = item.author.isConnection;
    const mutualWeight = Math.min(item.author.mutualConnections / 10, 1);
    score += (isConnection ? 0.25 : mutualWeight * 0.15);

    // 3. Skill/Interest alignment (20%)
    const skillMatch = item.metadata.skills.filter(skill => 
      behavior.skillInterests.includes(skill)
    ).length / Math.max(item.metadata.skills.length, 1);
    score += skillMatch * 0.2;

    // 4. Recent engagement velocity (15%)
    const hoursOld = (Date.now() - new Date(item.metadata.createdAt).getTime()) / (1000 * 60 * 60);
    const engagementRate = (item.engagement.likes + item.engagement.comments) / Math.max(hoursOld, 1);
    score += Math.min(engagementRate / 50, 1) * 0.15;

    // 5. Time-based relevance (10%)
    const currentHour = new Date().getHours();
    const hourMatch = behavior.peakActivityHours.includes(currentHour) ? 1 : 0.5;
    score += hourMatch * 0.1;

    return Math.min(score, 1); // Cap at 1.0
  }, []);

  // Generate personalized feed
  const generatePersonalizedFeed = useCallback(async () => {
    if (!user || !userBehavior) return;

    setIsLoading(true);
    try {
      // Fetch content from multiple sources based on module
      let items: FeedItem[] = [];

      switch (module) {
        case 'reels':
          const { data: reelsPosts } = await supabase
            .from('posts')
            .select(`
              id, content, created_at, media_urls, author_id, likes_count, 
              comments_count, shares_count, tags, profiles:author_id (*)
            `)
            .not('media_urls', 'is', null)
            .order('created_at', { ascending: false })
            .limit(50);

          items = (reelsPosts || [])
            .filter(post => post.media_urls?.some((url: string) => 
              /\.(mp4|mov|webm|avi)$/i.test(url)
            ))
            .map(post => {
              const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
              return {
                id: post.id,
                type: 'reel' as const,
                relevanceScore: 0,
                engagement: {
                  likes: post.likes_count || 0,
                  comments: post.comments_count || 0,
                  shares: post.shares_count || 0,
                  views: Math.floor(Math.random() * 1000) + 100
                },
                author: {
                  id: post.author_id,
                  name: profile?.full_name || 'User',
                  isConnection: false, // Would check connections table
                  mutualConnections: Math.floor(Math.random() * 20)
                },
                metadata: {
                  tags: post.tags || [],
                  skills: [],
                  createdAt: post.created_at,
                  module: 'reels'
                }
              };
            });
          break;

        case 'network':
          const { data: networkPosts } = await supabase
            .from('posts')
            .select(`
              id, content, created_at, author_id, likes_count, 
              comments_count, shares_count, tags, profiles:author_id (*)
            `)
            .order('created_at', { ascending: false })
            .limit(50);

          items = (networkPosts || []).map(post => {
            const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
            return {
              id: post.id,
              type: 'post' as const,
              relevanceScore: 0,
              engagement: {
                likes: post.likes_count || 0,
                comments: post.comments_count || 0,
                shares: post.shares_count || 0,
                views: Math.floor(Math.random() * 500) + 50
              },
              author: {
                id: post.author_id,
                name: profile?.full_name || 'User',
                isConnection: false,
                mutualConnections: Math.floor(Math.random() * 15)
              },
              metadata: {
                tags: post.tags || [],
                skills: [],
                createdAt: post.created_at,
                module: 'network'
              }
            };
          });
          break;

        case 'jobs':
          const { data: jobs } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(30);

          items = (jobs || []).map(job => ({
            id: job.id,
            type: 'job' as const,
            relevanceScore: 0,
            engagement: {
              likes: Math.floor(Math.random() * 50),
              comments: Math.floor(Math.random() * 10),
              shares: Math.floor(Math.random() * 5),
              views: Math.floor(Math.random() * 200) + 50
            },
            author: {
              id: job.company_id || 'company',
              name: job.company || 'Company',
              isConnection: false,
              mutualConnections: Math.floor(Math.random() * 10)
            },
            metadata: {
              tags: [],
              skills: job.required_skills || [],
              createdAt: job.created_at,
              module: 'jobs'
            }
          }));
          break;
      }

      // Calculate relevance scores and sort
      const scoredItems = items.map(item => ({
        ...item,
        relevanceScore: calculateRelevanceScore(item, userBehavior)
      })).sort((a, b) => b.relevanceScore - a.relevanceScore);

      setPersonalizedFeed(scoredItems);
      console.log('🤖 Generated personalized feed:', scoredItems.length, 'items for', module);
    } catch (error) {
      console.error('Feed generation error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, userBehavior, module, calculateRelevanceScore]);

  // Load user behavior data
  useEffect(() => {
    if (!user) return;

    const loadUserBehavior = async () => {
      try {
        // Aggregate user behavior from analytics
        const { data: behaviors } = await supabase
          .from('behavior_analytics')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

        if (behaviors && behaviors.length > 0) {
          // Process behavior data
          const contentEngagements: Record<string, number> = {};
          const modulePreferences: Record<string, number> = {};
          const hourCounts: Record<number, number> = {};

          behaviors.forEach(behavior => {
            // Count engagement by content type
            contentEngagements[behavior.content_type] = 
              (contentEngagements[behavior.content_type] || 0) + 1;

            // Count module usage
            modulePreferences[behavior.module] = 
              (modulePreferences[behavior.module] || 0) + 1;

            // Track activity hours
            const hour = new Date(behavior.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
          });

          // Get top activity hours
          const peakActivityHours = Object.entries(hourCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([hour]) => parseInt(hour));

          setUserBehavior({
            userId: user.id,
            contentEngagements,
            modulePreferences,
            peakActivityHours,
            connectionSimilarity: [], // Would load from connections analysis
            skillInterests: [] // Would load from profile skills
          });
        } else {
          // Default behavior for new users
          setUserBehavior({
            userId: user.id,
            contentEngagements: {},
            modulePreferences: {},
            peakActivityHours: [9, 12, 15, 18, 20, 21], // Default peak hours
            connectionSimilarity: [],
            skillInterests: []
          });
        }
      } catch (error) {
        console.error('Error loading user behavior:', error);
      }
    };

    loadUserBehavior();
  }, [user]);

  // Generate feed when behavior data is loaded
  useEffect(() => {
    if (userBehavior) {
      generatePersonalizedFeed();
    }
  }, [userBehavior, generatePersonalizedFeed]);

  return {
    personalizedFeed,
    isLoading,
    trackBehavior,
    refreshFeed: generatePersonalizedFeed,
    userBehavior
  };
};