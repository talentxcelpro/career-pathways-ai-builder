import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Users, 
  TrendingUp, 
  Calendar, 
  Send,
  Target,
  BarChart,
  Clock,
  CheckCircle
} from 'lucide-react';

interface CommunicationMetrics {
  total_emails_sent: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  unsubscribe_rate: number;
  bounce_rate: number;
  revenue_attribution: number;
  user_retention_impact: number;
}

interface RealtimeStats {
  emails_today: number;
  active_campaigns: number;
  response_rate_24h: number;
  new_subscribers: number;
}

export const CommunicationDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<CommunicationMetrics | null>(null);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCommunicationMetrics();
    fetchRealtimeStats();
    
    // Set up real-time updates
    const interval = setInterval(fetchRealtimeStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCommunicationMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('email_delivery_events')
        .select(`
          status,
          sent_at,
          opened_at,
          clicked_at,
          template_name
        `)
        .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (error) throw error;

      // Calculate metrics
      const totalSent = data?.length || 0;
      const opened = data?.filter(e => e.opened_at).length || 0;
      const clicked = data?.filter(e => e.clicked_at).length || 0;
      const bounced = data?.filter(e => e.status === 'bounced').length || 0;

      setMetrics({
        total_emails_sent: totalSent,
        open_rate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
        click_rate: totalSent > 0 ? (clicked / totalSent) * 100 : 0,
        conversion_rate: 0, // Would need additional tracking
        unsubscribe_rate: 0.5, // Placeholder
        bounce_rate: totalSent > 0 ? (bounced / totalSent) * 100 : 0,
        revenue_attribution: 0, // Would need revenue tracking
        user_retention_impact: 15.2 // Placeholder
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Failed to load communication metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRealtimeStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('email_delivery_events')
        .select('*')
        .gte('sent_at', today + 'T00:00:00.000Z');

      if (error) throw error;

      setRealtimeStats({
        emails_today: data?.length || 0,
        active_campaigns: 5, // Placeholder
        response_rate_24h: 12.5, // Placeholder
        new_subscribers: 23 // Placeholder
      });
    } catch (error) {
      console.error('Error fetching realtime stats:', error);
    }
  };

  const initiateEmergencyBroadcast = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-emergency-broadcast', {
        body: {
          message: 'Important platform update',
          priority: 'high',
          target_audience: 'all_users'
        }
      });

      if (error) throw error;
      toast.success('Emergency broadcast initiated');
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('Failed to send emergency broadcast');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Communication Command Center
          </CardTitle>
          <CardDescription>
            Monitor and optimize all platform communications for maximum growth impact
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Send className="h-5 w-5 text-blue-500" />
              <Badge variant="outline">Today</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{realtimeStats?.emails_today || 0}</div>
              <div className="text-sm text-muted-foreground">Emails Sent</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Target className="h-5 w-5 text-green-500" />
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{realtimeStats?.active_campaigns || 0}</div>
              <div className="text-sm text-muted-foreground">Campaigns</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <Badge variant="outline">24h</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{realtimeStats?.response_rate_24h || 0}%</div>
              <div className="text-sm text-muted-foreground">Response Rate</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-purple-500" />
              <Badge variant="outline">New</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{realtimeStats?.new_subscribers || 0}</div>
              <div className="text-sm text-muted-foreground">Subscribers</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Communication Performance</CardTitle>
            <CardDescription>30-day overview of email communication effectiveness</CardDescription>
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
                <span className="text-sm font-medium">User Retention Impact</span>
                <span className="text-sm text-muted-foreground">{metrics?.user_retention_impact.toFixed(1)}%</span>
              </div>
              <Progress value={metrics?.user_retention_impact || 0} className="w-full" />
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
            <CardTitle>Growth Impact Metrics</CardTitle>
            <CardDescription>How communication drives platform growth</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {metrics?.total_emails_sent.toLocaleString() || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Emails</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {((metrics?.open_rate || 0) * (metrics?.total_emails_sent || 0) / 100).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Email Opens</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {metrics?.unsubscribe_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Unsubscribe Rate</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${(metrics?.revenue_attribution || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Revenue Impact</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Communication Actions</CardTitle>
          <CardDescription>Rapidly deploy communications to drive growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <span>Emergency Broadcast</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Active Growth Campaigns</CardTitle>
          <CardDescription>Currently running communication campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                name: 'New User Onboarding Series', 
                status: 'active', 
                progress: 75, 
                sent: 1234, 
                opens: 456, 
                conversions: 89 
              },
              { 
                name: 'Weekly Job Alerts', 
                status: 'active', 
                progress: 100, 
                sent: 5678, 
                opens: 2340, 
                conversions: 234 
              },
              { 
                name: 'Re-engagement Campaign', 
                status: 'paused', 
                progress: 45, 
                sent: 890, 
                opens: 267, 
                conversions: 23 
              }
            ].map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{campaign.name}</h4>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Sent: {campaign.sent.toLocaleString()}</span>
                    <span>Opens: {campaign.opens.toLocaleString()}</span>
                    <span>Conversions: {campaign.conversions}</span>
                  </div>
                  <Progress value={campaign.progress} className="w-full mt-2" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};