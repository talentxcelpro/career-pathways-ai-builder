
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, BookOpen, TrendingUp, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const SkillsGap = () => {
  const [selectedRole, setSelectedRole] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Mock data for skills gap analysis
  const mockSkillsAnalysis = {
    targetRole: 'Senior Software Engineer',
    currentSkills: ['JavaScript', 'React', 'Node.js', 'HTML/CSS', 'Git'],
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'System Design'],
    missingSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes', 'System Design'],
    strongSkills: ['JavaScript', 'React', 'Node.js'],
    skillProficiency: {
      'JavaScript': 85,
      'React': 80,
      'Node.js': 75,
      'HTML/CSS': 90,
      'Git': 70,
      'TypeScript': 0,
      'AWS': 0,
      'Docker': 0,
      'Kubernetes': 0,
      'System Design': 0
    }
  };

  const getSkillColor = (proficiency: number) => {
    if (proficiency >= 80) return 'text-green-600';
    if (proficiency >= 60) return 'text-yellow-600';
    if (proficiency >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (proficiency: number) => {
    if (proficiency >= 80) return 'bg-green-500';
    if (proficiency >= 60) return 'bg-yellow-500';
    if (proficiency >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/career-map" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Career Map
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills Gap Analysis</h1>
          <p className="text-gray-600">Identify missing skills and get personalized learning recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skills Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current vs Required Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Skills Assessment
                </CardTitle>
                <CardDescription>
                  Analysis for {mockSkillsAnalysis.targetRole}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Have Skills */}
                  <div>
                    <h4 className="font-medium text-green-600 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Skills You Have ({mockSkillsAnalysis.currentSkills.length})
                    </h4>
                    <div className="space-y-2">
                      {mockSkillsAnalysis.currentSkills.map((skill) => (
                        <div key={skill} className="flex items-center justify-between">
                          <span className="text-sm">{skill}</span>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={mockSkillsAnalysis.skillProficiency[skill]} 
                              className="w-16 h-2"
                            />
                            <span className={`text-xs font-medium ${getSkillColor(mockSkillsAnalysis.skillProficiency[skill])}`}>
                              {mockSkillsAnalysis.skillProficiency[skill]}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <h4 className="font-medium text-red-600 mb-3 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Skills Gap ({mockSkillsAnalysis.missingSkills.length})
                    </h4>
                    <div className="space-y-2">
                      {mockSkillsAnalysis.missingSkills.map((skill) => (
                        <div key={skill} className="flex items-center justify-between">
                          <span className="text-sm">{skill}</span>
                          <Badge variant="destructive" className="text-xs">
                            Missing
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Learning Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized courses to bridge your skills gap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSkillsAnalysis.missingSkills.slice(0, 3).map((skill, index) => (
                    <div key={skill} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">{skill} Fundamentals</h5>
                        <Badge variant="outline">Beginner</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Master {skill} with hands-on projects and real-world examples
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>12 hours</span>
                          <span>4.8 ⭐</span>
                          <span>Free</span>
                        </div>
                        <div className="flex space-x-2">
                          <Link to="/learning">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Course
                            </Button>
                          </Link>
                          <Button size="sm">Enroll</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Progress Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">62%</div>
                    <p className="text-sm text-gray-600">Skills Match</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-semibold text-green-600">5</div>
                      <p className="text-xs text-gray-600">Skills Ready</p>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-red-600">5</div>
                      <p className="text-xs text-gray-600">Skills Needed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/learning/my-courses" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    My Learning
                  </Button>
                </Link>
                
                <Link to="/career-map/generate" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Update Career Goals
                  </Button>
                </Link>
                
                <Link to="/profile/edit" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Update Skills
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsGap;
