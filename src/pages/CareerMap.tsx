
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Map, Target, TrendingUp, Clock, Star, ArrowRight, 
  Brain, Zap, Users, BookOpen, Award, BarChart3, Plus
} from 'lucide-react';

const CareerMap = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user's roadmaps
  const { data: roadmaps = [], isLoading } = useQuery({
    queryKey: ['user-roadmaps'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: careerGoals = [] } = useQuery({
    queryKey: ['career-goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('career_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    }
  });

  const quickActions = [
    {
      title: 'AI Roadmap Builder',
      description: 'Create personalized career roadmap with AI',
      icon: Brain,
      path: '/career-map/ai-roadmap-builder',
      color: 'from-blue-500 to-purple-500',
      featured: true
    },
    {
      title: 'Skills Gap Analysis',
      description: 'Identify skills you need to develop',
      icon: BarChart3,
      path: '/career-map/skills-gap',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Career Switch Evaluator',
      description: 'Analyze potential career transitions',
      icon: TrendingUp,
      path: '/career-map/switch',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Comparison Tool',
      description: 'Compare different career paths',
      icon: Target,
      path: '/career-map/comparison',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const milestoneTypes = {
    skill: { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    certification: { icon: Award, color: 'text-green-600', bg: 'bg-green-100' },
    experience: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    education: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' }
  };

  const careerInsights = [
    {
      title: 'Market Demand',
      value: '92%',
      description: 'High demand for your target role',
      trend: 'up',
      color: 'text-green-600'
    },
    {
      title: 'Skill Match',
      value: '78%',
      description: 'Current skills alignment',
      trend: 'up',
      color: 'text-blue-600'
    },
    {
      title: 'Time to Goal',
      value: '8 months',
      description: 'Estimated timeline',
      trend: 'neutral',
      color: 'text-orange-600'
    },
    {
      title: 'Salary Potential',
      value: '+35%',
      description: 'Expected increase',
      trend: 'up',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Career Map</h1>
                <p className="text-blue-100 text-lg">Navigate your path to success with AI-powered guidance</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => navigate('/career-map/generate')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Roadmap
                </Button>
                <Button variant="secondary" onClick={() => navigate('/career-map/ai-roadmap-builder')}>
                  <Brain className="h-4 w-4 mr-2" />
                  AI Builder
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Career Insights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {careerInsights.map((insight, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${insight.color} mb-1`}>
                    {insight.value}
                  </div>
                  <div className="font-medium text-gray-900 mb-1">
                    {insight.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {insight.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Career Planning Tools
            </CardTitle>
            <CardDescription>Powerful AI-driven tools to plan and optimize your career journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${action.featured ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    {action.featured && (
                      <Badge className="bg-blue-100 text-blue-700">Recommended</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Roadmaps */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Map className="h-5 w-5 mr-2 text-blue-600" />
                    My Roadmaps
                  </CardTitle>
                  <CardDescription>Your personalized career roadmaps</CardDescription>
                </div>
                <Button asChild variant="outline">
                  <Link to="/career-map/my-roadmaps">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : roadmaps.length > 0 ? (
                <div className="space-y-6">
                  {roadmaps.slice(0, 3).map((roadmap: any) => (
                    <Card key={roadmap.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/career-map/${roadmap.id}`)}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{roadmap.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{roadmap.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {roadmap.target_role}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {roadmap.timeline_months} months
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              {roadmap.progress_percentage}%
                            </div>
                            <Badge variant={roadmap.status === 'active' ? 'default' : 'secondary'}>
                              {roadmap.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{roadmap.progress_percentage}%</span>
                            </div>
                            <Progress value={roadmap.progress_percentage} className="h-2" />
                          </div>
                          
                          {roadmap.milestones && Array.isArray(roadmap.milestones) && roadmap.milestones.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Next Milestones:</p>
                              <div className="flex flex-wrap gap-2">
                                {roadmap.milestones.slice(0, 3).map((milestone: any, index: number) => {
                                  const type = milestoneTypes[milestone.type as keyof typeof milestoneTypes] || milestoneTypes.skill;
                                  return (
                                    <div key={index} className={`flex items-center gap-1 px-2 py-1 rounded-md ${type.bg}`}>
                                      <type.icon className={`h-3 w-3 ${type.color}`} />
                                      <span className="text-xs font-medium">{milestone.title}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Map className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No roadmaps yet</h3>
                  <p className="text-gray-600 mb-4">Create your first career roadmap to get started</p>
                  <div className="space-y-2">
                    <Button onClick={() => navigate('/career-map/ai-roadmap-builder')}>
                      <Brain className="h-4 w-4 mr-2" />
                      Create with AI
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/career-map/generate')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Manual Creation
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Career Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Career Goals
              </CardTitle>
              <CardDescription>Track your career objectives</CardDescription>
            </CardHeader>
            <CardContent>
              {careerGoals.length > 0 ? (
                <div className="space-y-4">
                  {careerGoals.slice(0, 3).map((goal: any) => (
                    <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">{goal.target_role}</h4>
                      <p className="text-sm text-gray-600 mb-2">{goal.target_company}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Timeline: {goal.timeline_months} months</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Goals
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No career goals set</p>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Set Goals
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                Recommended Learning
              </CardTitle>
              <CardDescription>Courses to advance your career</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm">Advanced Leadership Skills</h4>
                  <p className="text-xs text-gray-600">Essential for senior roles</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm">Data-Driven Decision Making</h4>
                  <p className="text-xs text-gray-600">High-demand skill</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm">Strategic Planning</h4>
                  <p className="text-xs text-gray-600">Career advancement essential</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/learning')}>
                Explore Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                Market Insights
              </CardTitle>
              <CardDescription>Industry trends and opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">AI/ML Skills</span>
                  <Badge className="bg-green-100 text-green-700">Hot</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Cloud Architecture</span>
                  <Badge className="bg-blue-100 text-blue-700">Growing</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Product Management</span>
                  <Badge className="bg-purple-100 text-purple-700">Stable</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/tools/market-insights')}>
                View Market Data
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CareerMap;
