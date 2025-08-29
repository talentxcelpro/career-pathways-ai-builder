import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Trophy, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Star,
  Zap,
  Calendar,
  Award,
  CheckCircle,
  Circle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface CareerProgressData {
  currentLevel: string;
  skillsGained: number;
  connectionsGrown: number;
  articlesPublished: number;
  completionScore: number;
}

interface InteractiveProgressTrackerProps {
  data: CareerProgressData;
}

export const InteractiveProgressTracker = ({ data }: InteractiveProgressTrackerProps) => {
  const [selectedGoal, setSelectedGoal] = useState('skill-development');
  const [trackingMode, setTrackingMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Mock progress data for different time periods
  const progressHistory = {
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      score: Math.floor(Math.random() * 100) + 1,
      activities: Math.floor(Math.random() * 5) + 1
    })).reverse(),
    weekly: Array.from({ length: 12 }, (_, i) => ({
      date: `Week ${12 - i}`,
      score: Math.floor(Math.random() * 100) + 1,
      activities: Math.floor(Math.random() * 20) + 5
    })),
    monthly: Array.from({ length: 6 }, (_, i) => ({
      date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
      score: Math.floor(Math.random() * 100) + 1,
      activities: Math.floor(Math.random() * 50) + 10
    })).reverse()
  };

  const careerGoals = [
    {
      id: 'skill-development',
      title: 'Skill Development',
      description: 'Expand your technical expertise',
      progress: 75,
      target: 100,
      icon: Star,
      color: 'text-purple-600 bg-purple-100',
      milestones: [
        { task: 'Complete AI/ML Course', completed: true, points: 25 },
        { task: 'Get AWS Certification', completed: true, points: 30 },
        { task: 'Master React Advanced Patterns', completed: false, points: 20 },
        { task: 'Learn GraphQL & APIs', completed: false, points: 25 }
      ]
    },
    {
      id: 'network-growth',
      title: 'Network Expansion',
      description: 'Build meaningful professional connections',
      progress: 60,
      target: 100,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      milestones: [
        { task: 'Connect with 50 Industry Peers', completed: true, points: 30 },
        { task: 'Attend 3 Networking Events', completed: true, points: 15 },
        { task: 'Join 2 Professional Groups', completed: false, points: 15 },
        { task: 'Find 3 Mentors', completed: false, points: 25 },
        { task: 'Mentor 2 Junior Professionals', completed: false, points: 15 }
      ]
    },
    {
      id: 'thought-leadership',
      title: 'Thought Leadership',
      description: 'Establish expertise through content',
      progress: 45,
      target: 100,
      icon: BookOpen,
      color: 'text-green-600 bg-green-100',
      milestones: [
        { task: 'Publish 5 Technical Articles', completed: true, points: 25 },
        { task: 'Speak at Industry Conference', completed: false, points: 30 },
        { task: 'Start a Tech Podcast', completed: false, points: 25 },
        { task: 'Build Personal Brand', completed: false, points: 20 }
      ]
    },
    {
      id: 'career-advancement',
      title: 'Career Advancement',
      description: 'Progress to the next career level',
      progress: 68,
      target: 100,
      icon: Trophy,
      color: 'text-orange-600 bg-orange-100',
      milestones: [
        { task: 'Lead Cross-functional Project', completed: true, points: 30 },
        { task: 'Manage Team of 3+ People', completed: true, points: 25 },
        { task: 'Drive Strategic Initiative', completed: false, points: 25 },
        { task: 'Achieve Performance Goals', completed: false, points: 20 }
      ]
    }
  ];

  const selectedGoalData = careerGoals.find(goal => goal.id === selectedGoal);
  const currentProgress = progressHistory[trackingMode];

  const LevelBadge = ({ level }: { level: string }) => {
    const getLevelColor = (level: string) => {
      switch (level.toLowerCase()) {
        case 'expert':
          return 'text-purple-700 bg-purple-100 border-purple-300';
        case 'professional':
          return 'text-blue-700 bg-blue-100 border-blue-300';
        case 'intermediate':
          return 'text-green-700 bg-green-100 border-green-300';
        default:
          return 'text-gray-700 bg-gray-100 border-gray-300';
      }
    };

    return (
      <Badge className={`${getLevelColor(level)} border px-3 py-1`}>
        <Trophy className="h-3 w-3 mr-1" />
        {level}
      </Badge>
    );
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend, 
    subtitle 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string; 
    trend?: string; 
    subtitle?: string; 
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Current Level */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                Career Progress Tracker
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Track your professional growth and achieve your career goals
              </p>
            </div>
            <LevelBadge level={data.currentLevel} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-lg font-bold text-blue-600">{data.completionScore}%</span>
            </div>
            <Progress value={data.completionScore} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <Star className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <p className="text-sm font-medium">Skills</p>
                <p className="text-xl font-bold text-purple-600">{data.skillsGained}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-medium">Connections</p>
                <p className="text-xl font-bold text-blue-600">{data.connectionsGrown}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <BookOpen className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-medium">Articles</p>
                <p className="text-xl font-bold text-green-600">{data.articlesPublished}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <Trophy className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <p className="text-sm font-medium">Achievements</p>
                <p className="text-xl font-bold text-orange-600">8</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">Career Goals</TabsTrigger>
          <TabsTrigger value="progress">Progress Timeline</TabsTrigger>
          <TabsTrigger value="insights">Growth Insights</TabsTrigger>
        </TabsList>

        {/* Career Goals */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {careerGoals.map((goal) => (
              <Card 
                key={goal.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedGoal === goal.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedGoal(goal.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${goal.color}`}>
                      <goal.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{goal.title}</h3>
                      <p className="text-xs text-muted-foreground">{goal.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Goal Details */}
          {selectedGoalData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <selectedGoalData.icon className="h-5 w-5" />
                  {selectedGoalData.title} - Detailed Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Overall Progress</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedGoalData.progress}/{selectedGoalData.target}%
                    </span>
                  </div>
                  <Progress value={selectedGoalData.progress} className="h-3" />
                  
                  <div className="space-y-3 mt-6">
                    <h4 className="font-medium">Milestones</h4>
                    {selectedGoalData.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        {milestone.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div className="flex-1">
                          <p className={`font-medium ${milestone.completed ? 'text-green-700' : ''}`}>
                            {milestone.task}
                          </p>
                        </div>
                        <Badge variant={milestone.completed ? 'default' : 'secondary'}>
                          {milestone.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Progress Timeline */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Progress Timeline
                </CardTitle>
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={trackingMode === mode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTrackingMode(mode)}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentProgress.map((period, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30">
                    <div className="w-16 text-sm text-muted-foreground">
                      {period.date}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Score: {period.score}%</span>
                        <span>{period.activities} activities</span>
                      </div>
                      <Progress value={period.score} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900">Complete AWS Certification</h4>
                    <p className="text-sm text-green-700">+25 progress points, High impact</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900">Connect with 10 Industry Leaders</h4>
                    <p className="text-sm text-blue-700">+15 progress points, Medium impact</p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900">Publish Technical Article</h4>
                    <p className="text-sm text-purple-700">+20 progress points, Medium impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Focus on Leadership Skills</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on your progress, developing leadership capabilities will accelerate your career advancement.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Expand Technical Writing</h4>
                    <p className="text-sm text-muted-foreground">
                      Your articles perform well. Consider starting a technical blog or newsletter.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Join Advisory Roles</h4>
                    <p className="text-sm text-muted-foreground">
                      Your expertise level suggests you're ready for advisory or mentorship roles.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};