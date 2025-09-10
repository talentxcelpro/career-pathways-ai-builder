import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  CheckCircle, 
  Clock, 
  Target,
  BarChart3,
  Calendar,
  Award,
  AlertCircle,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface SEOMetric {
  name: string;
  current: number;
  previous: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

interface CompletedFix {
  id: string;
  title: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  completedAt: string;
  pagesAffected: number;
  estimatedImpact: string;
  actualResults?: {
    trafficIncrease: number;
    rankingImprovement: number;
    clicksIncrease: number;
  };
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'completed' | 'in-progress' | 'pending' | 'overdue';
  progress: number;
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    assignee?: string;
  }>;
}

export const SEOProgressTracker: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [metrics, setMetrics] = useState<SEOMetric[]>([
    { name: 'SEO Score', current: 78, previous: 65, target: 90, unit: '/100', trend: 'up' },
    { name: 'Organic Traffic', current: 12450, previous: 9800, target: 15000, unit: 'visitors', trend: 'up' },
    { name: 'Avg Position', current: 15.2, previous: 18.7, target: 10.0, unit: '', trend: 'up' },
    { name: 'Technical Issues', current: 8, previous: 23, target: 0, unit: 'issues', trend: 'up' },
    { name: 'Page Load Speed', current: 2.8, previous: 4.2, target: 2.0, unit: 's', trend: 'up' },
    { name: 'Mobile Score', current: 85, previous: 72, target: 95, unit: '/100', trend: 'up' }
  ]);

  const [completedFixes, setCompletedFixes] = useState<CompletedFix[]>([
    {
      id: '1',
      title: 'Added Missing Meta Descriptions',
      category: 'Content',
      impact: 'high',
      completedAt: '2024-01-15',
      pagesAffected: 45,
      estimatedImpact: '15-25% CTR increase',
      actualResults: {
        trafficIncrease: 18,
        rankingImprovement: 3,
        clicksIncrease: 22
      }
    },
    {
      id: '2',
      title: 'Optimized Page Load Speeds',
      category: 'Technical',
      impact: 'high',
      completedAt: '2024-01-10',
      pagesAffected: 12,
      estimatedImpact: '10-20% ranking improvement',
      actualResults: {
        trafficIncrease: 15,
        rankingImprovement: 5,
        clicksIncrease: 12
      }
    },
    {
      id: '3',
      title: 'Enhanced Internal Linking',
      category: 'Content',
      impact: 'medium',
      completedAt: '2024-01-08',
      pagesAffected: 28,
      estimatedImpact: '5-15% page authority increase'
    }
  ]);

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: 'Q1 SEO Optimization',
      description: 'Complete technical SEO audit and fix critical issues',
      targetDate: '2024-03-31',
      status: 'in-progress',
      progress: 75,
      tasks: [
        { id: '1', title: 'Technical SEO audit', completed: true },
        { id: '2', title: 'Fix meta descriptions', completed: true },
        { id: '3', title: 'Optimize page speeds', completed: true },
        { id: '4', title: 'Implement schema markup', completed: false },
        { id: '5', title: 'Improve mobile optimization', completed: false }
      ]
    },
    {
      id: '2',
      title: 'Content Optimization Phase',
      description: 'Optimize existing content and create new SEO-focused pages',
      targetDate: '2024-04-30',
      status: 'pending',
      progress: 20,
      tasks: [
        { id: '1', title: 'Keyword research for new content', completed: true },
        { id: '2', title: 'Optimize existing job pages', completed: false },
        { id: '3', title: 'Create location-based landing pages', completed: false },
        { id: '4', title: 'Enhance company profile pages', completed: false }
      ]
    }
  ]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Simulate data refresh
      toast.success('Progress data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getMetricChange = (metric: SEOMetric) => {
    const change = metric.current - metric.previous;
    const percentage = ((change / metric.previous) * 100).toFixed(1);
    return { change, percentage };
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress': return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'overdue': return <Badge variant="destructive">Overdue</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">SEO Progress Tracker</h2>
          <p className="text-muted-foreground">Monitor your SEO improvements and track results</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 text-sm rounded ${
                  timeframe === period 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={handleRefreshData} disabled={isRefreshing}>
            {isRefreshing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const { change, percentage } = getMetricChange(metric);
          const isPositive = (metric.name === 'Technical Issues' || metric.name === 'Avg Position' || metric.name === 'Page Load Speed') 
            ? change < 0 
            : change > 0;

          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{metric.name}</h3>
                  <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {percentage}%
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold">
                    {metric.current.toLocaleString()}{metric.unit}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Target: {metric.target.toLocaleString()}{metric.unit}
                  </span>
                </div>
                <Progress 
                  value={(metric.current / metric.target) * 100} 
                  className="h-2"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="completed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="completed">Completed Fixes</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Completed SEO Fixes
              </CardTitle>
              <CardDescription>
                Track the impact of implemented SEO improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedFixes.map((fix) => (
                  <Card key={fix.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{fix.title}</h4>
                            <Badge variant="outline">{fix.category}</Badge>
                            <Badge className={`${getImpactColor(fix.impact)} bg-transparent border-current`}>
                              {fix.impact.toUpperCase()} IMPACT
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            Completed on {fix.completedAt} • {fix.pagesAffected} pages affected
                          </div>
                          <div className="text-sm mb-3">
                            <strong>Estimated Impact:</strong> {fix.estimatedImpact}
                          </div>
                          
                          {fix.actualResults && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                  +{fix.actualResults.trafficIncrease}%
                                </div>
                                <div className="text-xs text-muted-foreground">Traffic Increase</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">
                                  +{fix.actualResults.rankingImprovement}
                                </div>
                                <div className="text-xs text-muted-foreground">Avg Rank Improvement</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">
                                  +{fix.actualResults.clicksIncrease}%
                                </div>
                                <div className="text-xs text-muted-foreground">Clicks Increase</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <div className="space-y-6">
            {milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {milestone.title}
                      </CardTitle>
                      <CardDescription>{milestone.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(milestone.status)}
                      <div className="text-sm text-muted-foreground">
                        Due: {milestone.targetDate}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{milestone.progress}%</span>
                    </div>
                    <Progress value={milestone.progress} className="h-2" />
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Tasks</h4>
                      {milestone.tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2">
                          <CheckCircle 
                            className={`h-4 w-4 ${
                              task.completed ? 'text-green-600' : 'text-gray-300'
                            }`} 
                          />
                          <span className={`text-sm ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </span>
                          {task.assignee && (
                            <Badge variant="outline" className="text-xs">
                              {task.assignee}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roi">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                SEO ROI Analysis
              </CardTitle>
              <CardDescription>
                Return on investment from SEO improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">285%</div>
                    <div className="text-sm text-muted-foreground">Overall ROI</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">₹2.8L</div>
                    <div className="text-sm text-muted-foreground">Additional Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">45%</div>
                    <div className="text-sm text-muted-foreground">Traffic Increase</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">12 weeks</div>
                    <div className="text-sm text-muted-foreground">Payback Period</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Cost-Benefit Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-muted/30 rounded">
                      <span>SEO Implementation Cost</span>
                      <span className="font-semibold">₹45,000</span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-50 rounded">
                      <span>Additional Revenue (12 months)</span>
                      <span className="font-semibold text-green-600">₹1,28,000</span>
                    </div>
                    <div className="flex justify-between p-3 bg-blue-50 rounded border-t">
                      <span className="font-semibold">Net Profit</span>
                      <span className="font-bold text-blue-600">₹83,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};