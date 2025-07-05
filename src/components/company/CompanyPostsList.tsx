import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  Clock,
  Calendar,
  CheckCircle,
  Megaphone,
  Briefcase,
  Trophy
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCompanyPosts, CompanyPost } from '@/hooks/useCompanyPosts';
import { formatDistanceToNow } from 'date-fns';

interface CompanyPostsListProps {
  companyId: string;
}

export function CompanyPostsList({ companyId }: CompanyPostsListProps) {
  const { posts, isLoading, publishPost, deletePost } = useCompanyPosts(companyId);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts' | 'scheduled'>('all');

  const getPostTypeIcon = (type: CompanyPost['post_type']) => {
    switch (type) {
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'job_posting': return <Briefcase className="h-4 w-4" />;
      case 'milestone': return <Trophy className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: CompanyPost['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPosts = posts?.filter(post => {
    switch (activeTab) {
      case 'published': return post.status === 'published';
      case 'drafts': return post.status === 'draft';
      case 'scheduled': return post.status === 'scheduled';
      default: return true;
    }
  }) || [];

  const handlePublish = async (postId: string) => {
    try {
      await publishPost.mutateAsync(postId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost.mutateAsync(postId);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Company Posts</CardTitle>
          <div className="text-sm text-gray-500">
            {posts?.length || 0} total posts
          </div>
        </div>
        
        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({posts?.length || 0})</TabsTrigger>
            <TabsTrigger value="published">
              Published ({posts?.filter(p => p.status === 'published').length || 0})
            </TabsTrigger>
            <TabsTrigger value="drafts">
              Drafts ({posts?.filter(p => p.status === 'draft').length || 0})
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled ({posts?.filter(p => p.status === 'scheduled').length || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'all' ? 'No posts yet' : `No ${activeTab} posts`}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'all' 
                ? 'Create your first company post to engage with your followers'
                : `You don't have any ${activeTab} posts yet`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map(post => (
              <div key={post.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getPostTypeIcon(post.post_type)}
                      <span className="text-sm font-medium capitalize">
                        {post.post_type.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge className={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                    {post.is_featured && (
                      <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {post.status === 'draft' && (
                        <DropdownMenuItem onClick={() => handlePublish(post.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Publish Now
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-700 leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views_count}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes_count}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments_count}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Share2 className="h-4 w-4" />
                      <span>{post.shares_count}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {post.status === 'scheduled' && post.scheduled_at && (
                      <span className="flex items-center space-x-1 text-blue-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          Scheduled for {formatDistanceToNow(new Date(post.scheduled_at), { addSuffix: true })}
                        </span>
                      </span>
                    )}
                    {post.status === 'published' && post.published_at && (
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          Published {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                        </span>
                      </span>
                    )}
                    {post.status === 'draft' && (
                      <span className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>
                          Created {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}