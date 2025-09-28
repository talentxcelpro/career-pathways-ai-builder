import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UserAvatar } from '@/components/common/UserAvatar';
import { 
  MoreHorizontal,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  Flag,
  Trash2,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface PostEngagementMetrics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  engagementScore: number;
}

interface Post {
  id: string;
  content: string;
  headline?: string;
  created_at: string;
  is_flagged?: boolean;
  moderation_status?: string;
  profiles: {
    full_name: string;
    profile_picture_url?: string;
    email: string;
  };
  post_comments: any[];
  post_likes: any[];
  engagementMetrics: PostEngagementMetrics;
  tags?: string[];
  media_urls?: string[];
}

interface EnhancedPostsListProps {
  posts: Post[];
  isLoading: boolean;
  selectedPosts: string[];
  onDeletePost: (postId: string) => void;
  onToggleSelection: (postId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const EnhancedPostsList: React.FC<EnhancedPostsListProps> = ({
  posts,
  isLoading,
  selectedPosts,
  onDeletePost,
  onToggleSelection,
  onSelectAll,
  onClearSelection
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getModerationBadge = (post: Post) => {
    if (post.is_flagged) {
      return <Badge variant="destructive" className="gap-1"><Flag className="h-3 w-3" />Flagged</Badge>;
    }
    
    switch (post.moderation_status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unmoderated</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Posts Management
            <Badge variant="secondary">
              {posts.length} posts
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedPosts.length === posts.length && posts.length > 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSelectAll();
                } else {
                  onClearSelection();
                }
              }}
            />
            <span className="text-sm text-gray-600">
              Select All ({posts.length})
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Found</h3>
            <p className="text-gray-500">No posts match your current filters.</p>
          </div>
        ) : (
          posts.map((post) => (
            <Card 
              key={post.id} 
              className={`transition-all duration-200 ${
                selectedPosts.includes(post.id) 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <Checkbox
                    checked={selectedPosts.includes(post.id)}
                    onCheckedChange={() => onToggleSelection(post.id)}
                    className="mt-1"
                  />
                  
                  {/* Author Avatar */}
                  <UserAvatar 
                    src={post.profiles.profile_picture_url}
                    userName={post.profiles.full_name}
                    size="md"
                  />
                  
                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          {post.profiles.full_name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {post.profiles.email}
                        </span>
                        {getModerationBadge(post)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getEngagementColor(post.engagementMetrics.engagementScore)}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {post.engagementMetrics.engagementScore}%
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Flag className="h-4 w-4 mr-2" />
                              Flag Post
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => onDeletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Post
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Post Title */}
                    {post.headline && (
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {post.headline}
                      </h3>
                    )}
                    
                    {/* Post Content */}
                    <p className="text-gray-700 mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.slice(0, 5).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {post.tags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Media Indicator */}
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs">
                          📷 {post.media_urls.length} media file{post.media_urls.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Engagement Metrics */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.engagementMetrics.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.engagementMetrics.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.engagementMetrics.commentCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          {post.engagementMetrics.shareCount}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    
                    {/* Flagged Content Warning */}
                    {post.is_flagged && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">
                            This post has been flagged for review
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};