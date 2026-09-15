import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { aiService } from '@/services/aiService';
import { Zap, History, Search, Star, Clock, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import { AIToolsInterface } from './AIToolsInterface';

interface RecentActivity {
  id: string;
  tool_slug: string;
  operation_type: string;
  status: string;
  created_at: string;
  output_data?: any;
  cost?: number;
}

interface QuickAction {
  title: string;
  description: string;
  toolSlug: string;
  category: string;
  icon: React.ComponentType<any>;
  popular: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Tailor Resume",
    description: "Optimize your resume for specific job descriptions",
    toolSlug: "resume-tailor",
    category: "resume",
    icon: Zap,
    popular: true
  },
  {
    title: "Generate Cover Letter",
    description: "Create personalized cover letters",
    toolSlug: "cover-letter", 
    category: "application",
    icon: Star,
    popular: true
  },
  {
    title: "Career Path Finder",
    description: "Discover career opportunities and paths",
    toolSlug: "career-pathfinder",
    category: "career",
    icon: TrendingUp,
    popular: false
  },
  {
    title: "Interview Prep",
    description: "Practice with AI-generated interview questions",
    toolSlug: "interview-qa",
    category: "interview", 
    icon: Clock,
    popular: true
  }
];

export function EnhancedAIInterface() {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch recent operations
      const operations = await aiService.getOperationHistory(10);
      setRecentActivity(operations);

      // Fetch usage analytics
      const analytics = await aiService.getUsageAnalytics('week');
      setUsageStats(analytics);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuickActions = QUICK_ACTIONS.filter(action =>
    action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading AI Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">TalentXcel AI Career Assistant</h1>
        <p className="text-muted-foreground">Supercharge your career with TalentXcel AI-powered tools and insights</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tools">TalentXcel AI Tools</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Usage Stats Overview */}
          {usageStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total AI Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageStats.totalCalls}</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageStats.totalCalls > 0 
                      ? Math.round((usageStats.successfulCalls / usageStats.totalCalls) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usageStats.successfulCalls}/{usageStats.totalCalls} successful
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(usageStats.averageResponseTime)}ms</div>
                  <p className="text-xs text-muted-foreground">Response time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${usageStats.totalCost.toFixed(3)}</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Get started with popular AI tools</CardDescription>
              <div className="flex items-center space-x-2 pt-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search AI tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <div
                      key={action.toolSlug}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTab('tools')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{action.title}</h3>
                            {action.popular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest AI tool usage</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-accent/50 rounded-lg">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{activity.tool_slug.replace('-', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{activity.operation_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length > 5 && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTab('history')}
                      className="w-full"
                    >
                      View All Activity
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                  <p className="text-muted-foreground mb-4">Start using AI tools to see your activity here</p>
                  <Button onClick={() => setSelectedTab('tools')}>
                    Explore AI Tools
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <AIToolsInterface />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operation History</CardTitle>
              <CardDescription>Complete history of your AI tool usage</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium capitalize">{activity.tool_slug.replace('-', ' ')}</h3>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Operation: {activity.operation_type}
                      </p>
                      {activity.cost && (
                        <p className="text-xs text-muted-foreground">
                          Cost: ${activity.cost.toFixed(4)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No History</h3>
                  <p className="text-muted-foreground">Your AI tool usage will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {usageStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{usageStats.totalCalls}</div>
                    <p className="text-xs text-muted-foreground">
                      {usageStats.successfulCalls} successful, {usageStats.failedCalls} failed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{usageStats.totalTokens.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total tokens consumed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${usageStats.totalCost.toFixed(3)}</div>
                    <p className="text-xs text-muted-foreground">AI API costs</p>
                  </CardContent>
                </Card>
              </div>

              {/* Usage by Module */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage by Tool</CardTitle>
                  <CardDescription>Breakdown of your AI tool usage</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(usageStats.usageByModule).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(usageStats.usageByModule).map(([module, stats]: [string, any]) => (
                        <div key={module} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h3 className="font-medium capitalize">{module.replace('-', ' ')}</h3>
                            <p className="text-sm text-muted-foreground">
                              {stats.calls} calls • {stats.successRate.toFixed(1)}% success rate
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${stats.cost.toFixed(3)}</p>
                            <p className="text-xs text-muted-foreground">{stats.tokens} tokens</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No usage data available</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}