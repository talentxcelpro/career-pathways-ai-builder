import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Activity,
  BarChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RealEmailAnalytics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  pending: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export const RealTimeEmailAnalytics = () => {
  const [analytics, setAnalytics] = useState<RealEmailAnalytics>({
    totalSent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    failed: 0,
    pending: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRealAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get email queue data
      const { data: queueData, error: queueError } = await supabase
        .from('email_automation_queue')
        .select('status, recipient_email, created_at')
        .order('created_at', { ascending: false });

      if (queueError) throw queueError;

      // Get delivery events
      const { data: eventsData, error: eventsError } = await supabase
        .from('email_delivery_events')
        .select('event_type, recipient_email, email_id, created_at')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      console.log('Real-time analytics - Queue data:', queueData?.length);
      console.log('Real-time analytics - Events data:', eventsData?.length);

      // Calculate real statistics
      const totalSent = queueData?.filter(q => q.status === 'sent').length || 0;
      const pending = queueData?.filter(q => q.status === 'pending').length || 0;
      const failed = queueData?.filter(q => q.status === 'failed').length || 0;

      // Count unique recipients for engagement metrics
      const uniqueRecipients = {
        delivered: new Set<string>(),
        opened: new Set<string>(),
        clicked: new Set<string>(),
        bounced: new Set<string>()
      };

      // Process delivery events
      eventsData?.forEach(event => {
        const email = event.recipient_email || event.email_id;
        if (!email) return;

        switch (event.event_type) {
          case 'delivered':
            uniqueRecipients.delivered.add(email);
            break;
          case 'opened':
            uniqueRecipients.opened.add(email);
            break;
          case 'clicked':
            uniqueRecipients.clicked.add(email);
            break;
          case 'bounced':
            uniqueRecipients.bounced.add(email);
            break;
        }
      });

      const delivered = Math.max(uniqueRecipients.delivered.size, totalSent); // At minimum, all sent are delivered
      const opened = uniqueRecipients.opened.size;
      const clicked = uniqueRecipients.clicked.size;
      const bounced = uniqueRecipients.bounced.size;

      // Calculate rates
      const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
      const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
      const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
      const bounceRate = totalSent > 0 ? (bounced / totalSent) * 100 : 0;

      const realAnalytics = {
        totalSent,
        delivered,
        opened,
        clicked,
        bounced,
        failed,
        pending,
        deliveryRate,
        openRate,
        clickRate,
        bounceRate,
      };

      setAnalytics(realAnalytics);
      setLastUpdated(new Date());

      console.log('Real-time email analytics calculated:', realAnalytics);

    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load real-time email analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealAnalytics();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchRealAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (loading && !lastUpdated) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading real-time analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Real-Time Email Analytics</h3>
          <p className="text-muted-foreground">
            Live data from your email queue and delivery events
            {lastUpdated && (
              <span className="ml-2 text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button onClick={fetchRealAnalytics} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-3xl font-bold text-primary">{analytics.totalSent}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(analytics.deliveryRate)} delivery rate
                </p>
              </div>
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{analytics.delivered}</p>
                <Progress value={analytics.deliveryRate} className="mt-2 h-2" />
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opened</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.opened}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(analytics.openRate)} open rate
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clicked</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.clicked}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(analytics.clickRate)} click rate
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.pending}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{analytics.failed}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bounced</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.bounced}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(analytics.bounceRate)} bounce rate
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Performance Summary
          </CardTitle>
          <CardDescription>
            Real-time email performance metrics based on actual delivery data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Delivery Rate</span>
              <div className="flex items-center gap-2">
                <Badge variant={analytics.deliveryRate >= 95 ? 'default' : analytics.deliveryRate >= 90 ? 'secondary' : 'destructive'}>
                  {formatPercentage(analytics.deliveryRate)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {analytics.deliveryRate >= 95 ? 'Excellent' : analytics.deliveryRate >= 90 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Open Rate</span>
              <div className="flex items-center gap-2">
                <Badge variant={analytics.openRate >= 25 ? 'default' : analytics.openRate >= 20 ? 'secondary' : 'destructive'}>
                  {formatPercentage(analytics.openRate)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {analytics.openRate >= 25 ? 'Great' : analytics.openRate >= 20 ? 'Average' : 'Below Average'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Click Rate</span>
              <div className="flex items-center gap-2">
                <Badge variant={analytics.clickRate >= 10 ? 'default' : analytics.clickRate >= 5 ? 'secondary' : 'destructive'}>
                  {formatPercentage(analytics.clickRate)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {analytics.clickRate >= 10 ? 'Excellent' : analytics.clickRate >= 5 ? 'Good' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};