
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Calendar, Users, BookOpen, ArrowRight, Plus } from 'lucide-react';
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
          <p className="text-gray-600">Plan and visualize your 5-year career journey</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/career-map/generate">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium">Generate Roadmap</h3>
                <p className="text-sm text-gray-600">AI-powered career path</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/career-map/skills-gap">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium">Skills Gap</h3>
                <p className="text-sm text-gray-600">Find missing skills</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/career-map/comparison">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <ArrowRight className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-medium">Compare Paths</h3>
                <p className="text-sm text-gray-600">Evaluate options</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/career-map/recommendations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium">Recommendations</h3>
                <p className="text-sm text-gray-600">Growth plans & mentors</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Career Goals Overview */}
        {careerGoals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No career goals yet</h3>
              <p className="text-gray-600 mb-4">Start planning your career journey</p>
              <Link to="/career-map/generate">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Career Map
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Career Goals</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {careerGoals.map((goal) => (
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
                            {goal.skills_needed.slice(0, 3).map((skill, index) => (
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
      </div>
    </div>
  );
};

export default CareerMap;
