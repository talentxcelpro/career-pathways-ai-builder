import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, TrendingUp, Briefcase, Users, Camera, Link as LinkIcon, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  author_id: string;
  content: string;
  media_url?: string;
  post_type: 'text' | 'image' | 'poll' | 'achievement' | 'job_update';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url?: string;
    title?: string;
    user_role: string;
  };
  liked_by_user?: boolean;
}

interface CreatePostData {
  content: string;
  post_type: 'text' | 'image' | 'poll' | 'achievement' | 'job_update';
  media_url?: string;
}

export function ProfessionalFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState<CreatePostData['post_type']>('text');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Fetch real posts from database with author profiles
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          id,
          author_id,
          content,
          media_urls,
          post_type,
          likes_count,
          comments_count,
          shares_count,
          created_at
        `)
        .eq('status', 'published')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Get author profiles
      const authorIds = [...new Set(postsData.map(post => post.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title')
        .in('id', authorIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Get current user to check if they liked posts
      const { data: { user } } = await supabase.auth.getUser();
      
      const formattedPosts: Post[] = postsData.map(post => ({
        id: post.id,
        author_id: post.author_id,
        content: post.content,
        media_url: post.media_urls?.[0] || undefined,
        post_type: post.post_type as 'text' | 'image' | 'poll' | 'achievement' | 'job_update',
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        created_at: post.created_at,
        author: {
          full_name: profilesMap.get(post.author_id)?.full_name || 'Professional User',
          avatar_url: profilesMap.get(post.author_id)?.profile_picture_url,
          title: profilesMap.get(post.author_id)?.title || 'Professional',
          user_role: 'candidate'
        },
        liked_by_user: false // We'll implement this with proper post_reactions query later
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;

    setIsPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: newPost,
          post_type: postType
        });

      if (error) throw error;

      setNewPost("");
      setPostType('text');
      await fetchPosts();
      
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('post_reactions')
        .upsert({
          post_id: postId,
          user_id: user.id,
          reaction_type: 'like'
        });

      if (error) throw error;

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes_count: post.likes_count + 1, liked_by_user: true }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <TrendingUp className="w-4 h-4" />;
      case 'job_update': return <Briefcase className="w-4 h-4" />;
      case 'poll': return <Users className="w-4 h-4" />;
      default: return null;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-success/10 text-success';
      case 'job_update': return 'bg-primary/10 text-primary';
      case 'poll': return 'bg-accent/10 text-accent';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Share an update</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            {[
              { type: 'text', label: 'Text', icon: MessageCircle },
              { type: 'achievement', label: 'Achievement', icon: TrendingUp },
              { type: 'job_update', label: 'Job Update', icon: Briefcase },
              { type: 'poll', label: 'Poll', icon: Users },
            ].map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant={postType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setPostType(type as CreatePostData['post_type'])}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
          
          <Textarea
            placeholder="What's on your mind? Share career insights, achievements, or ask questions..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px]"
          />
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Photo
              </Button>
              <Button variant="ghost" size="sm">
                <LinkIcon className="w-4 h-4 mr-2" />
                Link
              </Button>
            </div>
            
            <Button 
              onClick={createPost} 
              disabled={!newPost.trim() || isPosting}
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <Avatar>
                  <AvatarImage src={post.author?.avatar_url} />
                  <AvatarFallback>
                    {post.author?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{post.author?.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {post.author?.title} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {post.post_type !== 'text' && (
                        <Badge variant="secondary" className={getPostTypeColor(post.post_type)}>
                          {getPostTypeIcon(post.post_type)}
                          <span className="ml-1 capitalize">{post.post_type.replace('_', ' ')}</span>
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                  
                  {post.media_url && (
                    <img 
                      src={post.media_url} 
                      alt="Post media" 
                      className="rounded-lg max-w-full h-auto"
                    />
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likePost(post.id)}
                        className={post.liked_by_user ? "text-red-500" : ""}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${post.liked_by_user ? 'fill-current' : ''}`} />
                        {post.likes_count}
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {post.comments_count}
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        {post.shares_count}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}