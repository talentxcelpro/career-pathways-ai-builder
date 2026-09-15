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

const CareerIntelligenceCommandCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<CareerAlert[]>([]);
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [quickMetrics, setQuickMetrics] = useState<QuickMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [credibilityScore, setCredibilityScore] = useState(742);
  const [marketPosition, setMarketPosition] = useState(78);

  useEffect(() => {
    initializeCommandCenter();
    
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
          console.log('New performance insight received:', payload);
          handleRealTimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const initializeCommandCenter = async () => {
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
      console.error('Error initializing Intelligence Hub:', error);
      toast.error('Failed to load Intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const loadCareerAlerts = async () => {
    // Simulate real-time performance alerts
    const mockAlerts: CareerAlert[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'Precision Match Alert',
        description: 'New Senior Software Engineer position at Google matches 94% of your profile',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        actionable: true,
        actionUrl: '/jobs/google-senior-engineer',
        data: { matchScore: 94, company: 'Google', salary: '$180K-$220K' }
      },
      {
        id: '2',
        type: 'skill_demand',
        title: 'Capability Demand Surge',
        description: 'Kubernetes skills are now in 40% higher demand. Index your capability now.',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        actionable: true,
        data: { skill: 'Kubernetes', demandIncrease: 40, salaryBoost: '+$25K' }
      },
      {
        id: '3',
        type: 'network_update',
        title: 'Strategic Sync Available',
        description: 'Sarah Chen (Google Engineering Director) is open to Ecosystem connections',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        actionable: true,
        data: { contactName: 'Sarah Chen', company: 'Google', role: 'Engineering Director' }
      },
      {
        id: '4',
        type: 'salary_trend',
        title: 'Market Value Calibration',
        description: 'Professional compensation in your tier increased by 8% this quarter',
        priority: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
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
        insight: 'Your identity aligns with High-Performance Architecture roles',
        recommendation: 'Synchronize with Senior Architect roadmaps within 12 months',
        impact: 'high',
        timeframe: '12 months',
        confidence: 89
      },
      {
        id: '2',
        category: 'skills',
        insight: 'You have indexed 85% of Elite Engineering capabilities',
        recommendation: 'Complete Advanced Neural Architecture module for full tier status',
        impact: 'high',
        timeframe: '3 months',
        confidence: 92
      },
      {
        id: '3',
        category: 'networking',
        insight: 'Ecosystem gap detected in target enterprise sectors',
        recommendation: 'Sync with 5-8 leadership contacts at target ecosystem partners',
        impact: 'medium',
        timeframe: '3 months',
        confidence: 78
      },
      {
        id: '4',
        category: 'market',
        insight: 'Global remote performance roles increased 25%',
        recommendation: 'Calibrate your visibility preferences for distributed models',
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
        label: 'Capability Index',
        value: '87%',
        change: 5,
        trend: 'up',
        icon: <Target className="h-4 w-4" />,
        color: 'text-emerald-600'
      },
      {
        label: 'Market Status',
        value: `${marketPosition}th`,
        change: 3,
        trend: 'up',
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-blue-600'
      },
      {
        label: 'Trust Score',
        value: credibilityScore,
        change: 12,
        trend: 'up',
        icon: <Shield className="h-4 w-4" />,
        color: 'text-purple-600'
      },
      {
        label: 'Ecosystem Health',
        value: '82%',
        change: -2,
        trend: 'down',
        icon: <Users className="h-4 w-4" />,
        color: 'text-rose-600'
      },
      {
        label: 'Market Index',
        value: '$145K',
        change: 8,
        trend: 'up',
        icon: <DollarSign className="h-4 w-4" />,
        color: 'text-emerald-600'
      },
      {
        label: 'Active Syncs',
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
          location: 'Global',
          experience_level: 'elite'
        }
      });

      if (data?.success) {
        console.log('Market intelligence indexed:', data.data);
      }
    } catch (error) {
      console.error('Error indexing market data:', error);
    }
  };

  const handleRealTimeUpdate = (payload: any) => {
    toast.success('Intelligence update indexed!', {
      action: {
        label: 'Analyze',
        onClick: () => console.log('Analyze insight:', payload)
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-rose-600 bg-rose-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
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
      <div className="flex items-center justify-center h-96 edge-to-edge">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6 shadow-xl"></div>
          <p className="text-slate-500 font-apple-medium">Synchronizing Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 edge-to-edge">
      {/* Intelligence Hub Header */}
      <Card className="border-slate-200 bg-white shadow-2xl rounded-[48px] overflow-hidden">
        <CardHeader className="p-10 bg-slate-950 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-[24px] bg-blue-600 flex items-center justify-center shadow-2xl">
                <Brain className="h-9 w-9 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-apple-heavy tracking-tighter">
                  Intelligence Hub
                </CardTitle>
                <p className="text-slate-400 font-apple-medium text-lg mt-2">
                  Performance synchronization for accelerated growth
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-emerald-500 text-white border-0 font-apple-heavy text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl">
                <div className="w-2.5 h-2.5 bg-white rounded-full mr-2 animate-pulse"></div>
                Real-Time Sync
              </Badge>
              <Button onClick={initializeCommandCenter} disabled={loading} className="h-14 px-8 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 font-apple-heavy">
                <RefreshCw className={`h-5 w-5 mr-3 ${loading ? 'animate-spin' : ''}`} />
                Resync
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <div className="mt-8 flex items-center gap-2 text-xs font-apple-bold text-slate-500 uppercase tracking-widest">
              <Clock className="h-4 w-4" />
              Intelligence Index: {lastUpdated}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {quickMetrics.map((metric, index) => (
          <Card key={index} className="rounded-[32px] border-slate-100 bg-white shadow-lg hover:shadow-2xl transition-all border group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl bg-slate-50", metric.color)}>
                  {metric.icon}
                </div>
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 text-rose-600" />
                  )}
                  <span className={cn("text-xs font-apple-heavy", metric.trend === 'up' ? 'text-emerald-600' : 'text-rose-600')}>
                    {metric.change}%
                  </span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-apple-heavy text-slate-950 tracking-tighter">{metric.value}</div>
                <div className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest mt-1">{metric.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Intelligence Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="h-20 w-full p-2 bg-slate-100/50 backdrop-blur-xl rounded-[32px] border border-slate-200 grid grid-cols-4 gap-2">
          <TabsTrigger value="insights" className="rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-blue-600">
            <Brain className="h-4 w-4 mr-2" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-rose-600">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
            {alerts.filter(a => a.priority === 'high').length > 0 && (
              <Badge className="ml-2 bg-rose-600 text-white rounded-lg h-5 w-5 p-0 flex items-center justify-center">
                {alerts.filter(a => a.priority === 'high').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-emerald-600">
            <Target className="h-4 w-4 mr-2" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="actions" className="rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-indigo-600">
            <Zap className="h-4 w-4 mr-2" />
            Tactics
          </TabsTrigger>
        </TabsList>

        {/* Intelligence Insights */}
        <TabsContent value="insights" className="mt-8 space-y-6">
          <div className="grid gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="rounded-[40px] border-slate-100 bg-white shadow-xl hover:shadow-2xl transition-all border group">
                <CardContent className="p-10">
                  <div className="flex items-start gap-8">
                    <div className="h-16 w-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-105 transition-transform">
                      {getCategoryIcon(insight.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        <div>
                          <Badge className="mb-4 bg-slate-950 text-white rounded-xl h-8 px-4 font-apple-heavy text-[10px] uppercase tracking-widest">
                            {insight.category.replace('_', ' ')}
                          </Badge>
                          <h4 className="text-2xl font-apple-heavy text-slate-950 tracking-tight leading-none">{insight.insight}</h4>
                        </div>
                        <div className="flex items-center gap-6">
                          <Badge className={cn("h-10 px-6 rounded-2xl font-apple-heavy text-[10px] uppercase tracking-widest border-0", getImpactColor(insight.impact))}>
                            {insight.impact} IMPACT
                          </Badge>
                          <div className="text-right">
                            <div className="text-2xl font-apple-heavy text-blue-600 tracking-tighter">{insight.confidence}%</div>
                            <div className="text-[9px] font-apple-heavy text-slate-400 uppercase tracking-widest">CONFIDENCE INDEX</div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-lg font-apple-medium text-slate-500 mb-8 leading-relaxed">{insight.recommendation}</p>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3 text-xs font-apple-bold text-slate-400 uppercase tracking-widest">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <span>Timeline: {insight.timeframe}</span>
                        </div>
                        <Button className="h-14 px-10 rounded-2xl bg-slate-950 text-white font-apple-heavy shadow-2xl hover:scale-105 transition-all">
                          Initialize Action Roadmap
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Real-Time Alerts */}
        <TabsContent value="alerts" className="mt-8 space-y-6">
          <div className="grid gap-6">
            {alerts.map((alert) => (
              <Card key={alert.id} className={cn("rounded-[32px] border-l-[12px] shadow-xl bg-white", alert.priority === 'high' ? 'border-rose-600' : alert.priority === 'medium' ? 'border-amber-500' : 'border-emerald-500')}>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h4 className="text-xl font-apple-heavy text-slate-950">{alert.title}</h4>
                        <Badge className={cn("rounded-lg font-apple-heavy text-[10px] uppercase tracking-widest", getPriorityColor(alert.priority))}>
                          {alert.priority} priority
                        </Badge>
                        <span className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-500 font-apple-medium text-base mb-6 leading-relaxed">{alert.description}</p>
                      
                      {alert.data && (
                        <div className="flex flex-wrap gap-4 mb-8">
                          {Object.entries(alert.data).map(([key, value]) => (
                            <div key={key} className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest block mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="text-sm font-apple-heavy text-slate-900">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {alert.actionable && (
                        <div className="flex gap-3">
                          <Button className="h-12 px-8 rounded-xl bg-slate-950 text-white font-apple-heavy text-xs shadow-xl">
                            EXECUTE MOVE <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                          <Button variant="ghost" className="h-12 px-8 rounded-xl font-apple-heavy text-xs text-slate-400 hover:text-slate-950">
                            Index for later
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

        {/* Opportunities */}
        <TabsContent value="opportunities" className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-[48px] border-slate-200 bg-white shadow-2xl overflow-hidden border">
              <CardHeader className="p-10 bg-slate-50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-4 text-xl font-apple-heavy text-slate-950">
                  <Briefcase className="h-7 w-7 text-blue-600" />
                  Precision Match Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <div className="space-y-6">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="p-8 bg-white border border-slate-100 rounded-[32px] hover:border-blue-200 hover:shadow-2xl transition-all group">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h4 className="text-xl font-apple-heavy text-slate-950 group-hover:text-blue-600 transition-colors">Senior Software Engineer</h4>
                          <p className="text-sm font-apple-bold text-slate-400 uppercase tracking-widest mt-1">Google • Mountain View, CA</p>
                          <p className="text-lg font-apple-heavy text-emerald-600 mt-2">$180K - $220K</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-apple-heavy text-blue-600 tracking-tighter">{94 - index * 3}%</div>
                          <div className="text-[9px] font-apple-heavy text-slate-400 uppercase tracking-widest">MATCH INDEX</div>
                        </div>
                      </div>
                      <Button className="h-12 w-full rounded-xl bg-slate-950 text-white font-apple-heavy text-xs shadow-xl hover:scale-105 transition-all">
                        INITIALIZE APPLICATION
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[48px] border-slate-200 bg-white shadow-2xl overflow-hidden border">
              <CardHeader className="p-10 bg-slate-50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-4 text-xl font-apple-heavy text-slate-950">
                  <Users className="h-7 w-7 text-purple-600" />
                  Ecosystem Synchronization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <div className="space-y-6">
                  {[
                    { name: 'Sarah Chen', role: 'Engineering Director', company: 'Google' },
                    { name: 'Michael Rodriguez', role: 'Senior Engineer', company: 'Microsoft' },
                    { name: 'Emily Johnson', role: 'Product Architect', company: 'Meta' }
                  ].map((contact, index) => (
                    <div key={index} className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                      <Avatar className="h-16 w-16 rounded-2xl border-2 border-white shadow-lg">
                        <AvatarFallback className="bg-slate-950 text-white font-apple-heavy">{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-lg font-apple-heavy text-slate-950 group-hover:text-blue-600 transition-colors">{contact.name}</h4>
                        <p className="text-xs font-apple-bold text-slate-400 uppercase tracking-widest mt-1">{contact.role} @ {contact.company}</p>
                      </div>
                      <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-white shadow-lg text-slate-950 hover:bg-blue-600 hover:text-white transition-all">
                        <MessageSquare className="h-6 w-6" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quick Tactics */}
        <TabsContent value="actions" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Capability Indexing',
                description: 'Index your Kubernetes capabilities to boost your status score by 15 points.',
                icon: <Brain className="h-7 w-7" />,
                color: 'bg-blue-50 text-blue-600',
                action: 'Sync Profile'
              },
              {
                title: 'Ecosystem Sync',
                description: 'Initialize coffee chats with 3 strategic ecosystem partners this week.',
                icon: <Calendar className="h-7 w-7" />,
                color: 'bg-emerald-50 text-emerald-600',
                action: 'Sync Now'
              },
              {
                title: 'Apply to Matches',
                description: '5 high-precision matches indexed for immediate tactical application.',
                icon: <Target className="h-7 w-7" />,
                color: 'bg-indigo-50 text-indigo-600',
                action: 'Analyze Jobs'
              },
              {
                title: 'Skill Evolution',
                description: 'Initialize AWS architecture module to fill critical capability gaps.',
                icon: <Award className="h-7 w-7" />,
                color: 'bg-amber-50 text-amber-600',
                action: 'Start Evolution'
              },
              {
                title: 'Market Indexing',
                description: 'Your market value indexed +8%. Initialize negotiation strategy?',
                icon: <DollarSign className="h-7 w-7" />,
                color: 'bg-rose-50 text-rose-600',
                action: 'Index Value'
              },
              {
                title: 'Identity Optimization',
                description: 'Update professional identity for high-fidelity ecosystem visibility.',
                icon: <Settings className="h-7 w-7" />,
                color: 'bg-slate-50 text-slate-600',
                action: 'Optimize Hub'
              }
            ].map((action, index) => (
              <Card key={index} className="rounded-[40px] border-slate-100 bg-white shadow-xl hover:shadow-2xl transition-all border group cursor-pointer overflow-hidden">
                <CardContent className="p-10">
                  <div className={cn("h-16 w-16 rounded-[24px] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform", action.color)}>
                    {action.icon}
                  </div>
                  <h4 className="text-xl font-apple-heavy text-slate-950 mb-4 tracking-tight">{action.title}</h4>
                  <p className="text-base font-apple-medium text-slate-500 mb-10 leading-relaxed">{action.description}</p>
                  <Button className="w-full h-14 rounded-2xl bg-slate-950 text-white font-apple-heavy text-sm shadow-xl hover:scale-105 transition-all">
                    {action.action.toUpperCase()}
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

export default CareerIntelligenceCommandCenter;
