import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp,
  Users,
  Settings
} from 'lucide-react';

interface AutomationRule {
  id: string;
  event_key: string;
  email_title_template: string;
  is_enabled: boolean;
}

interface QueueStats {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
}

interface RecentActivity {
  id: string;
  trigger_type: string;
  recipient_email: string;
  status: string;
  scheduled_at: string;
  processed_at?: string;
}

export const EmailAutomationDashboard = () => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    sent: 0,
    failed: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load automation rules
      const { data: rules, error: rulesError } = await supabase
        .from('email_event_definitions')
        .select('*')
        .order('event_key');

      if (rulesError) throw rulesError;
      setAutomationRules(rules || []);

      // Load queue statistics
      const { data: queueData, error: queueError } = await supabase
        .from('email_automation_queue')
        .select('status')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (queueError) throw queueError;

      const stats = {
        pending: queueData?.filter(q => q.status === 'pending').length || 0,
        processing: queueData?.filter(q => q.status === 'processing').length || 0,
        sent: queueData?.filter(q => q.status === 'sent').length || 0,
        failed: queueData?.filter(q => q.status === 'failed').length || 0
      };
      setQueueStats(stats);

      // Load recent activity
      const { data: activity, error: activityError } = await supabase
        .from('email_automation_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (activityError) throw activityError;
      setRecentActivity(activity || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutomationRule = async (ruleId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('email_event_definitions')
        .update({ is_enabled: enabled })
        .eq('id', ruleId);

      if (error) throw error;

      setAutomationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, is_enabled: enabled } : rule
        )
      );

      toast.success(`Automation rule ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating automation rule:', error);
      toast.error('Failed to update automation rule');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      sent: 'default',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{queueStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-3xl font-bold">{queueStats.processing}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sent (24h)</p>
                <p className="text-3xl font-bold">{queueStats.sent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-3xl font-bold">{queueStats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Rules
          </CardTitle>
          <CardDescription>
            Configure which email automations are active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{rule.email_title_template || rule.event_key}</h3>
                  <p className="text-sm text-muted-foreground">
                    Trigger: {rule.event_key.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={rule.is_enabled ? 'default' : 'secondary'}>
                    {rule.is_enabled ? 'Active' : 'Inactive'}
                  </Badge>
                  <Switch
                    checked={rule.is_enabled}
                    onCheckedChange={(checked) => toggleAutomationRule(rule.id, checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Email Activity
          </CardTitle>
          <CardDescription>
            Latest email automation activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No recent activity
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="font-medium">{activity.trigger_type.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{activity.recipient_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(activity.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Automation Health
          </CardTitle>
          <CardDescription>
            Key metrics for email automation performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {queueStats.sent + queueStats.failed > 0 
                  ? Math.round((queueStats.sent / (queueStats.sent + queueStats.failed)) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {queueStats.pending + queueStats.processing}
              </p>
              <p className="text-sm text-muted-foreground">Queue Backlog</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {automationRules.filter(rule => rule.is_enabled).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Rules</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};