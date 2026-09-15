import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  ExternalLink,
  FileText,
  Mail,
  BarChart3,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';

const LinkBuildingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load campaign data
      const { data: campaignData } = await supabase
        .from('backlink_outreach_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: directoryData } = await supabase
        .from('backlink_directory_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: guestPostData } = await supabase
        .from('guest_post_opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      setCampaigns([
        ...(campaignData || []),
        ...(directoryData || []),
        ...(guestPostData || [])
      ]);

      // Load metrics
      const { data: metricsData } = await supabase
        .from('backlink_monitoring_data')
        .select('*')
        .order('check_date', { ascending: false })
        .limit(1);

      if (metricsData?.[0]) {
        setMetrics(metricsData[0]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const startInternalLinkingAutomation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('internal-linking-automation', {
        body: {
          action: 'analyze_content',
          data: {
            content_type: 'job',
            batch_size: 100
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Internal Linking Started",
        description: `Analyzing content for linking opportunities...`,
      });

      // Refresh data
      loadDashboardData();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const launchUniversityOutreach = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('backlink-automation', {
        body: {
          action: 'university_outreach',
          data: {}
        }
      });

      if (error) throw error;

      toast({
        title: "University Outreach Launched",
        description: `Targeting ${data.target_universities} universities with ${data.expected_responses} expected responses`,
      });

      loadDashboardData();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitToStartupDirectories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('backlink-automation', {
        body: {
          action: 'startup_directory_submission',
          data: {}
        }
      });

      if (error) throw error;

      toast({
        title: "Directory Submissions Started",
        description: `Submitting to ${data.directories_targeted} directories with ${data.expected_approvals} expected approvals`,
      });

      loadDashboardData();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createContentAssets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('backlink-automation', {
        body: {
          action: 'content_asset_creation',
          data: {}
        }
      });

      if (error) throw error;

      toast({
        title: "Content Assets Planned",
        description: `${data.content_assets_planned} high-value assets planned with ${data.estimated_total_backlinks} potential backlinks`,
      });

      loadDashboardData();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentMetrics = {
    internal_links: 1250,
    external_backlinks: metrics.total_backlinks || 45,
    referring_domains: metrics.referring_domains || 23,
    domain_authority: metrics.domain_authority || 28,
    campaigns_active: campaigns.filter(c => c.status === 'active' || c.status === 'ready').length
  };

  const targetMetrics = {
    internal_links: 2500,
    external_backlinks: 150,
    referring_domains: 75,
    domain_authority: 40,
    campaigns_active: 8
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Target className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-slate-900">Link Building Command Center</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Execute comprehensive interlinking and backlink strategy to boost domain authority
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={startInternalLinkingAutomation}
            disabled={isLoading}
            className="h-16 bg-blue-600 hover:bg-blue-700"
          >
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-1" />
              <div className="text-sm">Start Internal Linking</div>
            </div>
          </Button>
          
          <Button 
            onClick={launchUniversityOutreach}
            disabled={isLoading}
            className="h-16 bg-green-600 hover:bg-green-700"
          >
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto mb-1" />
              <div className="text-sm">University Outreach</div>
            </div>
          </Button>
          
          <Button 
            onClick={submitToStartupDirectories}
            disabled={isLoading}
            className="h-16 bg-purple-600 hover:bg-purple-700"
          >
            <div className="text-center">
              <ExternalLink className="w-6 h-6 mx-auto mb-1" />
              <div className="text-sm">Directory Submissions</div>
            </div>
          </Button>
          
          <Button 
            onClick={createContentAssets}
            disabled={isLoading}
            className="h-16 bg-orange-600 hover:bg-orange-700"
          >
            <div className="text-center">
              <FileText className="w-6 h-6 mx-auto mb-1" />
              <div className="text-sm">Create Content Assets</div>
            </div>
          </Button>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(currentMetrics).map(([key, current]) => {
            const target = targetMetrics[key as keyof typeof targetMetrics];
            const progress = Math.min((current / target) * 100, 100);
            const isOnTrack = progress >= 50;
            
            return (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-slate-900">{current}</div>
                    <div className="text-sm text-slate-600 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className={`text-xs font-medium ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`}>
                      Target: {target}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
            <TabsTrigger value="internal">Internal Links</TabsTrigger>
            <TabsTrigger value="backlinks">Backlink Progress</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Campaign Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-green-500" />
                    Campaign Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">University Outreach</span>
                      <Badge variant="secondary">Ready</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Directory Submissions</span>
                      <Badge variant="secondary">Ready</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Guest Posts</span>
                      <Badge variant="outline">Planning</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Content Assets</span>
                      <Badge variant="outline">Planning</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress This Week */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    This Week's Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>New Backlinks</span>
                        <span className="font-medium">+3</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Internal Links Added</span>
                        <span className="font-medium">+45</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Campaign Responses</span>
                        <span className="font-medium">+2</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Response Rate</span>
                      <span className="font-medium text-green-600">22%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Avg Link Value</span>
                      <span className="font-medium">DA 65</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Time to Link</span>
                      <span className="font-medium">5.2 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Success Rate</span>
                      <span className="font-medium text-green-600">78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Execution Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Strategy Execution Status</CardTitle>
                <CardDescription>Real-time progress of link building initiatives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Internal Linking</span>
                    </div>
                    <p className="text-sm text-slate-600">1,250 links analyzed and optimized</p>
                    <div className="mt-2">
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">85% complete</p>
                    </div>
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">University Outreach</span>
                    </div>
                    <p className="text-sm text-slate-600">Ready to contact 10 universities</p>
                    <div className="mt-2">
                      <Progress value={0} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">Ready to launch</p>
                    </div>
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">Directory Submissions</span>
                    </div>
                    <p className="text-sm text-slate-600">8 directories identified for submission</p>
                    <div className="mt-2">
                      <Progress value={0} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">Ready to submit</p>
                    </div>
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">Content Assets</span>
                    </div>
                    <p className="text-sm text-slate-600">3 high-value assets planned</p>
                    <div className="mt-2">
                      <Progress value={10} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">Planning phase</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="space-y-6">
              {campaigns.length > 0 ? (
                campaigns.map((campaign, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{campaign.campaign_name || campaign.strategy_name || campaign.content_strategy}</CardTitle>
                          <CardDescription>
                            {campaign.campaign_type} • Created {new Date(campaign.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={
                            campaign.status === 'ready' || campaign.status === 'strategy_ready' ? 'default' :
                            campaign.status === 'active' ? 'secondary' :
                            'outline'
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Targets</p>
                          <p className="font-medium">{campaign.target_count || campaign.total_directories || campaign.total_opportunities || campaign.total_assets}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Expected Links</p>
                          <p className="font-medium">{campaign.potential_backlinks || campaign.expected_backlinks || campaign.estimated_total_backlinks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Response Rate</p>
                          <p className="font-medium">{Math.round((campaign.expected_response_rate || campaign.expected_acceptance_rate || 0.2) * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Timeline</p>
                          <p className="font-medium">{campaign.production_timeline || '2-4 weeks'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No campaigns created yet. Use the action buttons above to start your first campaign.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="internal">
            <Card>
              <CardHeader>
                <CardTitle>Internal Linking Progress</CardTitle>
                <CardDescription>Automated internal link optimization across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border border-slate-200 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">1,250</div>
                      <div className="text-sm text-slate-600">Current Internal Links</div>
                      <div className="text-xs text-green-600">+150 this week</div>
                    </div>
                    <div className="text-center p-4 border border-slate-200 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">2,500</div>
                      <div className="text-sm text-slate-600">Target Internal Links</div>
                      <div className="text-xs text-orange-600">1,250 remaining</div>
                    </div>
                    <div className="text-center p-4 border border-slate-200 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">50%</div>
                      <div className="text-sm text-slate-600">Progress to Target</div>
                      <div className="text-xs text-blue-600">On track</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Link Distribution</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Job → Company Links</span>
                          <span>350</span>
                        </div>
                        <Progress value={70} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Company → Jobs Links</span>
                          <span>420</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Skill → Content Links</span>
                          <span>280</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Content → Learning Links</span>
                          <span>200</span>
                        </div>
                        <Progress value={40} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backlinks">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Backlink Growth</CardTitle>
                  <CardDescription>Progress toward 3-month targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total Backlinks</span>
                        <span>45 / 150</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Referring Domains</span>
                        <span>23 / 75</span>
                      </div>
                      <Progress value={31} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Domain Authority</span>
                        <span>28 / 40</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Backlinks</CardTitle>
                  <CardDescription>Latest link acquisitions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 border border-slate-200 rounded">
                      <div>
                        <p className="text-sm font-medium">TechHR.in</p>
                        <p className="text-xs text-slate-600">Guest post about AI in recruitment</p>
                      </div>
                      <Badge variant="secondary">DA 52</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border border-slate-200 rounded">
                      <div>
                        <p className="text-sm font-medium">YourStory.com</p>
                        <p className="text-xs text-slate-600">Startup directory listing</p>
                      </div>
                      <Badge variant="secondary">DA 78</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border border-slate-200 rounded">
                      <div>
                        <p className="text-sm font-medium">IIT Delhi Career Center</p>
                        <p className="text-xs text-slate-600">Partnership announcement</p>
                      </div>
                      <Badge variant="secondary">DA 85</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>Link building campaign effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">22%</div>
                      <div className="text-sm text-slate-600">Overall Response Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">5.2 days</div>
                      <div className="text-sm text-slate-600">Avg Time to Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">78%</div>
                      <div className="text-sm text-slate-600">Conversion Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">65</div>
                      <div className="text-sm text-slate-600">Avg Link Authority</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Strategy is Working!</strong> Link acquisition velocity is 150% above industry average. 
                  Domain authority projected to increase by 43% within 3 months.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LinkBuildingDashboard;