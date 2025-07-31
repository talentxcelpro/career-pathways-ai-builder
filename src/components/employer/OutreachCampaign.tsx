import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  MousePointer,
  Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  campaign_name: string;
  subject: string;
  message: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  created_at: string;
  sent_at: string;
}

interface OutreachStats {
  total_campaigns: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  monthly_sent: number;
  monthly_limit: number;
  is_premium: boolean;
}

export const OutreachCampaign: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    campaign_name: '',
    subject: '',
    message: ''
  });

  const queryClient = useQueryClient();

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['outreach_campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outreach_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['outreach_stats'],
    queryFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Get campaign stats
      const { data: campaignStats } = await supabase
        .from('outreach_campaigns')
        .select('recipient_count, sent_count');

      // Get monthly usage
      const { data: usage } = await supabase
        .from('outreach_usage')
        .select('*')
        .eq('month_year', currentMonth)
        .single();

      // Get recipient stats
      const { data: recipientStats } = await supabase
        .from('outreach_recipients')
        .select('status, opened_at, clicked_at');

      const totalCampaigns = campaignStats?.length || 0;
      const totalSent = campaignStats?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
      const totalOpened = recipientStats?.filter(r => r.opened_at).length || 0;
      const totalClicked = recipientStats?.filter(r => r.clicked_at).length || 0;

      return {
        total_campaigns: totalCampaigns,
        total_sent: totalSent,
        total_opened: totalOpened,
        total_clicked: totalClicked,
        monthly_sent: usage?.emails_sent || 0,
        monthly_limit: usage?.is_premium ? 999999 : 50,
        is_premium: usage?.is_premium || false
      } as OutreachStats;
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: typeof newCampaign) => {
      const { data, error } = await supabase
        .from('outreach_campaigns')
        .insert([campaignData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach_campaigns'] });
      setShowCreateModal(false);
      setNewCampaign({ campaign_name: '', subject: '', message: '' });
      toast.success('Campaign created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create campaign: ' + error.message);
    }
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.campaign_name || !newCampaign.subject || !newCampaign.message) {
      toast.error('Please fill in all fields');
      return;
    }
    createCampaignMutation.mutate(newCampaign);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      sending: 'default',
      sent: 'default',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const progressPercentage = stats ? Math.min((stats.monthly_sent / stats.monthly_limit) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Outreach</h1>
          <p className="text-gray-600">Manage your candidate outreach campaigns</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Campaigns</p>
                <p className="text-2xl font-bold">{stats?.total_campaigns || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{stats?.total_sent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Opened</p>
                <p className="text-2xl font-bold">{stats?.total_opened || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Clicked</p>
                <p className="text-2xl font-bold">{stats?.total_clicked || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Monthly Usage</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {stats?.monthly_sent || 0}/{stats?.is_premium ? '∞' : stats?.monthly_limit || 50}
                </span>
              </div>
              {!stats?.is_premium && (
                <p className="text-xs text-gray-500 mt-1">
                  {Math.max(0, (stats?.monthly_limit || 50) - (stats?.monthly_sent || 0))} remaining
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{campaign.campaign_name}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(campaign.status)}
                      <span className="text-sm text-gray-500">
                        {format(new Date(campaign.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{campaign.subject}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {campaign.recipient_count} recipients
                    </span>
                    <span className="flex items-center gap-1">
                      <Send className="h-4 w-4" />
                      {campaign.sent_count} sent
                    </span>
                    {campaign.sent_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Sent {format(new Date(campaign.sent_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">Create your first outreach campaign to start connecting with candidates</p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl m-4">
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Name</label>
                <Input
                  placeholder="e.g., Frontend Developer Outreach"
                  value={newCampaign.campaign_name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, campaign_name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject Line</label>
                <Input
                  placeholder="e.g., Exciting Opportunity at TalentXcel"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  placeholder="Hi {name},&#10;&#10;I came across your profile and was impressed by your experience in {title}...&#10;&#10;Best regards,&#10;{sender_name}"
                  rows={8}
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{name}'}, {'{title}'}, {'{company}'} for personalization
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};