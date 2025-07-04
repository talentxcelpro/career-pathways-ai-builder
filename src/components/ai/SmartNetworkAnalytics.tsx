import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Network, 
  Users, 
  TrendingUp, 
  Target,
  MessageSquare,
  UserPlus,
  Eye,
  Zap,
  Brain,
  ArrowRight,
  Award,
  Clock,
  MapPin,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface NetworkConnection {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  connectionStrength: number;
  mutualConnections: number;
  lastInteraction: string;
  canHelp: string[];
  influenceScore: number;
}

interface NetworkOpportunity {
  type: 'introduction' | 'referral' | 'collaboration' | 'mentorship';
  title: string;
  description: string;
  connections: NetworkConnection[];
  successProbability: number;
  potentialImpact: 'high' | 'medium' | 'low';
}

interface NetworkMetric {
  label: string;
  value: number;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

export const SmartNetworkAnalytics: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'opportunities' | 'growth'>('overview');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-network'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { ...user, profile };
    }
  });

  // Mock network data - in real implementation, this would come from AI analysis
  const topConnections: NetworkConnection[] = [
    {
      id: '1',
      name: 'Arjun Mehta',
      title: 'Senior Tech Lead',
      company: 'Google India',
      connectionStrength: 85,
      mutualConnections: 12,
      lastInteraction: '2 days ago',
      canHelp: ['Job Referrals', 'Tech Mentorship', 'System Design'],
      influenceScore: 92
    },
    {
      id: '2',
      name: 'Priya Sharma',
      title: 'VP Engineering',
      company: 'Flipkart',
      connectionStrength: 78,
      mutualConnections: 8,
      lastInteraction: '1 week ago',
      canHelp: ['Leadership', 'Career Guidance', 'Hiring Insights'],
      influenceScore: 96
    },
    {
      id: '3',
      name: 'Vikram Singh',
      title: 'React Developer',
      company: 'Microsoft',
      connectionStrength: 71,
      mutualConnections: 15,
      lastInteraction: '3 days ago',
      canHelp: ['React', 'Frontend', 'Code Review'],
      influenceScore: 78
    }
  ];

  const networkOpportunities: NetworkOpportunity[] = [
    {
      type: 'referral',
      title: 'Senior Developer Role at Google',
      description: 'Arjun Mehta can refer you to his team at Google for a senior developer position',
      connections: [topConnections[0]],
      successProbability: 78,
      potentialImpact: 'high'
    },
    {
      type: 'mentorship',
      title: 'Leadership Mentorship',
      description: 'Priya Sharma offers mentorship for transitioning to leadership roles',
      connections: [topConnections[1]],
      successProbability: 85,
      potentialImpact: 'high'
    },
    {
      type: 'collaboration',
      title: 'Open Source Project',
      description: 'Join a React project with 3 of your connections',
      connections: topConnections.slice(0, 3),
      successProbability: 92,
      potentialImpact: 'medium'
    }
  ];

  const networkMetrics: NetworkMetric[] = [
    {
      label: 'Network Reach',
      value: 1247,
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Influence Score',
      value: 78,
      change: '+5%',
      trend: 'up'
    },
    {
      label: 'Engagement Rate',
      value: 34,
      change: '+8%',
      trend: 'up'
    },
    {
      label: 'Response Rate',
      value: 67,
      change: '-2%',
      trend: 'down'
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      case 'stable': return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Smart Network Analytics</h3>
          <p className="text-gray-600 mb-4">
            Login to get AI-powered insights about your professional network
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Network className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-900">Smart Network Analytics</h2>
              <p className="text-sm text-green-700">AI-powered network intelligence and growth insights</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {networkMetrics.map((metric, index) => (
              <div key={index} className="text-center p-3 bg-white rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="text-2xl font-bold text-green-600">{metric.value}</div>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="text-xs text-gray-600">{metric.label}</div>
                <div className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {metric.change}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeView === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveView('overview')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Network Overview
        </Button>
        <Button
          variant={activeView === 'opportunities' ? 'default' : 'outline'}
          onClick={() => setActiveView('opportunities')}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Opportunities
        </Button>
        <Button
          variant={activeView === 'growth' ? 'default' : 'outline'}
          onClick={() => setActiveView('growth')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Growth Strategy
        </Button>
      </div>

      {/* Network Overview */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Top Network Connections
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your most influential and valuable professional connections
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topConnections.map((connection) => (
                  <div key={connection.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={connection.avatar} />
                        <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{connection.name}</h4>
                            <p className="text-sm text-gray-600">{connection.title}</p>
                            <p className="text-sm text-gray-500">{connection.company}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">{connection.influenceScore}</div>
                            <div className="text-xs text-gray-500">Influence Score</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{connection.connectionStrength}%</div>
                            <div className="text-xs text-gray-600">Connection Strength</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{connection.mutualConnections}</div>
                            <div className="text-xs text-gray-600">Mutual Connections</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{connection.lastInteraction}</div>
                            <div className="text-xs text-gray-600">Last Interaction</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {connection.canHelp.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Network Opportunities */}
      {activeView === 'opportunities' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              AI-Identified Opportunities
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Smart opportunities based on your network analysis
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {networkOpportunities.map((opportunity, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{opportunity.title}</h4>
                        <Badge className={getImpactColor(opportunity.potentialImpact)}>
                          {opportunity.potentialImpact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex -space-x-2">
                          {opportunity.connections.slice(0, 3).map((connection, idx) => (
                            <Avatar key={idx} className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={connection.avatar} />
                              <AvatarFallback className="text-xs">
                                {connection.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">
                          {opportunity.connections.length} connection{opportunity.connections.length > 1 ? 's' : ''} involved
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{opportunity.successProbability}%</div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <Progress value={opportunity.successProbability} className="h-2" />
                  </div>
                  
                  <Button size="sm" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Activate Opportunity
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Strategy */}
      {activeView === 'growth' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              AI Growth Strategy
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Personalized recommendations to grow your professional network
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Network Optimization Plan
                </h4>
                <p className="text-sm text-purple-800 mb-3">
                  Your network is well-connected but could benefit from more senior-level connections
                  in your target companies. Focus on quality over quantity.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-lg font-bold text-purple-600">67%</div>
                    <div className="text-xs text-purple-700">Network Diversity</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">23%</div>
                    <div className="text-xs text-purple-700">Senior Level Contacts</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Week 1-2: Senior Leadership</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Connect with 5 senior leaders in your target companies. Focus on engineering directors and VPs.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Target: 5 connections</Badge>
                    <Badge className="bg-green-100 text-green-800">High Impact</Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Week 3-4: Industry Events</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Attend 2 tech meetups or conferences. AI identified optimal events based on your interests.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Target: 2 events</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Medium Impact</Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Ongoing: Engagement</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Maintain regular interaction with top 20 connections through meaningful comments and shares.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Target: 3 interactions/week</Badge>
                    <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                Start Growth Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};