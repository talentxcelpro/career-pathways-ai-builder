import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Sparkles, Users, Lightbulb, Hash } from 'lucide-react';
import { NetworkPostCard } from "@/components/network/NetworkPostCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

interface SmartFeedProps {
  className?: string;
}

interface TrendingPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  headline?: string;
  engagement_score: number;
  trending_score: number;
  view_count: number;
  profiles?: any;
}

interface TrendingHashtag {
  tag: string;
  usage_count: number;
  growth_rate: number;
}

export const SmartFeed: React.FC<SmartFeedProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'network'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch trending posts
  const { data: trendingPosts, isLoading: loadingTrending, refetch: refetchTrending } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            profile_picture_url,
            title,
            current_company
          )
        `)
        .eq('is_active', true)
        .order('engagement_score', { ascending: false })
        .order('trending_score', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as TrendingPost[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch network posts (from connections)
  const { data: networkPosts, isLoading: loadingNetwork, refetch: refetchNetwork } = useQuery({
    queryKey: ['network-posts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user's connections
      const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const connectionIds = connections?.map(conn => 
        conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
      ) || [];

      if (connectionIds.length === 0) return [];

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            profile_picture_url,
            title,
            current_company
          )
        `)
        .in('author_id', connectionIds)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as TrendingPost[];
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  // Fetch trending hashtags
  const { data: trendingHashtags } = useQuery({
    queryKey: ['trending-hashtags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hashtags')
        .select('tag, usage_count')
        .order('usage_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as TrendingHashtag[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchTrending(), refetchNetwork()]);
    } finally {
      setRefreshing(false);
    }
  };

  const getCurrentPosts = () => {
    switch (activeTab) {
      case 'trending':
        return trendingPosts || [];
      case 'network':
        return networkPosts || [];
      default:
        // Merge and sort by engagement and recency
        const allPosts = [
          ...(trendingPosts || []),
          ...(networkPosts || [])
        ];
        
        // Remove duplicates and sort by smart algorithm
        const uniquePosts = Array.from(
          new Map(allPosts.map(post => [post.id, post])).values()
        );
        
        return uniquePosts.sort((a, b) => {
          const scoreA = (a.engagement_score || 0) + (a.trending_score || 0);
          const scoreB = (b.engagement_score || 0) + (b.trending_score || 0);
          return scoreB - scoreA;
        });
    }
  };

  const posts = getCurrentPosts();
  const isLoading = loadingTrending || loadingNetwork;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Smart Feed Header */}
      <Card className="border-0 bg-gradient-social shadow-hover">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Smart Feed</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-primary/20 hover:bg-primary/5"
            >
              {refreshing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <TrendingUp className="h-4 w-4" />
                </motion.div>
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-background/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All Posts
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="network" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4 mr-1" />
                Network
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Trending Hashtags Widget */}
      {trendingHashtags && trendingHashtags.length > 0 && (
        <Card className="border-0 bg-gradient-card shadow-float">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Trending Topics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {trendingHashtags.slice(0, 8).map((hashtag, index) => (
                <motion.div
                  key={hashtag.tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    #{hashtag.tag} ({hashtag.usage_count})
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                        <div className="space-y-1 mt-4">
                          <div className="h-4 bg-muted rounded" />
                          <div className="h-4 bg-muted rounded w-3/4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                {activeTab === 'network' 
                  ? "Connect with professionals to see their posts here"
                  : "Be the first to share something amazing!"
                }
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NetworkPostCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {posts.length > 0 && (
        <div className="text-center py-6">
          <Button 
            variant="outline" 
            className="border-primary/20 hover:bg-primary/5"
          >
            Load more posts
          </Button>
        </div>
      )}
    </div>
  );
};