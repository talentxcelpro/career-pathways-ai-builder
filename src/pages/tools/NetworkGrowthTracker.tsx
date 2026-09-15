import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Network, 
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  Target,
  Save,
  Download,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const NetworkGrowthTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('network-growth-tracker', 'Network Growth Tracker');
      usage.then(data => {
        if (data) {
          setUsageId(data.id);
          analyzeNetwork();
        }
      });
    }
  }, [user]);

  const analyzeNetwork = async () => {
    if (!user) return;

    setIsAnalyzing(true);

    try {
      // Fetch user's connections and network activity
      const [connectionsRes, postsRes, messagesRes, profileRes] = await Promise.all([
        supabase.from('connections').select('*').or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`),
        supabase.from('posts').select('*').eq('author_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('messages').select('*').eq('sender_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('*').eq('id', user.id).single()
      ]);

      const connections = connectionsRes.data || [];
      const posts = postsRes.data || [];
      const messages = messagesRes.data || [];
      const profile = profileRes.data;

      // Calculate network metrics
      const totalConnections = connections.length;
      const recentConnections = connections.filter(conn => {
        const createdDate = new Date(conn.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate >= thirtyDaysAgo;
      }).length;

      const acceptedConnections = connections.filter(conn => conn.status === 'accepted').length;
      const pendingConnections = connections.filter(conn => conn.status === 'pending').length;

      const recentPosts = posts.filter(post => {
        const postDate = new Date(post.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return postDate >= thirtyDaysAgo;
      }).length;

      const recentMessages = messages.filter(msg => {
        const msgDate = new Date(msg.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return msgDate >= thirtyDaysAgo;
      }).length;

      // Use AI for insights and recommendations
      const { data: aiResponse } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'network-growth-analysis',
          data: {
            totalConnections,
            recentConnections,
            acceptedConnections,
            pendingConnections,
            recentPosts,
            recentMessages,
            profile
          },
          userId: user.id
        }
      });

      const result = {
        overview: {
          total_connections: totalConnections,
          recent_connections: recentConnections,
          acceptance_rate: totalConnections > 0 ? Math.round((acceptedConnections / totalConnections) * 100) : 0,
          pending_requests: pendingConnections,
          engagement_score: Math.min(100, (recentPosts * 10) + (recentMessages * 5) + (recentConnections * 15))
        },
        growth_metrics: {
          monthly_growth: recentConnections,
          growth_rate: totalConnections > 0 ? Math.round((recentConnections / Math.max(totalConnections - recentConnections, 1)) * 100) : 0,
          activity_level: recentPosts + recentMessages,
          networking_frequency: Math.round((recentMessages + recentConnections) / 4) // Weekly average
        },
        performance_indicators: [
          {
            metric: 'Connection Quality',
            value: Math.round((acceptedConnections / Math.max(totalConnections, 1)) * 100),
            target: 85,
            status: acceptedConnections / Math.max(totalConnections, 1) >= 0.85 ? 'good' : 'needs_improvement'
          },
          {
            metric: 'Engagement Rate', 
            value: Math.min(100, (recentPosts * 5) + (recentMessages * 2)),
            target: 60,
            status: ((recentPosts * 5) + (recentMessages * 2)) >= 60 ? 'good' : 'needs_improvement'
          },
          {
            metric: 'Network Growth',
            value: recentConnections,
            target: 10,
            status: recentConnections >= 10 ? 'excellent' : recentConnections >= 5 ? 'good' : 'needs_improvement'
          }
        ],
        insights: aiResponse?.insights || [
          totalConnections === 0 ? 'Start building your professional network by connecting with colleagues' : `You have ${totalConnections} connections - great foundation!`,
          recentConnections > 5 ? 'Excellent networking activity this month!' : 'Consider being more active in making new connections',
          recentPosts > 2 ? 'Good content sharing keeps you visible' : 'Share more content to increase your visibility',
          `Your acceptance rate of ${Math.round((acceptedConnections / Math.max(totalConnections, 1)) * 100)}% shows good connection quality`
        ],
        recommendations: aiResponse?.recommendations || [
          recentConnections < 5 ? 'Aim to make 2-3 new connections weekly' : 'Maintain your excellent networking pace',
          recentPosts === 0 ? 'Share industry insights or achievements weekly' : 'Continue sharing valuable content',
          recentMessages < 5 ? 'Engage more with your connections\' posts' : 'Great engagement with your network',
          'Set networking goals and track progress monthly'
        ],
        action_plan: {
          weekly_goals: [
            `Connect with ${Math.max(2, Math.ceil(10 - recentConnections / 4))} new professionals`,
            `Share ${Math.max(1, 3 - Math.ceil(recentPosts / 4))} valuable posts`,
            `Engage with ${Math.max(3, 10 - Math.ceil(recentMessages / 4))} connections' content`
          ],
          monthly_targets: {
            new_connections: Math.max(10, recentConnections + 5),
            content_posts: Math.max(4, recentPosts + 2),
            meaningful_interactions: Math.max(20, recentMessages + 10)
          }
        }
      };

      setNetworkData(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 150);
      }

      toast.success('Network analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
      if (usageId) {
        await updateToolUsage(usageId, {}, 'failed', 0);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = async () => {
    if (!networkData) return;
    
    await saveToolResult(
      'network-growth-tracker',
      'Network Growth Analysis',
      networkData,
      'analysis',
      ['networking', 'growth', 'connections', 'engagement']
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs_improvement': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderAnalysis = () => {
    if (!networkData) return null;

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{networkData.overview.total_connections}</div>
              <div className="text-sm text-muted-foreground">Total Connections</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{networkData.overview.recent_connections}</div>
              <div className="text-sm text-muted-foreground">New This Month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{networkData.overview.engagement_score}</div>
              <div className="text-sm text-muted-foreground">Engagement Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{networkData.overview.acceptance_rate}%</div>
              <div className="text-sm text-muted-foreground">Acceptance Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {networkData.performance_indicators.map((indicator: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{indicator.metric}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(indicator.status)}>
                        {indicator.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-2xl font-bold">{indicator.value}</span>
                    <span className="text-sm text-muted-foreground">/ {indicator.target} target</span>
                  </div>
                  <Progress value={(indicator.value / indicator.target) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Growth Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{networkData.growth_metrics.monthly_growth}</div>
                <div className="text-sm text-muted-foreground">Monthly Growth</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{networkData.growth_metrics.growth_rate}%</div>
                <div className="text-sm text-muted-foreground">Growth Rate</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{networkData.growth_metrics.activity_level}</div>
                <div className="text-sm text-muted-foreground">Activity Level</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{networkData.growth_metrics.networking_frequency}</div>
                <div className="text-sm text-muted-foreground">Weekly Frequency</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {networkData.insights.map((insight: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Action Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Weekly Goals</h4>
                <ul className="space-y-2">
                  {networkData.action_plan.weekly_goals.map((goal: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Monthly Targets</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>New Connections:</span>
                    <Badge variant="outline">{networkData.action_plan.monthly_targets.new_connections}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Content Posts:</span>
                    <Badge variant="outline">{networkData.action_plan.monthly_targets.content_posts}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Interactions:</span>
                    <Badge variant="outline">{networkData.action_plan.monthly_targets.meaningful_interactions}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {networkData.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Analysis
          </Button>
          <Button variant="outline" onClick={analyzeNetwork} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>

        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-8">
            {isAnalyzing ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Analyzing Your Network</h3>
                <p className="text-muted-foreground">
                  Calculating growth metrics and engagement patterns...
                </p>
              </div>
            ) : !networkData ? (
              <div className="text-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Network className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Network Growth Tracker</h2>
                  <p className="text-muted-foreground mb-6">
                    Tracks growth in professional connections and engagement
                  </p>
                </div>
                <Button onClick={analyzeNetwork} size="lg" className="px-8">
                  <Network className="h-5 w-5 mr-2" />
                  Analyze My Network
                </Button>
              </div>
            ) : (
              renderAnalysis()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkGrowthTracker;