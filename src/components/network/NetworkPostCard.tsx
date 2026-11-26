import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { CheckCircle2, Globe, Send, Share2, ThumbsUp, MessageSquare, Copy, X, ArrowRight, FileText, Bookmark, Repeat2, Flame, Sparkles } from "lucide-react";
import { EnhancedPostMenu } from "@/components/posts/EnhancedPostMenu";
import { UniversalShare } from "@/components/shared/UniversalShare";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EnhancedCommentsSection } from "@/components/posts/EnhancedCommentsSection";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useResolvedMediaUrl } from "@/hooks/usePostMedia";
import { UniversalPostContent } from './UniversalPostContent';
import { UniversalPostMedia } from './UniversalPostMedia';

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
  reshare_count?: number | null;
  original_post_id?: string | null;
  reshared_from_id?: string | null;
  reshared_post?: NetworkPost | null;
  isLiked?: boolean;
  isSaved?: boolean;
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
  const { isAdmin } = useAdminAccess();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = React.useState(openComments === post.id);
  const [selectedMediaUrl, setSelectedMediaUrl] = React.useState<string | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = React.useState(false);
  const [quoteText, setQuoteText] = React.useState('');
  const [isReposting, setIsReposting] = React.useState(false);
  const [viralShareOpen, setViralShareOpen] = React.useState(false);

  const rawPrimaryMedia = post.featured_image_url || (post.media_urls && post.media_urls[0]) || null;
  const { url: resolvedMediaUrl } = useResolvedMediaUrl(rawPrimaryMedia);

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

  // 1. Fetch REAL live engagement counts, like and save status from Supabase
  const { data: engagement, refetch: refetchEngagement } = useQuery({
    queryKey: ['post-engagement-real', post.id, user?.id],
    initialData: {
      likesCount: post.likes_count ?? 0,
      isLiked: post.isLiked ?? false,
      commentsCount: post.comments_count ?? 0,
      sharesCount: post.shares_count ?? 0,
      isSaved: post.isSaved ?? false,
    },
    staleTime: 30000,
    queryFn: async () => {
      // Real likes count
      const { count: likesCount } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);

      // Check if current user liked this post
      let isLikedByUser = false;
      let isSavedByUser = false;
      if (user?.id) {
        const { data: userLike } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle();
        isLikedByUser = !!userLike;

        const { data: userSave } = await supabase
          .from('post_saves')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle();
        isSavedByUser = !!userSave;
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
        isSaved: isSavedByUser,
      };
    }
  });

  const realLikesCount = engagement?.likesCount ?? post.likes_count ?? 0;
  const isLiked = engagement?.isLiked ?? false;
  const isSaved = engagement?.isSaved ?? false;
  const realCommentsCount = engagement?.commentsCount ?? post.comments_count ?? 0;
  const realSharesCount = engagement?.sharesCount ?? post.shares_count ?? 0;

  // Toggle Bookmark / Save Post with real Supabase mutation
  const handleToggleBookmark = async () => {
    if (!user?.id) {
      toast.error("Please log in to save posts");
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from('post_saves')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        toast.success("Post removed from saved items");
      } else {
        await supabase
          .from('post_saves')
          .insert({ post_id: post.id, user_id: user.id });
        toast.success("Post saved successfully!");
      }
      refetchEngagement();
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
    } catch (err: any) {
      console.error("Failed to update saved post:", err);
      toast.error("Could not update saved status");
    }
  };

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

  const getPostUrl = () => `${window.location.origin}/post/${post.id}`;

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

  const targetOriginalId = post.reshared_from_id || post.original_post_id || post.id;
  const targetOriginalPost = post.reshared_post || post;
  const isOwnPost = Boolean(user?.id && user.id === post.author_id);
  const viralMomentumScore = realLikesCount + realCommentsCount * 2 + realSharesCount * 3 + (post.reshare_count || 0) * 3;
  const isTrendingPost = viralMomentumScore >= 5;

  // In-platform Reshare / Repost (instant or quote)
  const handleRepost = async (thoughtText?: string) => {
    if (!user?.id) {
      toast.error("Please log in to repost");
      return;
    }
    setIsReposting(true);
    try {
      const cleanThought = (thoughtText || '').trim();
      const payload = {
        author_id: user.id,
        user_id: user.id,
        content: cleanThought || 'Reposted on TalentXcel',
        original_post_id: targetOriginalId,
        reshared_from_id: targetOriginalId,
        visibility: 'public',
        is_public: true,
        status: 'published',
        origin: 'feed',
        post_type: 'text',
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
      };

      let { error } = await supabase.from('posts').insert(payload);
      if (error && String(error.message || '').includes('Failed to fetch')) {
        await new Promise((r) => setTimeout(r, 600));
        ({ error } = await supabase.from('posts').insert(payload));
      }

      if (error) throw error;

      await recordShare();
      queryClient.invalidateQueries({ queryKey: ['network-feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setQuoteModalOpen(false);
      setQuoteText('');
      toast.success(cleanThought ? 'Quote repost published to your feed!' : 'Reposted to your TalentXcel feed!');
    } catch (err: any) {
      console.error('Repost error:', err);
      const msg = String(err?.message || '');
      toast.error(
        msg.includes('Failed to fetch')
          ? 'Network connection to server failed. Please check your internet and try again.'
          : (msg || 'Failed to repost')
      );
    } finally {
      setIsReposting(false);
    }
  };

  // 1-Click Viral Hook Copy (ready-to-blast caption + referral link)
  const handleCopyViralHook = async () => {
    const refCode = user?.id ? `?ref=TXC${user.id.replace(/-/g, '').slice(0, 8).toUpperCase()}&utm_medium=viral_hook` : '';
    const url = `${window.location.origin}/network/posts/${post.id}${refCode}`;
    const hookText = `${post.headline || post.content.slice(0, 140)}...\n\nJoin the conversation on TalentXcel:\n${url}\n\n#TalentXcel #CareerGrowth #Networking`;
    try {
      await navigator.clipboard.writeText(hookText);
      toast.success('Viral caption & tracked link copied! Ready to paste anywhere.');
      await recordShare();
    } catch {
      toast.error('Failed to copy viral caption');
    }
  };

  return (
    <Card className="border border-slate-200/80 dark:border-border/60 shadow-xs hover:shadow-sm transition-shadow bg-white dark:bg-card rounded-2xl sm:rounded-3xl overflow-hidden w-full max-w-[680px] mx-auto">
      <CardContent className="p-3.5 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4">
        
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
                <span>{formatTimeAgo(post.created_at || new Date().toISOString())}</span>{isTrendingPost && <span className="inline-flex items-center gap-0.5 ml-1.5 px-1.5 py-0.2 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 text-[10px] font-bold"><Flame className="h-2.5 w-2.5" />Trending</span>}
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
            <EnhancedPostMenu
              postId={post.id}
              authorId={post.author_id}
              currentUserId={user?.id}
              postContent={post.content}
              postHeadline={post.headline}
              isOwnPost={isOwnPost}
              isAdmin={Boolean(isAdmin)}
            />
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
            {(post.featured_image_url || (post.media_urls && post.media_urls.length > 0)) && (
              <UniversalPostMedia 
                mediaUrls={post.media_urls}
                featuredImageUrl={post.featured_image_url}
                headline={post.headline}
                postType={post.post_type}
              />
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
            {/* Post Body Content with clickable links, formatting & link previews */}
            {/* Post Body Content with clickable links, formatting & link previews */}
            {!(post.reshared_post && post.content === 'Reposted on TalentXcel') && (
              <UniversalPostContent
                content={post.content}
                tags={post.tags}
              />
            )}

            {/* Embedded Reshared Post Preview Card */}
            {post.reshared_post && (
              <div className="rounded-2xl border border-slate-200/90 dark:border-border/70 bg-slate-50/70 dark:bg-muted/30 p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7 border border-white dark:border-slate-800">
                    <AvatarImage src={post.reshared_post.profiles?.profile_picture_url || undefined} alt={post.reshared_post.profiles?.full_name || 'Member'} className="object-cover" />
                    <AvatarFallback className="text-[10px] font-bold bg-slate-800 text-white">
                      {(post.reshared_post.profiles?.full_name || 'M').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link to={`/passport/public/${post.reshared_post.author_id}`} className="text-xs font-bold text-foreground hover:text-primary truncate block">
                      {post.reshared_post.profiles?.full_name || 'Professional Member'}
                    </Link>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {post.reshared_post.profiles?.title || 'Member'} • {formatTimeAgo(post.reshared_post.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-auto text-[10px] gap-1 px-1.5 py-0 text-emerald-700 border-emerald-200 bg-emerald-50/70 dark:text-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/40 shrink-0">
                    <Repeat2 className="h-2.5 w-2.5" /> Reposted
                  </Badge>
                </div>
                <UniversalPostContent content={post.reshared_post.content} tags={post.reshared_post.tags} />
                {(post.reshared_post.media_urls?.length || post.reshared_post.featured_image_url) ? (
                  <UniversalPostMedia
                    mediaUrls={post.reshared_post.media_urls}
                    featuredImageUrl={post.reshared_post.featured_image_url}
                    postType={post.reshared_post.post_type}
                    headline={post.reshared_post.headline}
                  />
                ) : null}
              </div>
            )}

            {/* Media Images & Videos — Natural aspect ratio, never cropped, lightbox on click */}
            {(post.media_urls?.length || post.featured_image_url) ? (
              <UniversalPostMedia 
                mediaUrls={post.media_urls} 
                featuredImageUrl={post.featured_image_url} 
                postType={post.post_type} 
                headline={post.headline} 
              />
            ) : null}

            {/* Interactive Career Milestone Card */}
            {(() => {
              const passportMatch = post.content ? post.content.match(/(?:talentxcel\.in\/u\/|\/u\/)([a-zA-Z0-9_.-]+)/i) : null;
              const passportUsername = passportMatch ? passportMatch[1].replace(/[^a-zA-Z0-9_.-]/g, '') : null;
              if (!passportUsername) return null;

              return (
                <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/30 border border-blue-200/90 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                      🛡️
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Verified Career Passport • @{passportUsername}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Peer-verified credentials & ATS readiness
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/verify/${passportUsername}`} onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-bold border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 rounded-lg">
                        ⭐ Endorse Skill
                      </Button>
                    </Link>
                    <Link to={`/u/${passportUsername}`} onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" className="h-7 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs rounded-lg">
                        View Passport →
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })()}
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
        <div className="grid grid-cols-5 gap-1 sm:gap-2 pt-1 border-t border-slate-100 dark:border-border/60 text-[11px] sm:text-xs font-bold">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                disabled={isReposting}
                className="flex items-center justify-center gap-1.5 py-2 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <Repeat2 className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Repost</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-52 rounded-xl">
              <DropdownMenuItem onClick={() => handleRepost()} className="gap-2 cursor-pointer font-medium">
                <Repeat2 className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold">Repost Now</p>
                  <p className="text-[10px] text-muted-foreground">Share instantly to your feed</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuoteModalOpen(true)} className="gap-2 cursor-pointer font-medium">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs font-bold">Repost with Thoughts</p>
                  <p className="text-[10px] text-muted-foreground">Add your perspective &amp; hashtags</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

          <button onClick={() => setViralShareOpen(true)} className="flex items-center justify-center gap-1.5 py-2 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-400 transition-colors cursor-pointer"><Share2 className="h-4 w-4 shrink-0" /><span className="hidden sm:inline">Viral Share</span></button>

          <button 
            onClick={handleToggleBookmark}
            title={isSaved ? "Saved" : "Save post"}
            className={`flex items-center justify-center gap-2 py-2 rounded-2xl transition-colors ${
              isSaved ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' : 'hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-slate-200'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
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

        {/* Quote Repost Dialog */}
        <Dialog open={quoteModalOpen} onOpenChange={setQuoteModalOpen}>
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Repeat2 className="h-4 w-4 text-emerald-600" />
                Repost with Your Thoughts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Add your perspective, insight, or #hashtags to amplify this post..."
                rows={3}
                className="resize-none rounded-xl text-sm"
              />
              <div className="flex flex-wrap gap-1.5">
                {['#TalentXcel', '#CareerGrowth', '#Hiring', '#FutureOfWork', '#Networking'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuoteText((prev) => prev ? `${prev.trim()} ${tag}` : tag)}
                    className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
              <div className="rounded-xl border bg-muted/40 p-3 text-xs space-y-1">
                <p className="font-bold text-foreground">{targetOriginalPost.profiles?.full_name || 'Professional Member'}</p>
                <p className="text-muted-foreground line-clamp-3">{targetOriginalPost.content}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuoteModalOpen(false)}>Cancel</Button>
              <Button onClick={() => handleRepost(quoteText)} disabled={isReposting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isReposting ? 'Publishing...' : 'Publish Repost'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Next-Gen Viral Share & Growth Dialog */}
        <Dialog open={viralShareOpen} onOpenChange={setViralShareOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Flame className="h-4 w-4 text-orange-500" />
                Viral Share &amp; Growth Amplifier
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200/70 dark:border-orange-800/50 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">1-Click Viral Hook + Referral Link</p>
                  <p className="text-[11px] text-muted-foreground">Copies post hook, hashtags &amp; your tracked TXC referral URL</p>
                </div>
                <Button size="sm" onClick={handleCopyViralHook} className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg">
                  Copy Hook
                </Button>
              </div>
              <UniversalShare
                content={{
                  id: post.id,
                  type: 'post',
                  title: post.headline || `Post by ${fullName} on TalentXcel`,
                  description: post.content.slice(0, 180),
                  author: fullName,
                  hashtags: post.tags || ['TalentXcel', 'CareerGrowth']
                }}
                showTitle={false}
                onShareComplete={() => {
                  recordShare();
                  setViralShareOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
};