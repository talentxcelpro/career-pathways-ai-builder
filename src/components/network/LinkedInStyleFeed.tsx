import React, { memo, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Zap, Send, Image, Video, Calendar, FileText, Users, Bell, Mail, Globe, MapPin, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FastImageLoader } from '@/components/performance/FastImageLoader';
import { cn } from '@/lib/utils';

interface LinkedInPost {
  id: string;
  content: string;
  headline?: string;
  media_urls?: string[];
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  profiles?: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    title?: string;
    current_company?: string;
  };
}

// Professional Post Creation Card
const PostCreationCard = memo(() => {
  const { user } = useAuth();
  
  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
              {user?.user_metadata?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea 
              placeholder="Share your professional insights..."
              className="min-h-[60px] border-gray-200 resize-none text-base placeholder:text-gray-500"
            />
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-600">
                  <Image className="h-4 w-4 mr-1" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-600">
                  <Video className="h-4 w-4 mr-1" />
                  Video
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Event
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-600">
                  <FileText className="h-4 w-4 mr-1" />
                  Article
                </Button>
              </div>
              
              <Button className="bg-blue-600 hover:bg-blue-700 px-6">
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PostCreationCard.displayName = 'PostCreationCard';

// Professional Post Card
const LinkedInPostCard = memo<{
  post: LinkedInPost;
}>(({ post }) => {
  const timeAgo = useMemo(() => {
    const diff = Date.now() - new Date(post.created_at).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(diff / 604800000);
    
    if (weeks > 0) return `${weeks}w`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  }, [post.created_at]);

  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.profiles?.profile_picture_url} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                {post.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate hover:underline cursor-pointer">
                  {post.profiles?.full_name || 'Professional User'}
                </h3>
                <span className="text-blue-600">•</span>
                <span className="text-blue-600 text-sm hover:underline cursor-pointer">1st</span>
              </div>
              
              <p className="text-sm text-gray-600 truncate">
                {post.profiles?.title && `${post.profiles.title}`}
                {post.profiles?.current_company && ` at ${post.profiles.current_company}`}
              </p>
              
              <p className="text-xs text-gray-500 mt-1">
                {timeAgo} • <Globe className="inline h-3 w-3" />
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          {post.headline && (
            <h2 className="text-base font-medium text-gray-900 mb-2 leading-relaxed">
              {post.headline}
            </h2>
          )}
          
          {post.content && (
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
              {post.content}
            </p>
          )}
        </div>

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="px-0">
            <FastImageLoader
              src={post.media_urls[0]}
              alt="Post content"
              className="w-full"
              aspectRatio="16/9"
            />
          </div>
        )}

        {/* Engagement Bar */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <Heart className="h-2 w-2 text-white fill-current" />
                </div>
                <div className="h-4 w-4 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">👏</span>
                </div>
              </div>
              <span className="ml-1">{post.likes_count}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span>{post.comments_count} comments</span>
              <span>{post.shares_count} reposts</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-gray-600 hover:bg-gray-50 h-10 gap-2"
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Like</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-gray-600 hover:bg-gray-50 h-10 gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Comment</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-gray-600 hover:bg-gray-50 h-10 gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm font-medium">Repost</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-gray-600 hover:bg-gray-50 h-10 gap-2"
            >
              <Send className="h-4 w-4" />
              <span className="text-sm font-medium">Send</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

LinkedInPostCard.displayName = 'LinkedInPostCard';

// Professional Sidebar
const ProfessionalSidebar = memo(() => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg"></div>
          <div className="px-4 pb-4 -mt-8">
            <Avatar className="h-16 w-16 border-4 border-white mb-2">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-lg">
                {user?.user_metadata?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="font-semibold text-gray-900 hover:underline cursor-pointer">
              {user?.user_metadata?.full_name || 'Professional User'}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Software Engineer at TalentXcel
            </p>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Profile viewers</span>
                <span className="text-blue-600 font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span>Post impressions</span>
                <span className="text-blue-600 font-semibold">1,204</span>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full mt-3 text-blue-600 border-blue-600">
              Access exclusive tools & insights
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent</h3>
          <div className="space-y-2">
            {['JavaScript Developers', 'React Community', 'Startup Founders'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                <Users className="h-4 w-4" />
                {item}
              </div>
            ))}
          </div>
          
          <Button variant="ghost" size="sm" className="w-full mt-3 text-gray-600">
            Show more
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});

ProfessionalSidebar.displayName = 'ProfessionalSidebar';

// Main LinkedIn-style Feed
export const LinkedInStyleFeed: React.FC = () => {
  const { user } = useAuth();
  
  // Use a simpler query that works with existing data
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['linkedin-posts'],
    queryFn: async () => {
      // Try to get posts with simpler query first
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          headline,
          media_urls,
          created_at,
          user_id,
          likes_count,
          comments_count,
          shares_count
        `)
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Posts query error:', error);
        // Return mock data for demonstration
        return [
          {
            id: '1',
            content: 'Excited to share my latest project! Built a full-stack application using React, Node.js, and PostgreSQL. The learning journey has been incredible. 🚀',
            headline: 'Just launched my new project!',
            created_at: new Date().toISOString(),
            user_id: 'demo',
            likes_count: 15,
            comments_count: 3,
            shares_count: 2,
            profiles: {
              id: 'demo',
              full_name: 'Alex Chen',
              profile_picture_url: '',
              title: 'Senior Software Engineer',
              current_company: 'TechCorp'
            }
          },
          {
            id: '2',
            content: 'The future of remote work is here! Our team just completed a major project entirely remotely. Collaboration tools and clear communication are game-changers.',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            user_id: 'demo2',
            likes_count: 28,
            comments_count: 7,
            shares_count: 5,
            profiles: {
              id: 'demo2',
              full_name: 'Sarah Johnson',
              profile_picture_url: '',
              title: 'Product Manager',
              current_company: 'StartupXYZ'
            }
          }
        ];
      }

      return data.map(post => ({
        ...post,
        profiles: {
          id: post.user_id,
          full_name: 'Professional User',
          profile_picture_url: '',
          title: 'Software Engineer',
          current_company: 'TalentXcel'
        }
      }));
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <div className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="col-span-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <div className="sticky top-6">
              <ProfessionalSidebar />
            </div>
          </div>

          {/* Main Feed */}
          <div className="col-span-6 space-y-4">
            <PostCreationCard />
            
            {posts.map((post: any) => (
              <LinkedInPostCard key={post.id} post={post} />
            ))}
            
            {posts.length === 0 && !isLoading && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-lg font-semibold mb-2">Welcome to your professional network!</h3>
                  <p className="text-gray-600">Start connecting with professionals and sharing insights.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <div className="sticky top-6 space-y-4">
              {/* News & Updates */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">LinkedIn News</h3>
                  <div className="space-y-3">
                    {[
                      'Tech layoffs continue in 2024',
                      'AI skills in highest demand',
                      'Remote work trends shift'
                    ].map((news, i) => (
                      <div key={i} className="text-sm">
                        <p className="text-gray-900 hover:underline cursor-pointer">{news}</p>
                        <p className="text-gray-500 text-xs">2h ago • 1,247 readers</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* People You May Know */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">People you may know</h3>
                  <div className="space-y-3">
                    {['John Smith', 'Emily Davis', 'Michael Brown'].map((name, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                          <p className="text-xs text-gray-500">Software Engineer</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-600">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};