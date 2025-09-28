import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, TrendingUp, Users, Camera, Link as LinkIcon, Video, MessageCircle, Briefcase } from "lucide-react";
import { PostCard } from "./PostCard";
import { StoriesCarousel } from "./StoriesCarousel";
import { StoryViewer } from "./StoryViewer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VideoThumbnail } from "@/components/media/VideoThumbnail";

interface Post {
  id: string;
  author_id: string;
  content: string;
  media_url?: string;
  video_url?: string;
  post_type: 'text' | 'image' | 'video' | 'poll' | 'achievement' | 'job_update';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  author?: {
    id?: string;
    full_name: string;
    profile_picture_url?: string;
    title?: string;
    user_role: string;
    username?: string;
    slug?: string;
  };
  liked_by_user?: boolean;
}

interface CreatePostData {
  content: string;
  post_type: 'text' | 'image' | 'video' | 'poll' | 'achievement' | 'job_update';
  media_url?: string;
  video_url?: string;
}

export function ProfessionalFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [postType, setPostType] = useState<CreatePostData['post_type']>('text');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyViewer, setStoryViewer] = useState<{isOpen: boolean; userId?: string; storyIndex?: number}>({
    isOpen: false
  });
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
          video_url,
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

      // Get author profiles with username and slug for clickable profiles
      const authorIds = [...new Set(postsData.map(post => post.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, username, slug')
        .in('id', authorIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Get current user to check if they liked posts
      const { data: { user } } = await supabase.auth.getUser();
      
      const formattedPosts: Post[] = postsData.map(post => ({
        id: post.id,
        author_id: post.author_id,
        content: post.content,
        media_url: post.media_urls?.[0] || undefined,
        video_url: post.video_url || undefined,
        post_type: post.post_type as 'text' | 'image' | 'video' | 'poll' | 'achievement' | 'job_update',
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        created_at: post.created_at,
        author: {
          id: post.author_id,
          full_name: profilesMap.get(post.author_id)?.full_name || 'Professional User',
          profile_picture_url: profilesMap.get(post.author_id)?.profile_picture_url,
          title: profilesMap.get(post.author_id)?.title || 'Professional',
          username: profilesMap.get(post.author_id)?.username,
          slug: profilesMap.get(post.author_id)?.slug,
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

      const postData: any = {
        author_id: user.id,
        content: newPost,
        post_type: postType
      };

      if (postType === 'video' && videoUrl.trim()) {
        postData.video_url = videoUrl.trim();
      }

      const { error } = await supabase
        .from('posts')
        .insert(postData);

      if (error) throw error;

      setNewPost("");
      setVideoUrl("");
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
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to like posts",
          variant: "destructive",
        });
        return;
      }

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, likes_count: Math.max(0, post.likes_count - 1), liked_by_user: false }
              : post
          )
        );
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, likes_count: post.likes_count + 1, liked_by_user: true }
              : post
          )
        );
      }

      // Add haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <TrendingUp className="w-4 h-4" />;
      case 'job_update': return <Briefcase className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'poll': return <Users className="w-4 h-4" />;
      default: return null;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-success/10 text-success';
      case 'job_update': return 'bg-primary/10 text-primary';
      case 'video': return 'bg-red-500/10 text-red-500';
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
      {/* Stories Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Stories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <StoriesCarousel 
            onCreateStory={() => setShowCreateStory(true)}
            onStoryClick={(userId, storyIndex) => {
              setStoryViewer({ isOpen: true, userId, storyIndex });
            }}
          />
        </CardContent>
      </Card>

      {/* Create Post */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Share Your Professional Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            {[
              { type: 'text', label: 'Text', icon: MessageCircle },
              { type: 'video', label: 'Video', icon: Video },
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
          
          {postType === 'video' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Video URL</label>
              <input
                type="url"
                placeholder="Paste YouTube, Vimeo, or video URL here..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {videoUrl && (
                <div className="mt-2">
                  <VideoThumbnail url={videoUrl} className="max-w-sm" />
                </div>
              )}
            </div>
          )}
          
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
              disabled={!newPost.trim() || isPosting || (postType === 'video' && !videoUrl.trim())}
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            onComment={(postId) => console.log('Comment on post:', postId)}
            onShare={(postId) => console.log('Share post:', postId)}
          />
        ))}
      </div>

      {/* Story Viewer Modal */}
      <StoryViewer
        isOpen={storyViewer.isOpen}
        onClose={() => setStoryViewer({ isOpen: false })}
        userId={storyViewer.userId}
        storyIndex={storyViewer.storyIndex}
      />
    </div>
  );
}