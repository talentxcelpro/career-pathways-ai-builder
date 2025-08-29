import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Eye, TrendingUp, Users, Sparkles, Plus } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  title?: string;
  current_company?: string;
  pro_plan?: string;
  pro_status?: string;
  pro_expires_at?: string;
}

interface ProfileStats {
  profile_views_count: number;
  post_impressions_count: number;
  engagement_score: number;
}

export const UserProfileWidget: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile', currentUser],
    queryFn: async () => {
      if (!currentUser) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          profile_picture_url,
          title,
          current_company,
          pro_plan,
          pro_status,
          pro_expires_at
        `)
        .eq('id', currentUser)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!currentUser,
  });

  // Fetch profile analytics
  const { data: stats } = useQuery({
    queryKey: ['profile-stats', currentUser],
    queryFn: async () => {
      if (!currentUser) return null;

      const { data, error } = await supabase
        .from('profile_analytics')
        .select('profile_views_count, post_impressions_count, engagement_score')
        .eq('user_id', currentUser)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as ProfileStats || { profile_views_count: 0, post_impressions_count: 0, engagement_score: 0 };
    },
    enabled: !!currentUser,
  });

  // Calculate total post impressions from posts
  const { data: postStats } = useQuery({
    queryKey: ['post-impressions', currentUser],
    queryFn: async () => {
      if (!currentUser) return 0;

      const { data, error } = await supabase
        .from('posts')
        .select('likes_count, comments_count, views_count')
        .eq('author_id', currentUser);

      if (error) throw error;
      
      const totalImpressions = data?.reduce((sum, post) => 
        sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.views_count || 0), 0
      ) || 0;
      
      return totalImpressions;
    },
    enabled: !!currentUser,
  });

  if (!profile) {
    return (
      <Card className="border-0 bg-gradient-card shadow-hover">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPro = profile.pro_plan && profile.pro_status === 'active' && 
    profile.pro_expires_at && new Date(profile.pro_expires_at) > new Date();

  const totalImpressions = postStats || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 bg-gradient-card shadow-hover overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile.profile_picture_url} />
                <AvatarFallback>
                  {profile.full_name?.split(' ').map(n => n[0]).join('') || 'TU'}
                </AvatarFallback>
              </Avatar>
              {isPro && (
                <div className="absolute -top-1 -right-1">
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {profile.full_name || 'User'}
                </h3>
                {isPro && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {profile.title || 'Professional'}
                {profile.current_company && (
                  <span> at {profile.current_company}</span>
                )}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center p-3 bg-primary/5 rounded-lg"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Profile viewers</span>
              </div>
              <p className="text-lg font-bold text-primary">
                {stats?.profile_views_count || 12}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-muted-foreground">Post impressions</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {totalImpressions.toLocaleString()}
              </p>
            </motion.div>
          </div>

          {/* Pro Access Section */}
          {isPro ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gradient-primary p-3 rounded-lg text-center"
            >
              <Sparkles className="h-5 w-5 text-white mx-auto mb-1" />
              <p className="text-white text-sm font-medium">
                Access exclusive tools & insights
              </p>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-muted/50 p-3 rounded-lg text-center cursor-pointer"
            >
              <Crown className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-muted-foreground text-sm">
                Upgrade to Pro for advanced features
              </p>
            </motion.div>
          )}

          {/* Engagement Score */}
          {stats?.engagement_score && stats.engagement_score > 0 && (
            <div className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Engagement Score</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {stats.engagement_score.toFixed(1)}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};