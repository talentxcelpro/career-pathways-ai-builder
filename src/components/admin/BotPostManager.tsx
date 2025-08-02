import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Send, Sparkles, Eye, Users, Calendar, Settings } from 'lucide-react';

interface AIBot {
  id: string;
  name: string;
  role: string;
  profile_picture_url?: string;
  content_domains: string[];
  tone_style: string;
  frequency: string;
  is_active: boolean;
}

interface BotPost {
  id: string;
  headline: string;
  content: string;
  created_at: string;
  is_bot_post: boolean;
  bot_id: string;
  origin: string;
  bot?: {
    name: string;
    role: string;
    profile_picture_url?: string;
  };
}

export const BotPostManager: React.FC = () => {
  const { toast } = useToast();
  const [bots, setBots] = useState<AIBot[]>([]);
  const [recentPosts, setRecentPosts] = useState<BotPost[]>([]);
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBots();
    loadRecentBotPosts();
  }, []);

  const loadBots = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_bots')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setBots(data || []);
    } catch (error) {
      console.error('Error loading bots:', error);
      toast({
        title: "Error",
        description: "Failed to load AI bots",
        variant: "destructive",
      });
    }
  };

  const loadRecentBotPosts = async () => {
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
          ai_bots!inner(name, role, profile_picture_url)
        `)
        .eq('is_bot_post', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const formattedPosts = data?.map(post => ({
        ...post,
        bot: Array.isArray(post.ai_bots) ? post.ai_bots[0] : post.ai_bots
      })) || [];
      
      setRecentPosts(formattedPosts);
    } catch (error) {
      console.error('Error loading bot posts:', error);
      toast({
        title: "Error",
        description: "Failed to load recent bot posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBotPost = async () => {
    if (!selectedBot || !postTitle.trim() || !postContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a bot and fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    try {
      const { data, error } = await supabase.rpc('create_bot_post', {
        bot_uuid: selectedBot,
        post_title: postTitle.trim(),
        post_content: postContent.trim(),
        post_type: 'text',
        is_manual: true
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Bot post created successfully",
      });

      // Reset form
      setPostTitle('');
      setPostContent('');
      setSelectedBot('');

      // Reload recent posts
      loadRecentBotPosts();
    } catch (error) {
      console.error('Error creating bot post:', error);
      toast({
        title: "Error",
        description: "Failed to create bot post",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getSelectedBotInfo = () => {
    return bots.find(bot => bot.id === selectedBot);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedBotInfo = getSelectedBotInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bot Post Manager</h2>
          <p className="text-muted-foreground">Create and manage posts from AI bots</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          {bots.length} Active Bots
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Post Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Create Bot Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bot Selection */}
            <div className="space-y-2">
              <Label htmlFor="bot-select">Select Bot</Label>
              <Select value={selectedBot} onValueChange={setSelectedBot}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bot to post as..." />
                </SelectTrigger>
                <SelectContent>
                  {bots.map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      <div className="flex items-center gap-2">
                        {bot.profile_picture_url && (
                          <img 
                            src={bot.profile_picture_url} 
                            alt={bot.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{bot.name}</div>
                          <div className="text-xs text-muted-foreground">{bot.role}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bot Preview */}
            {selectedBotInfo && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {selectedBotInfo.profile_picture_url && (
                      <img 
                        src={selectedBotInfo.profile_picture_url} 
                        alt={selectedBotInfo.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{selectedBotInfo.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedBotInfo.role}</div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {selectedBotInfo.tone_style}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          AI Assistant
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Post Form */}
            <div className="space-y-2">
              <Label htmlFor="post-title">Post Title</Label>
              <Input
                id="post-title"
                placeholder="Enter post title..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-content">Post Content</Label>
              <Textarea
                id="post-content"
                placeholder="Write your post content..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={6}
              />
            </div>

            <Button 
              onClick={createBotPost} 
              disabled={isPosting || !selectedBot || !postTitle.trim() || !postContent.trim()}
              className="w-full"
            >
              {isPosting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Post...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Bot Post
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Bot Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Bot Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {recentPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No bot posts yet</p>
                </div>
              ) : (
                recentPosts.map((post) => (
                  <Card key={post.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {post.bot?.profile_picture_url && (
                          <img 
                            src={post.bot.profile_picture_url} 
                            alt={post.bot.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{post.bot?.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              AI Assistant
                            </Badge>
                            <Badge variant={post.origin === 'manual' ? 'default' : 'outline'} className="text-xs">
                              {post.origin === 'manual' ? 'Manual' : 'AI Generated'}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-1 line-clamp-1">{post.headline}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};