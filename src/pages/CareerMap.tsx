
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Calendar, Users, BookOpen, ArrowRight, Plus, Brain, Map, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CareerMap = () => {
  const { data: careerGoals = [], isLoading } = useQuery({
    queryKey: ['career_goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('career_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: roadmaps = [] } = useQuery({
    queryKey: ['roadmaps_overview'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading your career map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Map</h1>
          <p className="text-gray-600">Plan and visualize your career journey with AI-powered guidance</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/career-map/ai-roadmap-builder">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium">AI Roadmap Builder</h3>
                <p className="text-sm text-gray-600">Create personalized roadmaps</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/career-map/my-roadmaps">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Map className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium">My Roadmaps</h3>
                <p className="text-sm text-gray-600">View all your roadmaps</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/career-map/switch">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-medium">Career Switch</h3>
                <p className="text-sm text-gray-600">Evaluate career changes</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/career-map/skills-gap">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium">Skills Gap</h3>
                <p className="text-sm text-gray-600">Find missing skills</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Active Roadmaps Overview */}
        {roadmaps.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Roadmaps</CardTitle>
                <CardDescription>Your current career development plans</CardDescription>
              </div>
              <Link to="/career-map/my-roadmaps">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {roadmaps.slice(0, 3).map((roadmap: any) => (
                  <div key={roadmap.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-sm">{roadmap.title}</h4>
                      {roadmap.ai_generated && (
                        <Badge variant="outline" className="text-xs">AI</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{roadmap.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">Progress</span>
                        <span className="text-xs text-gray-600">{roadmap.progress_percentage}%</span>
                      </div>
                      <Progress value={roadmap.progress_percentage} className="h-1" />
                    </div>
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                      <span>{roadmap.timeline_months} months</span>
                      <Link to={`/career-map/${roadmap.id}`}>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          View <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legacy Career Goals */}
        {careerGoals.length === 0 && roadmaps.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Career Journey</h3>
              <p className="text-gray-600 mb-6">Create your first AI-powered career roadmap and start tracking your professional growth</p>
              <div className="flex justify-center space-x-4">
                <Link to="/career-map/ai-roadmap-builder">
                  <Button>
                    <Brain className="h-4 w-4 mr-2" />
                    Create AI Roadmap
                  </Button>
                </Link>
                <Link to="/career-map/switch">
                  <Button variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    Evaluate Career Switch
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : careerGoals.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Legacy Career Goals</h2>
              <Link to="/career-map/ai-roadmap-builder">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Roadmap
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {careerGoals.map((goal: any) => (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{goal.target_role}</CardTitle>
                        <CardDescription>
                          {goal.target_company && `at ${goal.target_company}`}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {goal.timeline_months} months
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {goal.skills_needed && goal.skills_needed.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Skills needed:</p>
                          <div className="flex flex-wrap gap-1">
                            {goal.skills_needed.slice(0, 3).map((skill: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {goal.skills_needed.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{goal.skills_needed.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {goal.progress_notes && (
                        <div>
                          <p className="text-sm font-medium mb-1">Progress Notes:</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{goal.progress_notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link to={`/career-map/${goal.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        <Link to="/career-map/skills-gap">
                          <Button>
                            <BookOpen className="h-4 w-4 mr-1" />
                            Skills Gap
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Additional Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Learning & Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/career-map/skills-gap" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Skills Gap Analysis
                  </Button>
                </Link>
                <Link to="/career-map/recommendations" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Get Recommendations
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Career Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/career-map/comparison" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Compare Career Paths
                  </Button>
                </Link>
                <Link to="/career-map/generate" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Traditional Generator
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CareerMap;
