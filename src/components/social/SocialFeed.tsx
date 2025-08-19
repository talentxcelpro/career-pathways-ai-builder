import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { SocialPostCard } from './SocialPostCard';

interface Post {
  id: string;
  content: string;
  headline?: string;
  media_urls: string[];
  created_at: string;
  location?: string;
  post_type: 'text' | 'image' | 'video' | 'article';
  visibility: 'public' | 'connections' | 'private';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  profiles: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    headline?: string;
    current_company?: string;
  };
  author_id: string;
}

interface SocialFeedProps {
  feedType?: 'global' | 'following' | 'trending';
  userId?: string;
  limit?: number;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ 
  feedType = 'global', 
  userId,
  limit = 10 
}) => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch posts based on feed type
  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['social-feed', feedType, userId, refreshKey],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(
            id,
            full_name,
            profile_picture_url,
            headline,
            current_company
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply filters based on feed type
      if (feedType === 'following' && user) {
        // Get posts from connections only
        const { data: connections } = await supabase
          .from('connections')
          .select('recipient_id, requester_id')
          .or(`recipient_id.eq.${user.id},requester_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (connections && connections.length > 0) {
          const connectionIds = connections.map(conn => 
            conn.recipient_id === user.id ? conn.requester_id : conn.recipient_id
          );
          query = query.in('author_id', [...connectionIds, user.id]);
        } else {
          // If no connections, show only user's posts
          query = query.eq('author_id', user.id);
        }
      } else if (feedType === 'trending') {
        // Show posts with high engagement from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query
          .gte('created_at', weekAgo.toISOString())
          .order('likes_count', { ascending: false });
      } else if (userId) {
        // Show posts from specific user
        query = query.eq('author_id', userId);
      } else {
        // Global feed - show public posts
        query = query.eq('visibility', 'public');
      }

      const { data, error } = await query.limit(limit);
      if (error) throw error;
      return data as unknown as Post[];
    },
    enabled: !!user
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
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
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load posts. Please try again later.
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
          <p className="text-muted-foreground">
            {feedType === 'following' 
              ? "Connect with people to see their posts here!"
              : "Be the first to share something with your network!"
            }
          </p>
          {feedType !== 'global' && (
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <SocialPostCard 
          key={post.id} 
          post={post}
          showActions={true}
        />
      ))}
      
      {posts.length >= limit && (
        <div className="text-center py-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
};