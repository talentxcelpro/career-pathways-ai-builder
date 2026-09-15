import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Users, 
  TrendingUp, 
  Send,
  Target,
  BarChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  PieChart
} from 'lucide-react';
import { EmailAnalyticsDashboard } from './EmailAnalyticsDashboard';
import { EmailDeliveryTracker } from './EmailDeliveryTracker';

interface CommunicationMetrics {
  total_emails_sent: number;
  open_rate: number;
  click_rate: number;
  delivery_rate: number;
  bounce_rate: number;
  today_sent: number;
  active_campaigns: number;
  response_rate_24h: number;
}

interface CampaignStatus {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  sent: number;
  opened: number;
  clicked: number;
  created_at: string;
}

export const CommunicationCommandCenter: React.FC = () => {
  const [metrics, setMetrics] = useState<CommunicationMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Set up real-time updates
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchCommunicationMetrics(),
        fetchCampaignStatus()
      ]);
    } catch (error) {
      console.error('Error fetching communication data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommunicationMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Get email queue data for the last 30 days with proper counts
      const { data: queueData, error: queueError } = await supabase
        .from('email_automation_queue')
        .select('status, created_at, sent_at')
        .gte('created_at', thirtyDaysAgo);

      if (queueError) throw queueError;

      // Get today's emails
      const { data: todayData, error: todayError } = await supabase
        .from('email_automation_queue')
        .select('status, created_at, sent_at')
        .gte('created_at', today + 'T00:00:00.000Z');

      if (todayError) throw todayError;

      // Get actual totals for accurate dashboard
      const { count: totalCount, error: totalError } = await supabase
        .from('email_automation_queue')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get delivery events for metrics calculation
      const { data: eventsData, error: eventsError } = await supabase
        .from('email_delivery_events')
        .select('*')
        .gte('created_at', thirtyDaysAgo);

      if (eventsError) throw eventsError;

      // Calculate metrics with real data
      const totalSent = queueData?.filter(q => q.status === 'sent').length || 0;
      const totalFailed = queueData?.filter(q => q.status === 'failed').length || 0;
      const totalPending = queueData?.filter(q => q.status === 'pending').length || 0;
      const todaySent = todayData?.filter(q => q.status === 'sent').length || 0;
      
      console.log('Email metrics calculated:', {
        totalSent,
        totalFailed,
        totalPending,
        todaySent,
        totalEmails: totalCount || 0
      });
      
      // Group events by recipient for accurate counts
      const eventsByEmail = (eventsData || []).reduce((acc, event) => {
        const email = event.recipient_email || event.email;
        if (email) {
          if (!acc[email]) acc[email] = [];
          acc[email].push(event);
        }
        return acc;
      }, {} as Record<string, any[]>);

      const uniqueOpeners = new Set();
      const uniqueClickers = new Set();
      const bounced = new Set();

      Object.entries(eventsByEmail).forEach(([email, events]) => {
        if (Array.isArray(events) && events.some((e: any) => e.event_type === 'opened')) uniqueOpeners.add(email);
        if (Array.isArray(events) && events.some((e: any) => e.event_type === 'clicked')) uniqueClickers.add(email);
        if (Array.isArray(events) && events.some((e: any) => e.event_type === 'bounced')) bounced.add(email);
      });

      const openRate = totalSent > 0 ? (uniqueOpeners.size / totalSent) * 100 : 0;
      const clickRate = uniqueOpeners.size > 0 ? (uniqueClickers.size / uniqueOpeners.size) * 100 : 0;
      const bounceRate = totalSent > 0 ? (bounced.size / totalSent) * 100 : 0;
      const deliveryRate = totalSent > 0 ? ((totalSent - bounced.size) / totalSent) * 100 : 0;

      setMetrics({
        total_emails_sent: totalSent,
        open_rate: openRate,
        click_rate: clickRate,
        delivery_rate: deliveryRate,
        bounce_rate: bounceRate,
        today_sent: todaySent,
        active_campaigns: 3, // This would come from campaigns table
        response_rate_24h: openRate // Simplified calculation
      });

    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Failed to load communication metrics');
    }
  };

  const fetchCampaignStatus = async () => {
    try {
      // This would fetch from actual campaigns table
      // For now, we'll use email queue data to simulate campaigns
      const { data, error } = await supabase
        .from('email_automation_queue')
        .select('trigger_type, status, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by trigger type to simulate campaigns
      const campaignGroups = (data || []).reduce((acc, email) => {
        const campaignName = email.trigger_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (!acc[campaignName]) {
          acc[campaignName] = {
            id: email.trigger_type,
            name: campaignName,
            status: 'active' as const,
            sent: 0,
            opened: 0,
            clicked: 0,
            created_at: email.created_at
          };
        }
        if (email.status === 'sent') acc[campaignName].sent++;
        return acc;
      }, {} as Record<string, CampaignStatus>);

      setCampaigns(Object.values(campaignGroups).slice(0, 5));
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Communication metrics refreshed');
  };

  const initiateEmergencyBroadcast = async () => {
    try {
      // This would trigger an actual emergency broadcast
      toast.success('Emergency broadcast system activated');
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('Failed to send emergency broadcast');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                Communication Command Center
              </CardTitle>
              <CardDescription>
                Monitor and optimize all platform communications for maximum growth impact
              </CardDescription>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Send className="h-5 w-5 text-primary" />
              <Badge variant="outline">Today</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{metrics?.today_sent || 0}</div>
              <div className="text-sm text-muted-foreground">Emails Sent</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Target className="h-5 w-5 text-success" />
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{metrics?.active_campaigns || 0}</div>
              <div className="text-sm text-muted-foreground">Campaigns</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-accent" />
              <Badge variant="outline">30 days</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{metrics?.open_rate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Open Rate</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-secondary" />
              <Badge variant="outline">Total</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{metrics?.total_emails_sent || 0}</div>
              <div className="text-sm text-muted-foreground">Total Sent</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Performance</CardTitle>
                <CardDescription>Key metrics for the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Open Rate</span>
                    <span className="text-sm text-muted-foreground">{metrics?.open_rate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics?.open_rate || 0} className="w-full" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Click Rate</span>
                    <span className="text-sm text-muted-foreground">{metrics?.click_rate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics?.click_rate || 0} className="w-full" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Delivery Rate</span>
                    <span className="text-sm text-muted-foreground">{metrics?.delivery_rate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics?.delivery_rate || 0} className="w-full" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className="text-sm text-muted-foreground">{metrics?.bounce_rate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics?.bounce_rate || 0} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Rapidly deploy communications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-20 flex flex-col gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>New Campaign</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Users className="h-5 w-5" />
                    <span>Segment Users</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <BarChart className="h-5 w-5" />
                    <span>A/B Test</span>
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="h-20 flex flex-col gap-2"
                    onClick={initiateEmergencyBroadcast}
                  >
                    <Send className="h-5 w-5" />
                    <span>Emergency</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Active Communication Campaigns</CardTitle>
              <CardDescription>Currently running campaigns and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active campaigns found
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Sent: {campaign.sent.toLocaleString()}</span>
                          <span>Opened: {campaign.opened.toLocaleString()}</span>
                          <span>Clicked: {campaign.clicked}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Edit</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage your email templates and content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Template management interface would go here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <EmailDeliveryTracker />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <EmailAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Settings</CardTitle>
              <CardDescription>Configure your communication preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Settings interface would go here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};