import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Eye, Heart, MessageCircle, Share2, UserPlus } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { UniversalShare } from '@/components/shared/UniversalShare';
import { usePublicPostTracking } from '@/hooks/usePublicPostTracking';
import { useSharing } from '@/hooks/useSharing';
import { DOMAIN_CONFIG } from '@/config/domain';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface PublicPostData {
  id: string;
  headline: string;
  content: string;
  created_at: string;
  media_urls?: string[];
  tags?: string[];
  author_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  author: {
    full_name: string;
    avatar_url?: string;
    title?: string;
    user_role?: string;
  };
}

export const PublicPostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<PublicPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  
  const { generatePublicUrl, trackShare } = useSharing();
  
  // Track public post view
  usePublicPostTracking(postId || '', true);

  useEffect(() => {
    if (!postId) {
      setError('Post ID is required');
      setLoading(false);
      return;
    }

    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      
      // Get post with author info
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          id,
          headline,
          content,
          created_at,
          media_urls,
          tags,
          author_id,
          likes_count,
          comments_count,
          shares_count
        `)
        .eq('id', postId)
        .eq('status', 'published')
        .single();

      if (postError) {
        if (postError.code === 'PGRST116') {
          setError('Post not found or not publicly available');
        } else {
          setError('Failed to load post');
        }
        return;
      }

      // Get author info separately
      const { data: authorData, error: authorError } = await supabase
        .from('profiles')
        .select('full_name, profile_picture_url, title, user_role')
        .eq('id', postData.author_id)
        .single();

      // Create the final post object with proper author data
      const finalPost: PublicPostData = {
        ...postData,
        author: authorError || !authorData ? {
          full_name: 'Unknown Author',
          avatar_url: null,
          title: null,
          user_role: null
        } : {
          full_name: authorData.full_name,
          avatar_url: authorData.profile_picture_url || null,
          title: authorData.title || null,
          user_role: authorData.user_role || null
        }
      };

      setPost(finalPost);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform: string) => {
    if (!post) return;

    const shareUrl = generatePublicUrl('post', post.id);
    
    await trackShare({
      contentType: 'post',
      contentId: post.id,
      platform: platform.toLowerCase(),
      shareUrl
    });

    toast({
      title: "Thanks for sharing!",
      description: "Post shared successfully. Join TalentXcel to create your own posts!",
    });
  };

  const handleJoinTalentXcel = () => {
    navigate('/auth/register', { 
      state: { 
        referral: 'public-post',
        postId: post?.id 
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'This post may have been removed or is not publicly available.'}
            </p>
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shareableContent = {
    id: post.id,
    type: 'post' as const,
    title: post.headline,
    description: post.content.substring(0, 160) + '...',
    url: generatePublicUrl('post', post.id),
    author: post.author.full_name,
    hashtags: post.tags || []
  };

  return (
    <>
      <SEOHead
        title={post.headline}
        description={post.content.substring(0, 160) + '...'}
        type="article"
        author={post.author.full_name}
        publishedTime={post.created_at}
        url={generatePublicUrl('post', post.id)}
        keywords={post.tags || []}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80">
        {/* Join TalentXcel CTA Bar */}
        <div className="bg-primary text-primary-foreground py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">👋 Enjoying this content?</span>
              <span className="text-sm opacity-90">Join TalentXcel to create and share your own posts!</span>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleJoinTalentXcel}
              className="shrink-0"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Join Free
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 pt-8">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar_url} />
                  <AvatarFallback>
                    {post.author.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      {post.author.full_name}
                    </h3>
                    {post.author.user_role && (
                      <Badge variant="secondary" className="text-xs">
                        {post.author.user_role}
                      </Badge>
                    )}
                  </div>
                  
                  {post.author.title && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {post.author.title}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-3">{post.headline}</h1>
                <div className="prose max-w-none">
                  {post.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {post.media_urls && post.media_urls.length > 0 && (
                <div className="space-y-2">
                  {post.media_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Post media ${index + 1}`}
                      className="w-full rounded-lg max-h-96 object-cover"
                    />
                  ))}
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Post Stats */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{post.likes_count} likes</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{post.comments_count} comments</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">{post.shares_count} shares</span>
                </div>
              </div>

              {/* Share Section */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Share this post</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShare(!showShare)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                
                {showShare && (
                  <div className="mt-4">
                    <UniversalShare
                      content={shareableContent}
                      variant="compact"
                      showTitle={false}
                      onShareComplete={handleShare}
                    />
                  </div>
                )}
              </div>

              {/* Join CTA */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">
                  Want to engage with this post?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Join TalentXcel to like, comment, and connect with {post.author.full_name} and thousands of other professionals.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button onClick={handleJoinTalentXcel} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Join TalentXcel Free
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/auth/login')}
                  >
                    Already have an account? Sign In
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};