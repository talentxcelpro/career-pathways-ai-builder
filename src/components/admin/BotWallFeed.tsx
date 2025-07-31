import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Calendar, User, Bot } from 'lucide-react';
import { useBotWallPosts, useDeleteWallPost, usePublishWallPost, BotWallPost } from '@/hooks/useBotWall';
import { formatDistanceToNow } from 'date-fns';

interface BotWallFeedProps {
  botId?: string;
  onEditPost?: (post: BotWallPost) => void;
  showActions?: boolean;
}

const POST_TYPE_LABELS = {
  post: 'Social Post',
  article: 'Article',
  seo_page: 'SEO Page',
  newsletter: 'Newsletter'
};

const SOURCE_ICONS = {
  manual: User,
  ai: Bot
};

export const BotWallFeed: React.FC<BotWallFeedProps> = ({ 
  botId, 
  onEditPost, 
  showActions = true 
}) => {
  const { data: posts, isLoading, error } = useBotWallPosts(botId);
  const deleteWallPost = useDeleteWallPost();
  const publishWallPost = usePublishWallPost();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this wall post?')) {
      await deleteWallPost.mutateAsync(id);
    }
  };

  const handlePublish = async (id: string) => {
    await publishWallPost.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Failed to load wall posts. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No wall posts yet. Create your first manual post to get started!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const SourceIcon = SOURCE_ICONS[post.source];
        const isPublished = !!post.published_at && !post.is_draft;
        
        return (
          <Card key={post.id} className={`${post.is_draft ? 'border-dashed border-muted-foreground/50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={post.source === 'manual' ? 'default' : 'secondary'}>
                      <SourceIcon className="h-3 w-3 mr-1" />
                      {post.source === 'manual' ? 'Manual' : 'AI Generated'}
                    </Badge>
                    
                    <Badge variant="outline">
                      {POST_TYPE_LABELS[post.type]}
                    </Badge>
                    
                    {post.is_draft && (
                      <Badge variant="destructive">
                        Draft
                      </Badge>
                    )}
                    
                    {post.scheduled_at && (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Scheduled
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg leading-tight">
                    {post.title}
                  </h3>
                </div>
                
                {showActions && (
                  <div className="flex gap-1">
                    {post.is_draft && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublish(post.id)}
                        disabled={publishWallPost.isPending}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {onEditPost && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditPost(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={deleteWallPost.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-foreground">
                    {post.content.length > 300 
                      ? `${post.content.substring(0, 300)}...` 
                      : post.content
                    }
                  </p>
                </div>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                  <div>
                    {isPublished ? (
                      <span>
                        Published {formatDistanceToNow(new Date(post.published_at!), { addSuffix: true })}
                      </span>
                    ) : post.scheduled_at ? (
                      <span>
                        Scheduled for {new Date(post.scheduled_at).toLocaleString()}
                      </span>
                    ) : (
                      <span>
                        Created {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs">
                    {post.content.length} characters
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};