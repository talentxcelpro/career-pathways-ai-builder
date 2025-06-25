
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ChevronRight, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const LearningPaths = () => {
  const { data: learningPaths = [], isLoading } = useQuery({
    queryKey: ['learning_paths_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading learning paths...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Paths</h1>
          <p className="text-gray-600">Structured learning journeys to achieve your career goals</p>
        </div>

        {/* Featured Paths */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Paths</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningPaths.slice(0, 4).map((path) => (
              <Card key={path.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Learning Path
                    </Badge>
                    <Badge variant={path.difficulty_level === 'beginner' ? 'default' : 
                           path.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
                      {path.difficulty_level}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{path.title}</CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        <span>{path.target_role}</span>
                      </div>
                      <span>{path.estimated_duration_weeks} weeks</span>
                    </div>

                    {path.skills_gained && path.skills_gained.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Skills you'll gain:</p>
                        <div className="flex flex-wrap gap-1">
                          {path.skills_gained.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {path.skills_gained.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{path.skills_gained.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <Link to={`/learning/paths/${path.id}`}>
                      <Button className="w-full">
                        Explore Path
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Paths */}
        {learningPaths.length > 4 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Learning Paths</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningPaths.slice(4).map((path) => (
                <Card key={path.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={path.difficulty_level === 'beginner' ? 'default' : 
                             path.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
                        {path.difficulty_level}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          <span>{path.target_role}</span>
                        </div>
                      </div>

                      <Link to={`/learning/paths/${path.id}`}>
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {learningPaths.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No learning paths available</h3>
              <p className="text-gray-600">Check back soon for curated learning paths</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LearningPaths;
