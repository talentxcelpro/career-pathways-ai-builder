import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Calendar,
  Building,
  TrendingUp
} from 'lucide-react';
import { useCompanyPosts, usePostInteractions } from '@/hooks/useCompanyPosts';
import { formatDistanceToNow } from 'date-fns';

interface PublicCompanyPostsProps {
  companyId?: string;
  limit?: number;
  showCompanyInfo?: boolean;
}

interface PostCardProps {
  post: any;
  showCompanyInfo?: boolean;
}

function PostCard({ post, showCompanyInfo = false }: PostCardProps) {
  const { likePost, unlikePost, canInteract } = usePostInteractions(post.id);

  const handleLike = () => {
    if (!canInteract) return;
    likePost.mutate();
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <TrendingUp className="h-4 w-4" />;
      case 'job_posting':
        return <Building className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      case 'job_posting':
        return 'bg-green-100 text-green-800';
      case 'event':
        return 'bg-purple-100 text-purple-800';
      case 'milestone':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {showCompanyInfo && post.companies && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.companies.logo_url} alt={post.companies.name} />
                <AvatarFallback>
                  <Building className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              {showCompanyInfo && post.companies && (
                <p className="font-medium text-gray-900">{post.companies.name}</p>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>
                  {formatDistanceToNow(new Date(post.published_at || post.created_at), { 
                    addSuffix: true 
                  })}
                </span>
                {post.is_featured && (
                  <Badge variant="secondary" className="text-xs">Featured</Badge>
                )}
              </div>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={getPostTypeColor(post.post_type)}
          >
            {getPostTypeIcon(post.post_type)}
            <span className="ml-1 capitalize">{post.post_type.replace('_', ' ')}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
          <div className="text-gray-700 space-y-2">
            {post.content.split('\n').map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!canInteract}
              className="text-gray-600 hover:text-red-600"
            >
              <Heart className="h-4 w-4 mr-1" />
              <span>{post.likes_count || 0}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="text-gray-600">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{post.comments_count || 0}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Share2 className="h-4 w-4 mr-1" />
              <span>{post.shares_count || 0}</span>
            </Button>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="h-4 w-4 mr-1" />
            <span>{post.views_count || 0} views</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PublicCompanyPosts({ 
  companyId, 
  limit = 10, 
  showCompanyInfo = false 
}: PublicCompanyPostsProps) {
  const { publishedPosts, isLoading } = useCompanyPosts(companyId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  const postsToShow = limit ? publishedPosts?.slice(0, limit) : publishedPosts;

  if (!postsToShow || postsToShow.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
          <p className="text-gray-600">
            {companyId ? "This company hasn't posted anything yet." : "No company posts available."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {postsToShow.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          showCompanyInfo={showCompanyInfo}
        />
      ))}
    </div>
  );
}

export default PublicCompanyPosts;