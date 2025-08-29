import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Flag,
  MessageSquare,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ModerationItem {
  id: string;
  content_type: 'post' | 'comment' | 'profile' | 'message';
  content_id: string;
  reported_by: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  ai_confidence?: number;
  ai_flags?: any;
  created_at: string;
  content?: any;
  reporter?: any;
}

interface ModerationCardProps {
  item: ModerationItem;
  onAction: (action: 'approve' | 'reject', itemId: string, notes?: string) => void;
}

const ModerationCard: React.FC<ModerationCardProps> = ({ item, onAction }) => {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'profile': return <User className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsProcessing(true);
    await onAction(action, item.id, notes);
    setIsProcessing(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              {getContentIcon(item.content_type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium capitalize">{item.content_type} Report</h4>
                <Badge className={getPriorityColor(item.priority)}>
                  {item.priority} priority
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Reported {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {item.ai_confidence && (
              <Badge variant="outline">
                AI: {Math.round(item.ai_confidence * 100)}% confidence
              </Badge>
            )}
            <Badge variant="secondary" className="capitalize">
              {item.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reporter Information */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Avatar className="w-8 h-8">
            <AvatarFallback>R</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">Reported by User</p>
            <p className="text-xs text-muted-foreground">Reason: {item.reason}</p>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-medium text-sm">Reported Content</h5>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              View Full
            </Button>
          </div>
          
          {item.content_type === 'post' && (
            <div className="space-y-2">
              <p className="text-sm">
                Just posted some controversial opinions about the industry. 
                What do you all think? #controversial #opinions
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>👍 24 likes</span>
                <span>💬 12 comments</span>
                <span>🔄 5 shares</span>
              </div>
            </div>
          )}

          {item.content_type === 'profile' && (
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">John Doe</p>
                <p className="text-xs text-muted-foreground">
                  Senior Developer at TechCorp
                </p>
                <p className="text-xs">Bio contains potentially inappropriate content...</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Flags */}
        {item.ai_flags && Object.keys(item.ai_flags).length > 0 && (
          <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <h5 className="font-medium text-sm">AI Detection Flags</h5>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(item.ai_flags).map(([flag, confidence]: [string, any]) => (
                <Badge key={flag} variant="secondary" className="text-xs">
                  {flag}: {Math.round(confidence * 100)}%
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Moderation Actions */}
        {item.status === 'pending' && (
          <div className="space-y-3">
            <Textarea
              placeholder="Add moderation notes (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
            
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={() => handleAction('approve')}
                disabled={isProcessing}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Content
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => handleAction('reject')}
                disabled={isProcessing}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Remove Content
              </Button>
            </div>
          </div>
        )}

        {/* Previous Decision */}
        {item.status !== 'pending' && (
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {item.status === 'approved' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="font-medium text-sm capitalize">
                {item.status} by Moderator
              </span>
            </div>
            {notes && (
              <p className="text-sm text-muted-foreground mt-1">
                Notes: {notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ContentModerationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [filterPriority, setFilterPriority] = useState('all');
  const queryClient = useQueryClient();

  // Fetch moderation queue
  const { data: moderationItems = [], isLoading } = useQuery({
    queryKey: ['content-moderation-queue', activeTab, filterPriority],
    queryFn: async () => {
      let query = supabase
        .from('content_moderation_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      if (filterPriority !== 'all') {
        query = query.eq('priority', filterPriority);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  // Moderation action mutation
  const moderationMutation = useMutation({
    mutationFn: async ({ action, itemId, notes }: { 
      action: 'approve' | 'reject'; 
      itemId: string; 
      notes?: string; 
    }) => {
      const { error } = await supabase
        .from('content_moderation_queue')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          moderator_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-moderation-queue'] });
    }
  });

  const handleModerationAction = (action: 'approve' | 'reject', itemId: string, notes?: string) => {
    moderationMutation.mutate({ action, itemId, notes });
  };

  const getTabCount = (status: string) => {
    return moderationItems.filter((item: ModerationItem) => 
      status === 'all' ? true : item.status === status
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Moderation</h2>
          <p className="text-muted-foreground">
            Review and moderate reported content across the platform
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{getTabCount('pending')}</p>
              </div>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Removed Today</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Accuracy</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({getTabCount('pending')})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({getTabCount('approved')})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({getTabCount('rejected')})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({moderationItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-64">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : moderationItems.length > 0 ? (
            <div>
              {moderationItems.map((item: ModerationItem) => (
                <ModerationCard
                  key={item.id}
                  item={item}
                  onAction={handleModerationAction}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No items to review</h3>
                <p className="text-muted-foreground">
                  All content in this category has been reviewed
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};