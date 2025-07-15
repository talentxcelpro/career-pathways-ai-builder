import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Target, BookOpen, TrendingUp, MapPin, Clock, Star, Users, Briefcase, GraduationCap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface CareerInsight {
  id: string;
  type: 'job_recommendation' | 'skill_gap' | 'learning_path' | 'career_move' | 'salary_insight';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  actionItems: string[];
  estimatedImpact: string;
  timeframe: string;
  metadata?: any;
}

interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  salaryRange: string;
  reasons: string[];
  skills: string[];
  postedDate: string;
  remote: boolean;
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  importance: 'critical' | 'high' | 'medium';
  courses: Array<{
    title: string;
    provider: string;
    duration: string;
    price: string;
  }>;
}

const AICareerCoPilot: React.FC = () => {
  const [activeInsights, setActiveInsights] = useState<CareerInsight[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const { toast } = useToast();

  // Fetch user profile and career data
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-ai'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile;
    }
  });

  // Fetch job recommendations with AI matching
  const { data: jobRecommendations, isLoading: loadingJobs } = useQuery({
    queryKey: ['ai-job-recommendations', userProfile?.id],
    queryFn: async () => {
      if (!userProfile) return [];

      // Mock AI-powered job recommendations
      const mockRecommendations: JobRecommendation[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          matchScore: 92,
          salaryRange: '$120k - $180k',
          reasons: ['Perfect skill match', 'Company culture fit', 'Career progression opportunity'],
          skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
          postedDate: '2 days ago',
          remote: true
        },
        {
          id: '2',
          title: 'Full Stack Developer',
          company: 'StartupXYZ',
          location: 'Remote',
          matchScore: 87,
          salaryRange: '$90k - $140k',
          reasons: ['Startup experience valued', 'Tech stack alignment', 'Growth opportunity'],
          skills: ['JavaScript', 'Python', 'Docker', 'GraphQL'],
          postedDate: '1 week ago',
          remote: true
        }
      ];

      return mockRecommendations;
    },
    enabled: !!userProfile
  });

  // Generate AI career insights
  const generateCareerInsights = async () => {
    if (!userProfile) return;

    setIsGeneratingInsights(true);
    try {
      // Mock AI insight generation - in real implementation, this would call an AI service
      const mockInsights: CareerInsight[] = [
        {
          id: '1',
          type: 'skill_gap',
          title: 'Critical Skill Gap Identified',
          description: 'Your profile shows strong React skills, but adding TypeScript would increase job opportunities by 40%',
          priority: 'high',
          confidence: 89,
          actionItems: [
            'Complete TypeScript fundamentals course',
            'Build a project using TypeScript',
            'Add TypeScript certification to profile'
          ],
          estimatedImpact: '40% more job opportunities',
          timeframe: '2-3 months'
        },
        {
          id: '2',
          type: 'career_move',
          title: 'Optimal Career Progression',
          description: 'Based on market analysis, transitioning to Tech Lead role is highly recommended',
          priority: 'medium',
          confidence: 76,
          actionItems: [
            'Develop leadership experience',
            'Mentor junior developers',
            'Learn system architecture'
          ],
          estimatedImpact: '25-30% salary increase',
          timeframe: '6-12 months'
        },
        {
          id: '3',
          type: 'learning_path',
          title: 'Personalized Learning Roadmap',
          description: 'AI-curated learning path to achieve your career goals faster',
          priority: 'medium',
          confidence: 82,
          actionItems: [
            'Complete cloud computing certification',
            'Learn microservices architecture',
            'Study DevOps practices'
          ],
          estimatedImpact: 'Enhanced technical expertise',
          timeframe: '4-6 months'
        }
      ];

      setActiveInsights(mockInsights);
      toast({
        title: "AI Insights Generated",
        description: "Your personalized career insights are ready!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate career insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Auto-generate insights on component mount
  useEffect(() => {
    if (userProfile && activeInsights.length === 0) {
      generateCareerInsights();
    }
  }, [userProfile]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job_recommendation': return <Briefcase className="h-4 w-4" />;
      case 'skill_gap': return <Target className="h-4 w-4" />;
      case 'learning_path': return <BookOpen className="h-4 w-4" />;
      case 'career_move': return <TrendingUp className="h-4 w-4" />;
      case 'salary_insight': return <Star className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Career Co-Pilot</h1>
          <p className="text-lg text-gray-600 mt-2">
            Your personal AI assistant for career growth and opportunities
          </p>
        </div>
        <Button 
          onClick={generateCareerInsights}
          disabled={isGeneratingInsights}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {isGeneratingInsights ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Refresh Insights
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="jobs">Job Matches</TabsTrigger>
          <TabsTrigger value="roadmap">Career Roadmap</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {activeInsights.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI Analysis in Progress
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  Our AI is analyzing your profile, market trends, and career opportunities to provide personalized insights.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeInsights.map((insight) => (
                <Card key={insight.id} className="relative overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTypeIcon(insight.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getPriorityColor(insight.priority)}>
                              {insight.priority} priority
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {insight.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {insight.estimatedImpact}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {insight.timeframe}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Recommended Actions:</h4>
                        <ul className="space-y-1">
                          {insight.actionItems.map((action, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <Progress value={insight.confidence} className="w-full" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Confidence Score</span>
                          <span>{insight.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Job Matches Tab */}
        <TabsContent value="jobs" className="space-y-4">
          {loadingJobs ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {jobRecommendations?.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </span>
                          {job.remote && (
                            <Badge variant="secondary">Remote</Badge>
                          )}
                          <span>{job.postedDate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {job.matchScore}% Match
                        </div>
                        <div className="text-sm text-gray-600">{job.salaryRange}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Why this matches you:</h4>
                        <ul className="space-y-1">
                          {job.reasons.map((reason, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <Star className="h-3 w-3 mr-2 text-yellow-500" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill) => (
                            <Badge key={skill} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t flex justify-between items-center">
                        <Progress value={job.matchScore} className="flex-1 mr-4" />
                        <Button size="sm">Apply Now</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Career Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-4">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              AI-powered career roadmap feature coming soon! This will provide step-by-step guidance 
              to achieve your career goals with timeline and milestone tracking.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AICareerCoPilot;