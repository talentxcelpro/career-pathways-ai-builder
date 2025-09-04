import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Target, Mail, CheckCircle, Clock } from 'lucide-react';

export function CampaignStats() {
  const { data: campaignStats, isLoading } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: async () => {
      // Get campaign overview
      const { data: campaigns } = await supabase
        .from('backlink_campaigns')
        .select('*');

      // Get opportunity stats
      const { data: opportunities } = await supabase
        .from('backlink_opportunities')
        .select('status, campaign_id');

      // Get outreach logs if available
      const { data: outreachLogs } = await supabase
        .from('backlink_outreach_logs')
        .select('status, sent_at')
        .order('sent_at', { ascending: false })
        .limit(100);

      // Calculate stats
      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
      const totalOpportunities = opportunities?.length || 0;
      const contactedOpportunities = opportunities?.filter(o => o.status === 'contacted').length || 0;
      const successfulOutreach = outreachLogs?.filter(l => l.status === 'sent').length || 0;
      const totalOutreach = outreachLogs?.length || 0;

      return {
        totalCampaigns,
        activeCampaigns,
        totalOpportunities,
        contactedOpportunities,
        successfulOutreach,
        totalOutreach,
        successRate: totalOutreach > 0 ? (successfulOutreach / totalOutreach) * 100 : 0,
        contactRate: totalOpportunities > 0 ? (contactedOpportunities / totalOpportunities) * 100 : 0
      };
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data: recentOutreach } = await supabase
        .from('backlink_outreach_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(10);

      return recentOutreach || [];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const stats = campaignStats || {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalOpportunities: 0,
    contactedOpportunities: 0,
    successfulOutreach: 0,
    totalOutreach: 0,
    successRate: 0,
    contactRate: 0
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCampaigns} active campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Contact Rate</span>
                <span>{stats.contactRate.toFixed(1)}%</span>
              </div>
              <Progress value={stats.contactRate} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outreach Success</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulOutreach}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Success Rate</span>
                <span>{stats.successRate.toFixed(1)}%</span>
              </div>
              <Progress value={stats.successRate} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outreach</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOutreach}</div>
            <p className="text-xs text-muted-foreground">
              Emails sent this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest outreach activities and responses</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'sent' ? 'bg-green-500' :
                      activity.status === 'bounced' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium">{activity.subject}</p>
                      <p className="text-sm text-muted-foreground">{activity.content_type}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {activity.sent_at ? new Date(activity.sent_at).toLocaleDateString() : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Launch a campaign to see activity here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}