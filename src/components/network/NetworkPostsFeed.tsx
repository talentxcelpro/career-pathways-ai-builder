import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NetworkPostCard } from './NetworkPostCard';
import { useRealtimeEngagement } from '@/hooks/useRealtimeEngagement';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from 'lucide-react';

interface NetworkPost {
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

interface NetworkPostsFeedProps {
  feedType?: 'all' | 'smart';
}

export const NetworkPostsFeed: React.FC<NetworkPostsFeedProps> = ({ 
  feedType = 'all' 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openComments, setOpenComments] = useState<string | null>(null);
  
  // Initialize real-time engagement for network module
  const engagement = useRealtimeEngagement('network');

  // Fetch posts with real-time updates
  const { data: posts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['network-posts', feedType],
    queryFn: async () => {
      if (!user) return [];

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

      // Apply smart feed filtering if needed
      if (feedType === 'smart') {
        // Get user's connections for personalization
        const { data: connections } = await supabase
          .from('connections')
          .select('requester_id, recipient_id')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'accepted');

        const connectionIds = new Set<string>();
        connections?.forEach(conn => {
          if (conn.requester_id === user.id) connectionIds.add(conn.recipient_id);
          if (conn.recipient_id === user.id) connectionIds.add(conn.requester_id);
        });

        // Prioritize posts from connections and recent posts
        if (connectionIds.size > 0) {
          query = query.or(`author_id.in.(${Array.from(connectionIds).join(',')}),created_at.gte.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);
        }
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      return data as NetworkPost[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Listen for real-time engagement updates
  React.useEffect(() => {
    if (engagement.isConnected && engagement.events.length > 0) {
      // Refresh posts when engagement updates occur
      const timeoutId = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['network-posts'] });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [engagement.events.length, engagement.isConnected, queryClient]);

  const handleCommentClick = (postId: string) => {
    setOpenComments(openComments === postId ? null : postId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-24" />
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
    );
  }

  if (error) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to load posts
          </h3>
          <p className="text-muted-foreground mb-4">
            We couldn't load the network feed. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="py-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No posts yet
            </h3>
            <p className="text-muted-foreground">
              {feedType === 'smart' 
                ? "Your smart feed will show personalized content once there are more posts from your network."
                : "Be the first to share something with your network!"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time connection status indicator */}
      {engagement.isConnected && (
        <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full inline-flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live updates enabled
        </div>
      )}

      {posts.map((post) => (
        <NetworkPostCard
          key={post.id}
          post={post}
          openComments={openComments}
          onCommentClick={handleCommentClick}
        />
      ))}

      {/* Load more indicator (for future infinite scroll) */}
      {posts.length >= 20 && (
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground text-sm">
              Scroll down to load more posts...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};