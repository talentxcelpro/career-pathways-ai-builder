import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Circle, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Star,
  Award,
  Activity
} from 'lucide-react';
import { useAICareerMapping } from '@/hooks/useAICareerMapping';

interface ProgressTrackingDashboardProps {
  userId: string;
  roadmapId?: string;
}

const ProgressTrackingDashboard: React.FC<ProgressTrackingDashboardProps> = ({
  userId,
  roadmapId
}) => {
  const [progressData, setProgressData] = useState<any>(null);
  const { trackProgress, isTrackingProgress } = useAICareerMapping();

  useEffect(() => {
    if (userId) {
      handleGetProgressSummary();
    }
  }, [userId, roadmapId]);

  const handleGetProgressSummary = async () => {
    try {
      const result = await trackProgress.mutateAsync({
        userId,
        roadmapId,
        action: 'get_progress_summary'
      });
      setProgressData(result);
    } catch (error) {
      console.error('Failed to get progress summary:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await trackProgress.mutateAsync({
        userId,
        roadmapId,
        taskId,
        action: 'complete_task',
        completionData: {
          notes: 'Task completed via dashboard',
          rating: 5
        }
      });
      handleGetProgressSummary(); // Refresh data
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleUpdateSkillProgress = async (skillId: string, increment: number) => {
    try {
      await trackProgress.mutateAsync({
        userId,
        action: 'update_skill_progress',
        skillProgress: {
          skill_id: skillId,
          progress_increment: increment,
          evidence: 'Practice and learning',
          source: 'dashboard_update'
        }
      });
      handleGetProgressSummary(); // Refresh data
    } catch (error) {
      console.error('Failed to update skill progress:', error);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isTrackingProgress && !progressData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Progress Data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progressData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress Tracking
          </CardTitle>
          <CardDescription>
            Track your career development progress and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGetProgressSummary} className="w-full">
            Load Progress Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress Overview
          </CardTitle>
          <CardDescription>Your career development journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getProgressColor(progressData.progressPercentage || 0)}`}>
                {progressData.progressPercentage || 0}%
              </div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <Progress 
                value={progressData.progressPercentage || 0} 
                className="mt-2 h-2" 
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {progressData.completedTasks || 0}/{progressData.totalTasks || 0}
              </div>
              <p className="text-sm text-muted-foreground">Tasks Complete</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {progressData.completedPhases || 0}/{progressData.totalPhases || 0}
              </div>
              <p className="text-sm text-muted-foreground">Phases Complete</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {progressData.skillImprovements || 0}
              </div>
              <p className="text-sm text-muted-foreground">Skills Improved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="roadmap" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Roadmap Progress */}
        <TabsContent value="roadmap">
          <Card>
            <CardHeader>
              <CardTitle>Roadmap Progress</CardTitle>
              <CardDescription>
                Current phase: {progressData.currentPhase || 'Not started'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Started:</span>
                  <span className="text-sm">
                    {progressData.startDate ? new Date(progressData.startDate).toLocaleDateString() : 'Not started'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estimated Completion:</span>
                  <span className="text-sm">
                    {progressData.estimatedCompletion ? new Date(progressData.estimatedCompletion).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
                
                {/* Phase Progress Visualization */}
                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold">Phase Progress</h4>
                  {Array.from({ length: progressData.totalPhases || 0 }, (_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {i < (progressData.completedPhases || 0) ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-sm">Phase {i + 1}</span>
                      <div className="flex-1">
                        <Progress 
                          value={i < (progressData.completedPhases || 0) ? 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Progress */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills Development</CardTitle>
              <CardDescription>Track your skill improvements over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock skills data - in real implementation, this would come from the API */}
                {[
                  { name: 'JavaScript', current: 7, target: 9, category: 'Technical' },
                  { name: 'React', current: 6, target: 8, category: 'Technical' },
                  { name: 'Communication', current: 5, target: 8, category: 'Soft Skills' },
                  { name: 'Leadership', current: 4, target: 7, category: 'Soft Skills' }
                ].map((skill, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{skill.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {skill.category}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateSkillProgress(skill.name, 0.5)}
                        disabled={isTrackingProgress}
                      >
                        +0.5
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current: {skill.current}/10</span>
                        <span>Target: {skill.target}/10</span>
                      </div>
                      <Progress value={(skill.current / 10) * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {skill.target - skill.current} levels to target
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements & Milestones
              </CardTitle>
              <CardDescription>Celebrate your accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.newAchievements?.map((achievement: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant="default" className="ml-auto">
                        <Star className="w-3 h-3 mr-1" />
                        New!
                      </Badge>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Complete more tasks to unlock achievements!
                    </p>
                  </div>
                )}
                
                {/* Standard milestones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">First Week</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete your first week of learning
                    </p>
                    <Progress value={Math.min((progressData.completedTasks || 0) / 5 * 100, 100)} className="mt-2 h-2" />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Skill Builder</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Improve 3 different skills
                    </p>
                    <Progress value={Math.min((progressData.skillImprovements || 0) / 3 * 100, 100)} className="mt-2 h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Progress Analytics
              </CardTitle>
              <CardDescription>Detailed insights into your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Weekly Stats */}
                <div>
                  <h4 className="font-semibold mb-3">Weekly Performance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {progressData?.progressStats?.totalActivities || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Activities</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {progressData?.progressStats?.averageActivityPerDay || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Daily Average</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {progressData?.progressStats?.skillVelocity || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Skill Velocity</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round((progressData.progressPercentage || 0) / 7) || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">Weekly Growth</p>
                    </div>
                  </div>
                </div>

                {/* Progress Trend */}
                <div>
                  <h4 className="font-semibold mb-3">Progress Trend</h4>
                  <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Progress chart visualization</p>
                  </div>
                </div>

                {/* Time Investment */}
                <div>
                  <h4 className="font-semibold mb-3">Time Investment</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Week</span>
                      <Badge variant="outline">12.5 hours</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average per Day</span>
                      <Badge variant="outline">1.8 hours</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Learning Time</span>
                      <Badge variant="default">45.2 hours</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressTrackingDashboard;