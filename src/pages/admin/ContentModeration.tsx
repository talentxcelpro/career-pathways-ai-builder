import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Flag, AlertTriangle, CheckCircle, XCircle, Eye, 
  Search, Filter, MessageSquare, Star, Image,
  Clock, User, Calendar, Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ContentModeration = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedContent, setSelectedContent] = useState(null);
  const [moderationAction, setModerationAction] = useState('');
  const [moderationReason, setModerationReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch content moderation queue
  const { data: moderationQueue, isLoading } = useQuery({
    queryKey: ['content-moderation', searchTerm, filterStatus, filterType],
    queryFn: async () => {
      let query = supabase
        .from('content_moderation')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (filterType !== 'all') {
        query = query.eq('content_type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch moderation statistics
  const { data: moderationStats } = useQuery({
    queryKey: ['moderation-stats'],
    queryFn: async () => {
      const [
        { count: totalReports },
        { count: pendingReports },
        { count: approvedContent },
        { count: rejectedContent }
      ] = await Promise.all([
        supabase.from('content_moderation').select('*', { count: 'exact', head: true }),
        supabase.from('content_moderation').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('content_moderation').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('content_moderation').select('*', { count: 'exact', head: true }).eq('status', 'rejected')
      ]);

      return {
        totalReports: totalReports || 0,
        pendingReports: pendingReports || 0,
        approvedContent: approvedContent || 0,
        rejectedContent: rejectedContent || 0
      };
    }
  });

  // Fetch recent posts for content overview
  const { data: recentPosts } = useQuery({
    queryKey: ['recent-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, content, created_at, author_id')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  // Moderation action mutation
  const moderationMutation = useMutation({
    mutationFn: async ({ contentId, action, reason }: { contentId: any; action: string; reason: string }) => {
      const { data, error } = await supabase
        .from('content_moderation')
        .update({
          status: action,
          moderation_reason: reason,
          moderator_id: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', contentId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Moderation completed",
        description: "Content has been moderated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['content-moderation'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
      setSelectedContent(null);
      setModerationAction('');
      setModerationReason('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to moderate content.",
        variant: "destructive"
      });
    }
  });

  const handleModerationAction = (content, action) => {
    setSelectedContent(content);
    setModerationAction(action);
  };

  const executeModerationAction = () => {
    if (!selectedContent || !moderationAction) return;
    
    moderationMutation.mutate({
      contentId: selectedContent.id,
      action: moderationAction,
      reason: moderationReason
    });
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'post': return MessageSquare;
      case 'comment': return MessageSquare;
      case 'review': return Star;
      case 'profile': return User;
      default: return Flag;
    }
  };

  const stats = [
    { 
      title: 'Total Reports', 
      value: moderationStats?.totalReports?.toString() || '0', 
      icon: Flag,
      color: 'text-blue-600',
      trend: '+12%'
    },
    { 
      title: 'Pending Review', 
      value: moderationStats?.pendingReports?.toString() || '0', 
      icon: Clock,
      color: 'text-orange-600',
      trend: '+5%'
    },
    { 
      title: 'Approved', 
      value: moderationStats?.approvedContent?.toString() || '0', 
      icon: CheckCircle,
      color: 'text-green-600',
      trend: '+18%'
    },
    { 
      title: 'Rejected', 
      value: moderationStats?.rejectedContent?.toString() || '0', 
      icon: XCircle,
      color: 'text-red-600',
      trend: '-8%'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">Review and moderate user-generated content across the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Auto-Moderate Settings
          </Button>
        </div>
      </div>

      {/* Moderation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {stat.trend}
                  </span> from last week
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="content">Content Overview</TabsTrigger>
          <TabsTrigger value="reports">User Reports</TabsTrigger>
          <TabsTrigger value="rules">Moderation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Content Moderation Queue</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="post">Posts</SelectItem>
                      <SelectItem value="comment">Comments</SelectItem>
                      <SelectItem value="review">Reviews</SelectItem>
                      <SelectItem value="profile">Profiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moderationQueue?.map((item) => {
                      const IconComponent = getContentTypeIcon(item.content_type);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-xs">
                            <div className="flex items-start gap-2">
                              <IconComponent className="h-4 w-4 mt-1 text-muted-foreground" />
                              <div>
                                <div className="font-medium truncate">
                                  Content ID: {item.content_id}
                                </div>
                                {item.moderation_reason && (
                                  <div className="text-sm text-muted-foreground truncate">
                                    {item.moderation_reason}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.content_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {item.reported_by?.length || 0} reports
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full mr-1 ${
                                    i < item.severity_level ? 'bg-red-500' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                item.status === 'approved' ? 'default' :
                                item.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(item.created_at), 'MMM dd, HH:mm')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {item.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-green-600"
                                    onClick={() => handleModerationAction(item, 'approved')}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-red-600"
                                    onClick={() => handleModerationAction(item, 'rejected')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Content Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Latest user-generated content across the platform</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPosts?.map((post) => (
                     <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">User #{post.author_id.slice(0, 8)}</div>
                          <div className="text-sm text-muted-foreground">{post.author_id}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {post.content}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Post</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(post.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Moderation Action Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderationAction === 'approved' ? 'Approve Content' : 'Reject Content'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Content</label>
              <p className="text-sm text-muted-foreground">
                {selectedContent?.content_type} - ID: {selectedContent?.content_id}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Moderation Reason (Optional)</label>
              <Textarea
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="Provide a reason for this moderation action..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedContent(null)}>
                Cancel
              </Button>
              <Button 
                onClick={executeModerationAction}
                disabled={moderationMutation.isPending}
                variant={moderationAction === 'rejected' ? 'destructive' : 'default'}
              >
                {moderationMutation.isPending ? 'Processing...' : 'Confirm Action'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentModeration;