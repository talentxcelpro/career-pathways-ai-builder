import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Calendar, Heart, MessageCircle, Share } from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useBotIdentity } from '@/hooks/useBotIdentity';

interface BotPostCardProps {
  post: {
    id: string;
    headline: string;
    content: string;
    created_at: string;
    is_bot_post: boolean;
    bot_id?: string;
    origin?: string;
    likes_count?: number;
    comments_count?: number;
    shares_count?: number;
  };
  showActions?: boolean;
}

export const BotPostCard: React.FC<BotPostCardProps> = ({ post, showActions = true }) => {
  const { botInfo, isLoading } = useBotIdentity(post.bot_id);

  if (!post.is_bot_post || !post.bot_id) {
    return null; // This component is only for bot posts
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Bot Identity Header */}
        <div className="flex items-center gap-3 mb-4">
          {/* Bot Avatar */}
          <div className="relative">
            <UserAvatar 
              src={botInfo?.profile_picture_url}
              userName={botInfo?.display_name || 'AI Bot'}
              size="lg"
            />
            {/* AI Bot indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <Bot className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Bot Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">
                {isLoading ? 'Loading...' : (botInfo?.display_name || 'AI Bot')}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {botInfo?.bot_tag || 'AI Assistant'}
              </Badge>
              {post.origin && (
                <Badge variant={post.origin === 'manual' ? 'default' : 'outline'} className="text-xs">
                  {post.origin === 'manual' ? 'Manual' : 'AI Generated'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading role...' : (botInfo?.display_role || 'AI Assistant')}
            </p>
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
        {showActions && (
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

            {/* Bot Identifier */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Bot className="h-3 w-3" />
              <span>AI Assistant</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};