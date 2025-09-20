import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface SimpleNetworkFeedProps {
  feedType: 'all' | 'connections' | 'trending';
}

export const SimpleNetworkFeed: React.FC<SimpleNetworkFeedProps> = ({ feedType }) => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['simple-posts', feedType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(
            id,
            full_name,
            profile_picture_url,
            title
          )
        `)
        .eq('is_public', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-4">Failed to load posts</p>
        <p className="text-gray-600">{error.message}</p>
      </Card>
    );
  }

  if (!posts?.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">No posts available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="bg-white">
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-center space-x-3 mb-4">
              <Avatar>
                <AvatarImage src={post.profiles?.profile_picture_url} />
                <AvatarFallback>
                  {post.profiles?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {post.profiles?.full_name || 'User'}
                </h3>
                <p className="text-sm text-gray-600">
                  {post.profiles?.title || 'Professional'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Post Content */}
            {post.headline && (
              <h2 className="text-lg font-semibold mb-2">{post.headline}</h2>
            )}
            <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

            {/* Post Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mb-4">
                <img 
                  src={post.media_urls[0]} 
                  alt="Post media"
                  className="w-full rounded-lg max-h-96 object-cover"
                />
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center space-x-6 pt-4 border-t">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>{post.likes_count || 0}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments_count || 0}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>{post.shares_count || 0}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};