import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Plus, 
  Calendar, 
  Upload, 
  Eye, 
  Heart, 
  Share2, 
  MoreHorizontal,
  FileText,
  Image,
  Video,
  Edit3,
  Trash2
} from 'lucide-react';
import { CreatePostDialog } from '@/components/company/CreatePostDialog';
import { CompanyPostsList } from '@/components/company/CompanyPostsList';

interface CompanyContentProps {
  company: any;
  userRole: string;
}

export const CompanyContent: React.FC<CompanyContentProps> = ({ company, userRole }) => {
  const [activeContentTab, setActiveContentTab] = useState('posts');

  // Get company posts
  const { data: companyPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['company-posts', company?.id],
    queryFn: async () => {
      if (!company) return [];

      const { data, error } = await supabase
        .from('company_posts')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!company
  });

  // Get company events
  const { data: companyEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['company-events', company?.id],
    queryFn: async () => {
      if (!company) return [];

      const { data, error } = await supabase
        .from('company_events')
        .select('*')
        .eq('company_id', company.id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!company
  });

  // Get company media
  const { data: companyMedia, isLoading: mediaLoading } = useQuery({
    queryKey: ['company-media', company?.id],
    queryFn: async () => {
      if (!company) return [];

      const { data, error } = await supabase
        .from('company_media_library')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!company
  });

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Content Management</h3>
          <p className="text-gray-600">Create and manage your company's content strategy</p>
        </div>
        <div className="flex gap-3">
          <CreatePostDialog companyId={company?.id} />
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Event
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeContentTab} onValueChange={setActiveContentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="posts">Posts & Announcements</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="analytics">Content Analytics</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <CompanyPostsList companyId={company?.id} />
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Company Events</CardTitle>
                    <CardDescription>Manage your company events and webinars</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : companyEvents && companyEvents.length > 0 ? (
                  <div className="space-y-4">
                    {companyEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          <div className="flex items-center gap-3">
                            <Badge className={getEventStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(event.event_date).toLocaleDateString()}
                            </span>
                            {event.is_virtual && (
                              <Badge variant="outline">Virtual</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Events Scheduled</h3>
                    <p className="text-gray-600 mb-4">Create your first company event to engage with your audience</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Media Library Tab */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Media Library</CardTitle>
                  <CardDescription>Manage your company media assets</CardDescription>
                </div>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {mediaLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : companyMedia && companyMedia.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {companyMedia.map((media) => (
                    <div key={media.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        {media.file_type === 'image' ? (
                          <img 
                            src={media.file_url} 
                            alt={media.alt_text || media.file_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">
                            {getFileTypeIcon(media.file_type)}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{media.file_name}</h4>
                        <p className="text-xs text-gray-500">{media.file_type.toUpperCase()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Media Files</h3>
                  <p className="text-gray-600 mb-4">Upload images, videos, and documents to build your media library</p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Media
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Content Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companyPosts?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Published this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {companyPosts?.reduce((sum, post) => sum + (post.views_count || 0), 0) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all posts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {companyPosts?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Engagement metric</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {companyPosts?.reduce((sum, post) => sum + (post.shares_count || 0), 0) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Content reach</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance Insights</CardTitle>
                <CardDescription>Detailed analytics for your content strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
                  <p className="text-gray-600">Track engagement rates, optimal posting times, and content performance metrics</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};