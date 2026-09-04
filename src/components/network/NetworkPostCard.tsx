import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { CheckCircle2, Globe, Send, Share2, ThumbsUp, MessageSquare, MoreHorizontal, Copy, X, BookOpen, ArrowRight, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EnhancedCommentsSection } from "@/components/posts/EnhancedCommentsSection";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface NetworkPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  headline?: string;
  tagline?: string;
  article_category?: string;
  featured_image_url?: string;
  reading_time?: number;
  media_urls?: string[];
  post_type?: string;
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
  };
}

interface NetworkPostCardProps {
  post: NetworkPost;
  openComments?: string | null;
  onCommentClick?: (postId: string) => void;
}

export const NetworkPostCard: React.FC<NetworkPostCardProps> = ({
  post,
  openComments,
  onCommentClick
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = React.useState(openComments === post.id);
  const [selectedMediaUrl, setSelectedMediaUrl] = React.useState<string | null>(null);

  const isVideoUrl = (url?: string): boolean => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return (
      cleanUrl.endsWith('.mp4') ||
      cleanUrl.endsWith('.webm') ||
      cleanUrl.endsWith('.mov') ||
      cleanUrl.endsWith('.m4v') ||
      cleanUrl.endsWith('.ogg') ||
      cleanUrl.endsWith('.mkv') ||
      url.includes('/videos/') ||
      url.includes('/video/') ||
      url.includes('post-videos') ||
      url.includes('content-type=video')
    );
  };

  React.useEffect(() => {
    if (openComments !== undefined) {
      setShowComments(openComments === post.id);
    }
  }, [openComments, post.id]);

  // 1. Fetch REAL live engagement counts and like status from Supabase
  const { data: engagement, refetch: refetchEngagement } = useQuery({
    queryKey: ['post-engagement-real', post.id, user?.id],
    queryFn: async () => {
      // Real likes count
      const { count: likesCount } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);

      // Check if current user liked this post
      let isLikedByUser = false;
      if (user?.id) {
        const { data: userLike } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle();
        isLikedByUser = !!userLike;
      }

      // Real comments count
      const { count: commentsCount } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);

      // Real shares count
      const { count: sharesCount } = await supabase
        .from('post_shares')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);

      return {
        likesCount: likesCount !== null && likesCount !== undefined ? likesCount : (post.likes_count || 0),
        isLiked: isLikedByUser,
        commentsCount: commentsCount !== null && commentsCount !== undefined ? commentsCount : (post.comments_count || 0),
        sharesCount: sharesCount !== null && sharesCount !== undefined ? sharesCount : (post.shares_count || 0),
      };
    }
  });

  const realLikesCount = engagement?.likesCount ?? post.likes_count ?? 0;
  const isLiked = engagement?.isLiked ?? false;
  const realCommentsCount = engagement?.commentsCount ?? post.comments_count ?? 0;
  const realSharesCount = engagement?.sharesCount ?? post.shares_count ?? 0;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const fullName = post.profiles?.full_name || "Professional User";
  const title = post.profiles?.title || "Member";
  const avatarUrl = post.profiles?.profile_picture_url;

  // Toggle Like with real Supabase mutation
  const handleToggleLike = async () => {
    if (!user?.id) {
      toast.error("Please log in to like posts");
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: user.id });
      }
      refetchEngagement();
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (err: any) {
      console.error("Failed to update like:", err);
      toast.error("Could not update like status");
    }
  };

  const recordShare = async () => {
    if (user?.id) {
      try {
        await supabase
          .from('post_shares')
          .insert({ post_id: post.id, user_id: user.id });
        refetchEngagement();
      } catch (e) {
        console.warn('Could not record share:', e);
      }
    }
  };

  const getPostUrl = () => `${window.location.origin}/network/posts/${post.id}`;

  // Copy Post Link
  const handleCopyLink = async () => {
    const url = getPostUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Post link copied to clipboard!");
      await recordShare();
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // LinkedIn Share Dialog
  const handleLinkedInShare = async () => {
    const url = getPostUrl();
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600,noopener,noreferrer');
    await recordShare();
  };

  // Twitter / X Share Dialog
  const handleTwitterShare = async () => {
    const url = getPostUrl();
    const shareText = `"${post.content.slice(0, 200)}..." via TalentXcel Network`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    await recordShare();
  };

  // Native Web Share or Copy Link fallback
  const handleNativeShare = async () => {
    const url = getPostUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${fullName} on TalentXcel`,
          text: post.content,
          url: url
        });
        toast.success("Shared successfully!");
        await recordShare();
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed:', err);
        }
      }
    }
    // Fallback to copy link
    await handleCopyLink();
  };

  const handleToggleComments = () => {
    setShowComments(prev => !prev);
    onCommentClick?.(post.id);
  };

  return (
    <Card className="border border-slate-200/80 dark:border-border/60 shadow-sm bg-white dark:bg-card rounded-3xl overflow-hidden">
      <CardContent className="p-5 space-y-4">
        
        {/* Post Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to={`/passport/public/${post.author_id}`}>
              <Avatar className="w-11 h-11 border-2 border-white dark:border-slate-800 shadow-md">
                <AvatarImage src={avatarUrl || undefined} alt={fullName} className="object-cover" />
                <AvatarFallback className="font-bold text-xs bg-slate-900 text-white">
                  {fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Link to={`/passport/public/${post.author_id}`} className="font-extrabold text-sm text-foreground hover:text-primary transition-colors">
                  {fullName}
                </Link>
                <CheckCircle2 className="h-4 w-4 text-blue-600 fill-blue-600/20 shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground font-semibold">{title}</p>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                <span>{formatTimeAgo(post.created_at || new Date().toISOString())}</span>
                <span>•</span>
                <Globe className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Top Right Social Toolbar */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <button 
              onClick={handleNativeShare} 
              title="Share / Send Direct" 
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted text-slate-500 hover:text-foreground transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
            <button 
              onClick={handleLinkedInShare} 
              title="Share on LinkedIn" 
              className="px-2 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 font-extrabold text-xs transition-colors"
            >
              in
            </button>
            <button 
              onClick={handleTwitterShare} 
              title="Share on X (Twitter)" 
              className="px-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-muted text-slate-900 dark:text-white font-black text-xs transition-colors"
            >
              𝕏
            </button>
            <button 
              onClick={handleCopyLink} 
              title="Copy Post Link" 
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted text-slate-500 hover:text-foreground transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Article vs Standard Post Rendering */}
        {post.post_type === 'article' || post.headline ? (
          <div className="space-y-3">
            {/* Article category & read time badge */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-[11px] font-bold flex items-center gap-1.5 py-0.5">
                <FileText className="w-3 h-3 text-blue-600" />
                <span>Article • {post.article_category || 'Career Insights'}</span>
              </Badge>
              {post.reading_time && (
                <span className="text-[11px] text-muted-foreground font-semibold">
                  {post.reading_time} min read
                </span>
              )}
            </div>

            {/* Headline */}
            {post.headline && (
              <Link to={`/network/articles/${post.id}`}>
                <h3 className="text-base sm:text-lg font-bold text-foreground hover:text-blue-600 transition-colors leading-snug cursor-pointer">
                  {post.headline}
                </h3>
              </Link>
            )}

            {/* Featured Image if present */}
            {(post.featured_image_url || (post.media_urls && post.media_urls[0])) && (
              <Link to={`/network/articles/${post.id}`} className="block overflow-hidden rounded-2xl border border-slate-200 dark:border-border/60 group">
                <img 
                  src={post.featured_image_url || post.media_urls?.[0]} 
                  alt={post.headline || "Article cover"} 
                  className="w-full max-h-[360px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
                />
              </Link>
            )}

            {/* Summary or tagline */}
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {post.tagline || (post.content ? post.content.replace(/^[#\-*\s]+/gm, ' ').replace(/\n+/g, ' ').trim() : '')}
            </p>

            {/* Read full article action link */}
            <div className="pt-1">
              <Link 
                to={`/network/articles/${post.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Hashtags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
                    #{tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Post Body Content */}
            <div className="space-y-2 text-sm text-foreground leading-relaxed font-medium">
              <p>{post.content}</p>
              
              {/* Hashtags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
                      #{tag.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media Images & Videos */}
            {post.media_urls && post.media_urls.length > 0 && post.media_urls[0] && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-border/60 bg-slate-950/5 dark:bg-muted/30">
                {isVideoUrl(post.media_urls[0]) || post.post_type === 'video' ? (
                  <video 
                    src={post.media_urls[0]} 
                    controls 
                    playsInline
                    preload="metadata"
                    className="w-full max-h-[480px] object-contain mx-auto bg-black rounded-2xl shadow-sm" 
                  />
                ) : (
                  <img 
                    src={post.media_urls[0]} 
                    alt="Post media" 
                    className="w-full max-h-[500px] object-cover cursor-pointer hover:opacity-95 transition-opacity rounded-2xl"
                    onClick={() => setSelectedMediaUrl(post.media_urls[0])}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* REAL Reaction & Comment Counter Row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold pt-2 border-t border-slate-100 dark:border-border/60 select-none">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground" onClick={handleToggleLike}>
            {realLikesCount > 0 && (
              <div className="flex -space-x-1">
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] shadow-sm">👍</span>
                <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] shadow-sm">❤️</span>
              </div>
            )}
            <span>{realLikesCount} {realLikesCount === 1 ? 'Like' : 'Likes'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleToggleComments}
              className="hover:underline hover:text-foreground transition-colors cursor-pointer"
            >
              {realCommentsCount} {realCommentsCount === 1 ? 'Comment' : 'Comments'}
            </button>
            <button 
              onClick={handleNativeShare}
              className="hover:underline hover:text-foreground transition-colors cursor-pointer"
            >
              {realSharesCount} {realSharesCount === 1 ? 'Share' : 'Shares'}
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-border/60 text-xs font-bold">
          <button 
            onClick={handleToggleLike}
            className={`flex items-center justify-center gap-2 py-2 rounded-2xl transition-colors ${
              isLiked ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-slate-200'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-blue-600 text-blue-600' : ''}`} />
            Like
          </button>

          <button 
            onClick={handleToggleComments}
            className={`flex items-center justify-center gap-2 py-2 rounded-2xl transition-colors ${
              showComments ? 'bg-slate-100 dark:bg-muted text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-slate-200'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Comment
          </button>

          <button 
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>

        {/* Expandable Comments Section with Real Live Supabase Comments */}
        {showComments && (
          <div className="pt-3 border-t border-slate-100 dark:border-border/60">
            <EnhancedCommentsSection postId={post.id} />
          </div>
        )}

        {/* In-App Media Lightbox Modal (Keeps user on talentxcel.in) */}
        {selectedMediaUrl && (
          <div 
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedMediaUrl(null)}
          >
            <div 
              className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden p-2 shadow-2xl border border-slate-700" 
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedMediaUrl(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors shadow-md"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
              {isVideoUrl(selectedMediaUrl) ? (
                <video 
                  src={selectedMediaUrl} 
                  controls 
                  autoPlay
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl mx-auto" 
                />
              ) : (
                <img 
                  src={selectedMediaUrl} 
                  alt="Full preview" 
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl mx-auto" 
                />
              )}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};