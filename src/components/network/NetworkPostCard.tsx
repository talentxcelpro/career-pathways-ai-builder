import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { CheckCircle2, Globe, Send, Share2, ThumbsUp, MessageSquare, MoreHorizontal, Bookmark, Copy } from "lucide-react";
import { linkifyText } from "@/utils/textUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EnhancedCommentsSection } from "@/components/posts/EnhancedCommentsSection";

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
  const [liked, setLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(post.likes_count || 128);
  const [showComments, setShowComments] = React.useState(openComments === post.id);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const fullName = post.profiles?.full_name || "Arshid Hussain Wani";
  const title = post.profiles?.title || "Sales head APAC";
  const avatarUrl = post.profiles?.profile_picture_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200";

  const handleToggleLike = () => {
    setLiked(prev => !prev);
    setLikesCount(prev => (liked ? prev - 1 : prev + 1));
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/network/posts/${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Post link copied to clipboard!");
  };

  return (
    <Card className="border border-slate-200/80 dark:border-border/60 shadow-sm bg-white dark:bg-card rounded-3xl overflow-hidden">
      <CardContent className="p-5 space-y-4">
        
        {/* Post Header matching mockup 1:1 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to={`/passport/public/${post.author_id}`}>
              <Avatar className="w-11 h-11 border-2 border-white dark:border-slate-800 shadow-md">
                <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
                <AvatarFallback className="font-bold text-xs bg-slate-900 text-white">
                  {fullName.charAt(0)}
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

          {/* Top Right Social Toolbar matching mockup 1:1 */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <button onClick={handleCopyLink} title="Share Direct" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted text-slate-500 hover:text-foreground transition-colors">
              <Send className="h-4 w-4" />
            </button>
            <button onClick={handleCopyLink} title="LinkedIn Share" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted text-slate-500 hover:text-foreground font-extrabold text-xs">
              in
            </button>
            <button onClick={handleCopyLink} title="Twitter Share" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted text-slate-500 hover:text-foreground font-black text-xs">
              𝕏
            </button>
            <button onClick={handleCopyLink} title="Copy Link" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted text-slate-500 hover:text-foreground transition-colors">
              <Copy className="h-4 w-4" />
            </button>
            <button title="More Options" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted text-slate-500 hover:text-foreground transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Post Body Content */}
        <div className="space-y-2 text-sm text-foreground leading-relaxed font-medium">
          <p>{post.content || "The future belongs to those who believe in the beauty of their dreams. Keep learning, keep growing, keep inspiring."}</p>
          
          {/* Hashtags matching mockup */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(post.tags && post.tags.length > 0 ? post.tags : ["Leadership", "Growth", "Inspiration", "TalentXcel"]).map((tag, idx) => (
              <span key={idx} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Media Images if any */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <img src={post.media_urls[0]} alt="Post media" className="w-full max-h-96 object-cover" />
          </div>
        )}

        {/* Reaction Counter Row matching mockup 1:1 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold pt-2 border-t border-slate-100 dark:border-border/60">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] shadow-sm">👍</span>
              <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] shadow-sm">❤️</span>
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-sm">😮</span>
            </div>
            <span>{likesCount}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>{post.comments_count || 36} Comments</span>
            <span>{post.shares_count || 24} Shares</span>
          </div>
        </div>

        {/* Action Buttons Row matching mockup 1:1 */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-border/60 text-xs font-bold">
          <button 
            onClick={handleToggleLike}
            className={`flex items-center justify-center gap-2 py-2 rounded-2xl transition-colors ${
              liked ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-slate-200'
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            Like
          </button>

          <button 
            onClick={() => {
              setShowComments(prev => !prev);
              onCommentClick?.(post.id);
            }}
            className="flex items-center justify-center gap-2 py-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-slate-200 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Comment
          </button>

          <button 
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 py-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-muted text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>

        {/* Expandable Comments Section */}
        {showComments && (
          <div className="pt-3 border-t border-slate-100 dark:border-border/60">
            <EnhancedCommentsSection postId={post.id} />
          </div>
        )}

      </CardContent>
    </Card>
  );
};