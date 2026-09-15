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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Send, Mail, Bell, MessageSquare, Users, 
  Megaphone, Clock, CheckCircle, AlertCircle,
  Plus, Filter, Search, Eye, Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const CommunicationCenter = () => {
  const [selectedTab, setSelectedTab] = useState('broadcast');
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({
    type: 'email',
    subject: '',
    content: '',
    target_audience: 'all_users',
    scheduled_at: '',
    template_id: null
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notification statistics
  const { data: notificationStats } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const { count: totalSent } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });
      
      const { count: delivered } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .not('delivered_at', 'is', null);
      
      const { count: opened } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', true);
      
      const { count: failed } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .not('error_message', 'is', null);

      return {
        totalSent: totalSent || 0,
        delivered: delivered || 0,
        opened: opened || 0,
        failed: failed || 0,
        deliveryRate: totalSent ? ((delivered || 0) / totalSent * 100).toFixed(1) : '0',
        openRate: delivered ? ((opened || 0) / delivered * 100).toFixed(1) : '0'
      };
    }
  });

  // Fetch recent notifications
  const { data: recentNotifications } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch bulk operations
  const { data: bulkOperations } = useQuery({
    queryKey: ['bulk-operations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bulk_operation_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch notification templates
  const { data: templates } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Create bulk message mutation
  const createBulkMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const { data, error } = await supabase
        .from('bulk_operation_queue')
        .insert({
          operation_type: 'bulk_message',
          target_criteria: { audience: messageData.target_audience },
          parameters: {
            type: messageData.type,
            subject: messageData.subject,
            content: messageData.content,
            template_id: messageData.template_id,
            scheduled_at: messageData.scheduled_at
          },
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Message queued",
        description: "Your bulk message has been queued for delivery."
      });
      queryClient.invalidateQueries({ queryKey: ['bulk-operations'] });
      setNewMessageOpen(false);
      setMessageForm({
        type: 'email',
        subject: '',
        content: '',
        target_audience: 'all_users',
        scheduled_at: '',
        template_id: null
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to queue bulk message.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!messageForm.subject || !messageForm.content) {
      toast({
        title: "Validation Error",
        description: "Subject and content are required.",
        variant: "destructive"
      });
      return;
    }

    createBulkMessageMutation.mutate(messageForm);
  };

  const stats = [
    { 
      title: 'Messages Sent', 
      value: notificationStats?.totalSent?.toString() || '0', 
      icon: Send,
      color: 'text-blue-600',
      trend: `${notificationStats?.deliveryRate || 0}% delivery rate`
    },
    { 
      title: 'Delivered', 
      value: notificationStats?.delivered?.toString() || '0', 
      icon: CheckCircle,
      color: 'text-green-600',
      trend: `${notificationStats?.openRate || 0}% open rate`
    },
    { 
      title: 'Failed', 
      value: notificationStats?.failed?.toString() || '0', 
      icon: AlertCircle,
      color: 'text-red-600',
      trend: 'Last 24 hours'
    },
    { 
      title: 'Active Templates', 
      value: templates?.length?.toString() || '0', 
      icon: Mail,
      color: 'text-purple-600',
      trend: 'Ready to use'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Communication Center</h1>
          <p className="text-muted-foreground">Manage notifications, bulk messaging, and user communications</p>
        </div>
        <Button onClick={() => setNewMessageOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Communication Statistics */}
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
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="broadcast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="broadcast">Broadcast Messages</TabsTrigger>
          <TabsTrigger value="notifications">Recent Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Communication Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Bulk Operations Queue</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkOperations?.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium capitalize">
                            {operation.operation_type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {(operation.parameters as any)?.subject || 'Bulk Operation'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {(operation.target_criteria as any)?.audience || 'All Users'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            operation.status === 'completed' ? 'default' :
                            operation.status === 'processing' ? 'secondary' :
                            operation.status === 'failed' ? 'destructive' :
                            'outline'
                          }
                        >
                          {operation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${operation.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {operation.progress || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(operation.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {operation.status === 'queued' && (
                            <Button size="sm" variant="ghost" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest notifications sent to users across the platform
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentNotifications?.slice(0, 10).map((notification) => (
                    <TableRow key={notification.id}>
                       <TableCell>
                        <div>
                          <div className="font-medium">
                            User #{notification.user_id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {notification.user_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {notification.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {notification.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {notification.is_read ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-600" />
                          )}
                          <span className="text-sm">
                            {notification.is_read ? 'Read' : 'Unread'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Notification Templates</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Variables</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates?.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="font-medium">{template.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {template.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {template.subject}
                      </TableCell>
                       <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(template.variables as string[])?.slice(0, 3).map((variable, index) => (
                            <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                              {variable}
                            </span>
                          ))}
                          {(template.variables as string[])?.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{(template.variables as string[]).length - 3} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
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

      {/* New Message Dialog */}
      <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Broadcast Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Message Type</Label>
                <Select value={messageForm.type} onValueChange={(value) => setMessageForm({...messageForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="in_app">In-App Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Audience</Label>
                <Select value={messageForm.target_audience} onValueChange={(value) => setMessageForm({...messageForm, target_audience: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">All Users</SelectItem>
                    <SelectItem value="active_users">Active Users</SelectItem>
                    <SelectItem value="new_users">New Users</SelectItem>
                    <SelectItem value="premium_users">Premium Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Template (Optional)</Label>
              <Select value={messageForm.template_id || ''} onValueChange={(value) => setMessageForm({...messageForm, template_id: value || null})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No template</SelectItem>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Subject</Label>
              <Input
                value={messageForm.subject}
                onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                placeholder="Message subject..."
              />
            </div>
            
            <div>
              <Label>Content</Label>
              <Textarea
                value={messageForm.content}
                onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                placeholder="Message content..."
                rows={6}
              />
            </div>
            
            <div>
              <Label>Schedule (Optional)</Label>
              <Input
                type="datetime-local"
                value={messageForm.scheduled_at}
                onChange={(e) => setMessageForm({...messageForm, scheduled_at: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewMessageOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={createBulkMessageMutation.isPending}
              >
                {createBulkMessageMutation.isPending ? 'Sending...' : 
                 messageForm.scheduled_at ? 'Schedule Message' : 'Send Now'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunicationCenter;