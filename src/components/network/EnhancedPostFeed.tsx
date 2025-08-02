import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, User, Heart, MessageCircle, Share, Calendar, Sparkles } from 'lucide-react';
import { BotPostCard } from '@/components/posts/BotPostCard';
import { useBotIdentity } from '@/hooks/useBotIdentity';

interface Post {
  id: string;
  headline: string;
  content: string;
  created_at: string;
  is_bot_post: boolean;
  bot_id?: string;
  origin?: string;
  author_id: string;
  user_id: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  profiles?: {
    full_name: string;
    profile_picture_url?: string;
  };
}

interface RegularPostCardProps {
  post: Post;
}

const RegularPostCard: React.FC<RegularPostCardProps> = ({ post }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* User Identity Header */}
        <div className="flex items-center gap-3 mb-4">
          {/* User Avatar */}
          <div className="relative">
            {post.profiles?.profile_picture_url ? (
              <img 
                src={post.profiles.profile_picture_url} 
                alt={post.profiles.full_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">
                {post.profiles?.full_name || 'User'}
              </h3>
              <Badge variant="outline" className="text-xs">
                Professional
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-3">
          {post.headline && (
            <h2 className="text-lg font-semibold leading-tight">
              {post.headline}
            </h2>
          )}
          
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{post.likes_count || 0}</span>
            </button>
            
            <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments_count || 0}</span>
            </button>
            
            <button className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors">
              <Share className="h-4 w-4" />
              <span className="text-sm">{post.shares_count || 0}</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const EnhancedPostFeed: React.FC = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bot' | 'user'>('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          headline,
          content,
          created_at,
          is_bot_post,
          bot_id,
          origin,
          author_id,
          user_id,
          likes_count,
          comments_count,
          shares_count,
          profiles!inner(full_name, profile_picture_url)
        `)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'bot') return post.is_bot_post;
    if (filter === 'user') return !post.is_bot_post;
    return true;
  });

  const botPostsCount = posts.filter(p => p.is_bot_post).length;
  const userPostsCount = posts.filter(p => !p.is_bot_post).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Post Feed</h2>
          <p className="text-muted-foreground">
            Posts from users and AI bots with proper identity display
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {posts.length} Total Posts
          </Badge>
          <Badge variant="outline">
            {botPostsCount} Bot Posts
          </Badge>
          <Badge variant="outline">
            {userPostsCount} User Posts
          </Badge>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Posts
        </Button>
        <Button
          variant={filter === 'bot' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('bot')}
          className="flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          Bot Posts ({botPostsCount})
        </Button>
        <Button
          variant={filter === 'user' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('user')}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          User Posts ({userPostsCount})
        </Button>
      </div>

      {/* Post Feed */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                {filter === 'bot' ? (
                  <Bot className="h-12 w-12 text-muted-foreground" />
                ) : filter === 'user' ? (
                  <User className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <MessageCircle className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-medium mb-2">No Posts Found</h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'bot' 
                  ? 'No bot posts available yet'
                  : filter === 'user'
                  ? 'No user posts available yet'
                  : 'No posts available yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            post.is_bot_post ? (
              <BotPostCard key={post.id} post={post} />
            ) : (
              <RegularPostCard key={post.id} post={post} />
            )
          ))
        )}
      </div>

      {/* Demo Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Bot Identity System Active</p>
              <p className="text-blue-700">
                This feed demonstrates the unified bot posting system. Bot posts show with AI assistant badges, 
                while regular user posts display normally. Each bot maintains its own identity and posting history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};