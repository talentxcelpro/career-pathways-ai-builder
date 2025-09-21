import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Target, Users, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

interface LearningPathStep {
  id: string;
  title: string;
  type: 'course' | 'assessment' | 'project' | 'interview';
  status: 'not_started' | 'in_progress' | 'completed';
  estimatedHours: number;
  completionRate?: number;
}

interface PipelineData {
  userId: string;
  currentStage: 'learning' | 'assessment' | 'matching' | 'interview' | 'placed';
  matchScore: number;
  skillsGap: string[];
  recommendedCourses: LearningPathStep[];
  jobMatches: any[];
  progress: {
    learning: number;
    assessment: number;
    placement: number;
  };
}

export const LearningJobPipelineDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Fetch user's pipeline data
  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ['pipeline-dashboard'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Mock data for now - replace with actual queries
      const mockData: PipelineData = {
        userId: user.id,
        currentStage: 'learning',
        matchScore: 75,
        skillsGap: ['React.js', 'Node.js', 'TypeScript'],
        recommendedCourses: [
          {
            id: '1',
            title: 'Complete React Developer Course',
            type: 'course',
            status: 'in_progress',
            estimatedHours: 40,
            completionRate: 65
          },
          {
            id: '2',
            title: 'JavaScript Skills Assessment',
            type: 'assessment',
            status: 'not_started',
            estimatedHours: 2
          },
          {
            id: '3',
            title: 'Portfolio Project: E-commerce App',
            type: 'project',
            status: 'not_started',
            estimatedHours: 20
          }
        ],
        jobMatches: [
          {
            id: '1',
            title: 'Frontend Developer',
            company: 'TechCorp',
            matchScore: 85,
            salaryRange: '₹8-12 LPA'
          },
          {
            id: '2',
            title: 'React Developer',
            company: 'StartupXYZ',
            matchScore: 78,
            salaryRange: '₹6-10 LPA'
          }
        ],
        progress: {
          learning: 65,
          assessment: 30,
          placement: 0
        }
      };

      return mockData;
    }
  });

  const enrollInCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Mock enrollment - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Successfully enrolled in course!');
      queryClient.invalidateQueries({ queryKey: ['pipeline-dashboard'] });
    },
    onError: (error) => {
      toast.error('Failed to enroll: ' + error.message);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!pipelineData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Pipeline Not Found</h3>
        <p className="text-muted-foreground">Complete your profile to start your learning journey.</p>
      </div>
    );
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'learning': return <BookOpen className="h-5 w-5" />;
      case 'assessment': return <Target className="h-5 w-5" />;
      case 'matching': return <Users className="h-5 w-5" />;
      case 'interview': return <Clock className="h-5 w-5" />;
      case 'placed': return <CheckCircle className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'not_started': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning + Job Pipeline</h1>
          <p className="text-muted-foreground">Track your progress from learning to placement</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {getStageIcon(pipelineData.currentStage)}
          <span className="ml-2 capitalize">{pipelineData.currentStage}</span>
        </Badge>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineData.progress.learning}%</div>
            <Progress value={pipelineData.progress.learning} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Courses & Skills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessment Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineData.progress.assessment}%</div>
            <Progress value={pipelineData.progress.assessment} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Skills Verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Match Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineData.matchScore}%</div>
            <Progress value={pipelineData.matchScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Market Readiness</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learning">Learning Path</TabsTrigger>
          <TabsTrigger value="jobs">Job Matches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Skills Gap */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Focus on these skills to improve your job match score:
                </p>
                <div className="flex flex-wrap gap-2">
                  {pipelineData.skillsGap.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Learning Path */}
          <Card>
            <CardHeader>
              <CardTitle>Current Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineData.recommendedCourses.slice(0, 3).map((step) => (
                  <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(step.status)}`} />
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {step.estimatedHours}h • {step.type}
                        </p>
                      </div>
                    </div>
                    {step.status === 'in_progress' && step.completionRate && (
                      <div className="text-right">
                        <span className="text-sm font-medium">{step.completionRate}%</span>
                        <Progress value={step.completionRate} className="w-20 mt-1" />
                      </div>
                    )}
                    {step.status === 'not_started' && (
                      <Button
                        size="sm"
                        onClick={() => enrollInCourseMutation.mutate(step.id)}
                        disabled={enrollInCourseMutation.isPending}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineData.recommendedCourses.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getStatusColor(step.status)}`}>
                        {index + 1}
                      </div>
                      {index < pipelineData.recommendedCourses.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {step.estimatedHours} hours • {step.type}
                      </p>
                      {step.status === 'in_progress' && step.completionRate && (
                        <div className="mt-2">
                          <Progress value={step.completionRate} />
                          <span className="text-xs text-muted-foreground">{step.completionRate}% complete</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={step.status === 'completed' ? 'default' : 'outline'}>
                        {step.status.replace('_', ' ')}
                      </Badge>
                      {step.status === 'not_started' && (
                        <Button
                          size="sm"
                          onClick={() => enrollInCourseMutation.mutate(step.id)}
                          disabled={enrollInCourseMutation.isPending}
                        >
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matched Job Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineData.jobMatches.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <p className="text-sm font-medium text-green-600">{job.salaryRange}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{job.matchScore}% match</Badge>
                      <Button size="sm" className="mt-2 w-full">
                        Apply Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and insights will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};