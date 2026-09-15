import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Brain, TrendingUp, Target, Shield, Users, Bell, 
  Clock, AlertCircle, CheckCircle, Star, Award,
  Briefcase, DollarSign, MapPin, ExternalLink,
  Calendar, MessageSquare, Settings, RefreshCw,
  Zap, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';

interface CareerAlert {
  id: string;
  type: 'opportunity' | 'skill_demand' | 'salary_trend' | 'network_update' | 'market_change';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  actionable: boolean;
  actionUrl?: string;
  data?: any;
}

interface QuickMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface PersonalizedInsight {
  id: string;
  category: 'career_path' | 'skills' | 'networking' | 'market' | 'opportunities';
  insight: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  confidence: number;
}

const CareerIntelligenceDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<CareerAlert[]>([]);
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [quickMetrics, setQuickMetrics] = useState<QuickMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [credibilityScore, setCredibilityScore] = useState(742);
  const [marketPosition, setMarketPosition] = useState(78);

  useEffect(() => {
    initializeDashboard();
    
    // Set up real-time updates
    const channel = supabase
      .channel('career-intelligence-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_career_insights'
        },
        (payload) => {
          console.log('New career insight received:', payload);
          handleRealTimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const initializeDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCareerAlerts(),
        loadPersonalizedInsights(),
        loadQuickMetrics(),
        fetchLatestMarketData()
      ]);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      toast.error('Failed to load career intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const loadCareerAlerts = async () => {
    // Simulate real-time career alerts
    const mockAlerts: CareerAlert[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'High-Match Job Alert',
        description: 'New Senior Software Engineer position at Google matches 94% of your profile',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        actionable: true,
        actionUrl: '/jobs/google-senior-engineer',
        data: { matchScore: 94, company: 'Google', salary: '$180K-$220K' }
      },
      {
        id: '2',
        type: 'skill_demand',
        title: 'Kubernetes Demand Surge',
        description: 'Kubernetes skills are now in 40% higher demand. Consider getting certified.',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        actionable: true,
        data: { skill: 'Kubernetes', demandIncrease: 40, salaryBoost: '+$25K' }
      },
      {
        id: '3',
        type: 'network_update',
        title: 'Strategic Connection Available',
        description: 'Sarah Chen (Google Engineering Director) is accepting connections',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        actionable: true,
        data: { contactName: 'Sarah Chen', company: 'Google', role: 'Engineering Director' }
      },
      {
        id: '4',
        type: 'salary_trend',
        title: 'Market Salary Increase',
        description: 'Software Engineer salaries in your area increased by 8% this quarter',
        priority: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        actionable: false,
        data: { increase: 8, timeframe: 'quarterly', role: 'Software Engineer' }
      }
    ];
    setAlerts(mockAlerts);
  };

  const loadPersonalizedInsights = async () => {
    const mockInsights: PersonalizedInsight[] = [
      {
        id: '1',
        category: 'career_path',
        insight: 'Your profile strongly aligns with AI Engineering roles',
        recommendation: 'Consider transitioning to AI Engineer within 18 months',
        impact: 'high',
        timeframe: '18 months',
        confidence: 89
      },
      {
        id: '2',
        category: 'skills',
        insight: 'You have 85% of skills needed for Senior Engineering Manager',
        recommendation: 'Focus on leadership training and team management experience',
        impact: 'high',
        timeframe: '12 months',
        confidence: 92
      },
      {
        id: '3',
        category: 'networking',
        insight: 'Your network lacks connections in target companies',
        recommendation: 'Connect with 5-8 engineers at FAANG companies',
        impact: 'medium',
        timeframe: '3 months',
        confidence: 78
      },
      {
        id: '4',
        category: 'market',
        insight: 'Remote work opportunities in your field increased 25%',
        recommendation: 'Update your preferences to include remote positions',
        impact: 'medium',
        timeframe: 'immediate',
        confidence: 95
      }
    ];
    setInsights(mockInsights);
  };

  const loadQuickMetrics = async () => {
    const metrics: QuickMetric[] = [
      {
        label: 'Career Readiness',
        value: '87%',
        change: 5,
        trend: 'up',
        icon: <Target className="h-4 w-4" />,
        color: 'text-green-600'
      },
      {
        label: 'Market Position',
        value: `${marketPosition}th`,
        change: 3,
        trend: 'up',
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-blue-600'
      },
      {
        label: 'Credibility Score',
        value: credibilityScore,
        change: 12,
        trend: 'up',
        icon: <Shield className="h-4 w-4" />,
        color: 'text-purple-600'
      },
      {
        label: 'Network Quality',
        value: '82%',
        change: -2,
        trend: 'down',
        icon: <Users className="h-4 w-4" />,
        color: 'text-orange-600'
      },
      {
        label: 'Salary Position',
        value: '$145K',
        change: 8,
        trend: 'up',
        icon: <DollarSign className="h-4 w-4" />,
        color: 'text-green-600'
      },
      {
        label: 'Active Opportunities',
        value: 23,
        change: 7,
        trend: 'up',
        icon: <Briefcase className="h-4 w-4" />,
        color: 'text-indigo-600'
      }
    ];
    setQuickMetrics(metrics);
  };

  const fetchLatestMarketData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('real-time-market-data', {
        body: {
          industry: 'technology',
          role: 'software engineer',
          location: 'United States',
          experience_level: 'mid-level'
        }
      });

      if (data?.success) {
        // Update dashboard with latest market data
        console.log('Latest market data received:', data.data);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const handleRealTimeUpdate = (payload: any) => {
    // Handle real-time career insight updates
    toast.success('New career insight available!', {
      action: {
        label: 'View',
        onClick: () => console.log('View insight:', payload)
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career_path': return <Target className="h-4 w-4" />;
      case 'skills': return <Brain className="h-4 w-4" />;
      case 'networking': return <Users className="h-4 w-4" />;
      case 'market': return <TrendingUp className="h-4 w-4" />;
      case 'opportunities': return <Briefcase className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your career intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-7 w-7 text-primary" />
                Career Intelligence Dashboard
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                AI-powered insights for accelerated career growth
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Live Updates
              </Badge>
              <Button onClick={initializeDashboard} disabled={loading} size="sm" variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={metric.color}>
                  {metric.icon}
                </div>
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <ArrowUp className="h-3 w-3 text-green-600" />
                  ) : metric.trend === 'down' ? (
                    <ArrowDown className="h-3 w-3 text-red-600" />
                  ) : null}
                  <span className={`text-xs ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Real-Time Alerts
            {alerts.filter(a => a.priority === 'high').length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {alerts.filter(a => a.priority === 'high').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </TabsTrigger>
        </TabsList>

        {/* Real-Time Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${getPriorityColor(alert.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                          {alert.priority} priority
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{alert.description}</p>
                      
                      {alert.data && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                          {Object.entries(alert.data).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="ml-1">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {alert.actionable && (
                        <div className="flex gap-2">
                          <Button size="sm">
                            Take Action <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                          <Button size="sm" variant="outline">
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getCategoryIcon(insight.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant="outline" className="mb-2 capitalize">
                            {insight.category.replace('_', ' ')}
                          </Badge>
                          <h4 className="font-semibold">{insight.insight}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                          <div className="text-right">
                            <div className="text-sm font-bold text-primary">{insight.confidence}%</div>
                            <div className="text-xs text-muted-foreground">Confidence</div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3">{insight.recommendation}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Timeframe: {insight.timeframe}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Create Action Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Opportunities */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  High-Match Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Senior Software Engineer</h4>
                          <p className="text-sm text-muted-foreground">Google • San Francisco, CA</p>
                          <p className="text-sm text-green-600 font-medium">$180K - $220K</p>
                        </div>
                        <Badge className="bg-green-50 text-green-700">
                          {94 - index * 3}% match
                        </Badge>
                      </div>
                      <Button size="sm" className="mt-2 w-full">
                        Apply Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Networking Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Chen', role: 'Engineering Director', company: 'Google' },
                    { name: 'Michael Rodriguez', role: 'Senior Engineer', company: 'Microsoft' },
                    { name: 'Emily Johnson', role: 'Product Manager', company: 'Meta' }
                  ].map((contact, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{contact.name}</h4>
                        <p className="text-sm text-muted-foreground">{contact.role} at {contact.company}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quick Actions */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Update Skills Profile',
                description: 'Add Kubernetes certification to boost your score by 15 points',
                icon: <Brain className="h-5 w-5" />,
                color: 'bg-blue-50 text-blue-600',
                action: 'Update Profile'
              },
              {
                title: 'Schedule Networking',
                description: 'Set up coffee chat with 3 strategic contacts this week',
                icon: <Calendar className="h-5 w-5" />,
                color: 'bg-green-50 text-green-600',
                action: 'Schedule Now'
              },
              {
                title: 'Apply to Top Matches',
                description: '5 high-match positions available for immediate application',
                icon: <Target className="h-5 w-5" />,
                color: 'bg-purple-50 text-purple-600',
                action: 'View Jobs'
              },
              {
                title: 'Skill Gap Training',
                description: 'Start AWS certification to fill critical skill gap',
                icon: <Award className="h-5 w-5" />,
                color: 'bg-orange-50 text-orange-600',
                action: 'Start Learning'
              },
              {
                title: 'Salary Negotiation',
                description: 'Your market value increased by 8%. Time to negotiate?',
                icon: <DollarSign className="h-5 w-5" />,
                color: 'bg-yellow-50 text-yellow-600',
                action: 'Get Insights'
              },
              {
                title: 'Profile Optimization',
                description: 'Update LinkedIn with latest achievements for visibility',
                icon: <Settings className="h-5 w-5" />,
                color: 'bg-indigo-50 text-indigo-600',
                action: 'Optimize Now'
              }
            ].map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className={`p-2 rounded-lg ${action.color} w-fit mb-3`}>
                    {action.icon}
                  </div>
                  <h4 className="font-semibold mb-2">{action.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                  <Button size="sm" className="w-full">
                    {action.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareerIntelligenceDashboard;