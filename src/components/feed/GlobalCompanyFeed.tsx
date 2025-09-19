import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Calendar,
  Building,
  TrendingUp,
  Search,
  Filter,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CompanyFollowButton } from '@/components/company/CompanyFollowButton';
import { usePostInteractions } from '@/hooks/useCompanyPosts';

interface GlobalCompanyFeedProps {
  limit?: number;
}

function PostCard({ post }: { post: any }) {
  const { likePost, canInteract } = usePostInteractions(post.id);

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
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.companies?.logo_url} alt={post.companies?.name} />
              <AvatarFallback>
                <Building className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{post.companies?.name}</p>
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
                <CompanyFollowButton 
                  companyId={post.company_id}
                  size="sm"
                  showFollowersCount={false}
                />
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
            {post.content.split('\n').slice(0, 3).map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
            {post.content.split('\n').length > 3 && (
              <p className="text-blue-600 cursor-pointer hover:underline">Read more...</p>
            )}
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3} more
              </Badge>
            )}
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

export function GlobalCompanyFeed({ limit = 20 }: GlobalCompanyFeedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['global-company-posts', searchTerm, selectedType],
    queryFn: async () => {
      let query = supabase
        .from('company_posts')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            slug
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      if (selectedType && selectedType !== 'all') {
        query = query.eq('post_type', selectedType);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search company posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Post type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="job_posting">Job Postings</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="milestone">Milestones</SelectItem>
                <SelectItem value="update">Updates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {!posts || posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Posts Found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all' 
                ? 'No posts match your current filters.' 
                : 'No company posts available yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default GlobalCompanyFeed;