import React, { useState, useEffect } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, ExternalLink, BarChart3, Settings, Play, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BacklinkDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_backlink_dashboard_stats');
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const startProspecting = async () => {
    setActionLoading('prospecting');
    try {
      const { data, error } = await supabase.functions.invoke('backlink-prospecting', {
        body: {
          keywords: ['career development blogs', 'job search resources', 'professional networking sites'],
          limit: 10,
          language: 'en'
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Discovered ${data.targets_discovered} new targets`);
        fetchStats(); // Refresh stats
      } else {
        toast.error('Prospecting failed');
      }
    } catch (error) {
      console.error('Error starting prospecting:', error);
      toast.error('Failed to start prospecting');
    } finally {
      setActionLoading(null);
    }
  };

  const startMonitoring = async () => {
    setActionLoading('monitoring');
    try {
      const { data, error } = await supabase.functions.invoke('backlink-monitor', {
        body: {
          check_all: true,
          max_check: 20
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Checked ${data.checked} backlinks. ${data.live} live, ${data.broken} broken`);
        fetchStats(); // Refresh stats
      } else {
        toast.error('Monitoring failed');
      }
    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast.error('Failed to start monitoring');
    } finally {
      setActionLoading(null);
    }
  };

  const generateContent = async () => {
    setActionLoading('content');
    try {
      // Get a sample target first
      const { data: targets } = await supabase
        .from('backlink_targets')
        .select('*')
        .eq('status', 'active')
        .limit(1);

      if (!targets || targets.length === 0) {
        toast.error('No targets found. Running prospecting first...');
        await startProspecting();
        return;
      }

      const { data, error } = await supabase.functions.invoke('backlink-content-generator', {
        body: {
          target_id: targets[0].id,
          content_type: 'guest_post',
          variables: {
            company_name: 'TalentXcel',
            author_name: 'TalentXcel Team'
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Content generated successfully');
      } else {
        toast.error('Content generation failed');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setActionLoading(null);
    }
  };

  const startOutreach = async () => {
    setActionLoading('outreach');
    try {
      // Get sample targets for outreach
      const { data: targets } = await supabase
        .from('backlink_targets')
        .select('id')
        .eq('status', 'active')
        .limit(5);

      if (!targets || targets.length === 0) {
        toast.error('No targets found. Running prospecting first...');
        await startProspecting();
        return;
      }

      const { data, error } = await supabase.functions.invoke('backlink-outreach', {
        body: {
          target_ids: targets.map(t => t.id),
          content_type: 'guest_post',
          send_immediately: false // Just create outreach logs for now
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Prepared outreach for ${data.processed} targets`);
        fetchStats(); // Refresh stats
      } else {
        toast.error('Outreach preparation failed');
      }
    } catch (error) {
      console.error('Error starting outreach:', error);
      toast.error('Failed to start outreach');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <UnifiedAdminLayout 
        title="Backlink System" 
        description="Automated backlink management and monitoring"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </UnifiedAdminLayout>
    );
  }

  return (
    <UnifiedAdminLayout 
      title="Backlink System" 
      description="Automated backlink management and monitoring"
    >
      <div className="space-y-6">
        {/* No Targets Warning */}
        {stats?.total_targets === 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Network className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-amber-800">No Targets Found</h3>
                  <p className="text-sm text-amber-700">Click "Start Prospecting" below to discover backlink targets.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_targets || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.total_targets > 0 ? 'Active prospects' : 'No targets found'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Backlinks</CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.live_backlinks || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.live_backlinks > 0 ? 'Active backlinks' : 'No backlinks active'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.success_rate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {stats?.total_outreach > 0 ? 'Conversion rate' : 'No data available'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.this_month_outreach || 0}</div>
              <p className="text-xs text-muted-foreground">
                Outreach emails sent
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Prospecting & Discovery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Automatically discover high-authority websites for backlinks.
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  variant={stats?.total_targets === 0 ? "default" : "outline"}
                  onClick={startProspecting}
                  disabled={actionLoading === 'prospecting'}
                >
                  {actionLoading === 'prospecting' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Network className="h-4 w-4 mr-2" />
                  )}
                  {stats?.total_targets === 0 ? 'Start Prospecting (Required)' : 'Start Prospecting'}
                </Button>
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Targets
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Content Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate guest posts and press releases automatically.
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={generateContent}
                  disabled={actionLoading === 'content'}
                >
                  {actionLoading === 'content' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Generate Content
                </Button>
                <Button className="w-full" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Templates
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automated Outreach</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send emails and submit forms automatically.
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={startOutreach}
                  disabled={actionLoading === 'outreach'}
                >
                  {actionLoading === 'outreach' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Network className="h-4 w-4 mr-2" />
                  )}
                  Start Outreach
                </Button>
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monitoring & Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Track backlinks and monitor performance.
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={startMonitoring}
                  disabled={actionLoading === 'monitoring'}
                >
                  {actionLoading === 'monitoring' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <BarChart3 className="h-4 w-4 mr-2" />
                  )}
                  Check Backlinks
                </Button>
                <Button className="w-full" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Tables</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Edge Functions</span>
                <Badge variant="default">Deployed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">OpenAI Integration</span>
                <Badge variant="default">Configured</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Outreach</span>
                <span className="text-sm font-medium">{stats?.total_outreach || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Response Time</span>
                <span className="text-sm font-medium">
                  {stats?.avg_response_time_hours ? `${Math.round(stats.avg_response_time_hours)}h` : 'N/A'}
                </span>
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-xs text-muted-foreground">
                  The backlink system is fully operational. Use the actions above to start prospecting and monitoring.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedAdminLayout>
  );
};

export default BacklinkDashboard;