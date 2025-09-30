import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, CheckCircle, Eye, MousePointer, XCircle } from 'lucide-react';

export const EmailAnalyticsDashboard = () => {
  const queryClient = useQueryClient();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['email-overview-stats'],
    queryFn: async () => {
      const { data: queueData, error: queueError } = await supabase
        .from('email_automation_queue')
        .select('status');
      
      if (queueError) throw queueError;

      const { data: eventsData, error: eventsError } = await supabase
        .from('email_engagement_events')
        .select('event_type');
      
      if (eventsError) throw eventsError;

      const total = queueData?.length || 0;
      const sent = queueData?.filter(e => e.status === 'sent').length || 0;
      const pending = queueData?.filter(e => e.status === 'pending').length || 0;
      const failed = queueData?.filter(e => e.status === 'failed').length || 0;
      
      const delivered = eventsData?.filter(e => e.event_type === 'delivered').length || 0;
      const opened = eventsData?.filter(e => e.event_type === 'opened').length || 0;
      const clicked = eventsData?.filter(e => e.event_type === 'clicked').length || 0;

      return {
        total,
        sent,
        pending,
        failed,
        delivered,
        opened,
        clicked,
        openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0',
        clickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0',
        deliveryRate: sent > 0 ? ((delivered / sent) * 100).toFixed(1) : '0',
      };
    }
  });

  // Real-time subscription for analytics updates
  React.useEffect(() => {
    const queueChannel = supabase
      .channel('analytics-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_automation_queue'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['email-overview-stats'] });
        }
      )
      .subscribe();

    const eventsChannel = supabase
      .channel('analytics-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_engagement_events'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['email-overview-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [queryClient]);

  const statCards = [
    {
      title: 'Total Emails',
      value: stats?.total || 0,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Emails Sent',
      value: stats?.sent || 0,
      icon: Send,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Delivered',
      value: stats?.delivered || 0,
      subtitle: `${stats?.deliveryRate}% rate`,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Opened',
      value: stats?.opened || 0,
      subtitle: `${stats?.openRate}% rate`,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Clicked',
      value: stats?.clicked || 0,
      subtitle: `${stats?.clickRate}% rate`,
      icon: MousePointer,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Failed',
      value: stats?.failed || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Performance Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Delivery Performance</p>
              <p className="text-3xl font-bold">{stats?.deliveryRate}%</p>
              <p className="text-xs text-muted-foreground">
                {stats?.delivered} of {stats?.sent} emails delivered
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Engagement Rate</p>
              <p className="text-3xl font-bold">{stats?.openRate}%</p>
              <p className="text-xs text-muted-foreground">
                {stats?.opened} emails opened
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Click-Through Rate</p>
              <p className="text-3xl font-bold">{stats?.clickRate}%</p>
              <p className="text-xs text-muted-foreground">
                {stats?.clicked} links clicked
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
