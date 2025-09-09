import React from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Clock, BookOpen, Award, TrendingUp } from 'lucide-react';

const MyProgress = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'My Progress | TalentXcel Learning',
      description: 'Track your overall learning progress, achievements, and skill development.'
    });
  }, []);

  // Mock progress data
  const progressData = {
    overallStats: {
      coursesCompleted: 12,
      coursesInProgress: 3,
      totalHours: 84,
      currentStreak: 7,
      badges: 8,
      certificates: 5
    },
    skillProgress: [
      { skill: 'React', level: 85, category: 'Frontend' },
      { skill: 'JavaScript', level: 92, category: 'Programming' },
      { skill: 'Node.js', level: 70, category: 'Backend' },
      { skill: 'TypeScript', level: 78, category: 'Programming' },
      { skill: 'CSS', level: 88, category: 'Frontend' },
      { skill: 'Python', level: 65, category: 'Programming' }
    ],
    recentAchievements: [
      { title: 'React Master', date: '2024-01-15', type: 'skill' },
      { title: '30-Day Streak', date: '2024-01-10', type: 'streak' },
      { title: 'Course Completionist', date: '2024-01-05', type: 'course' }
    ],
    learningGoals: [
      { title: 'Complete 5 courses this month', progress: 80, target: 5, current: 4 },
      { title: 'Learn Python fundamentals', progress: 65, target: 100, current: 65 },
      { title: 'Earn 3 certificates', progress: 66, target: 3, current: 2 }
    ]
  };

  const stats = [
    {
      title: 'Courses Completed',
      value: progressData.overallStats.coursesCompleted,
      icon: Trophy,
      color: 'text-green-600'
    },
    {
      title: 'Learning Hours',
      value: progressData.overallStats.totalHours,
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Current Streak',
      value: `${progressData.overallStats.currentStreak} days`,
      icon: TrendingUp,
      color: 'text-orange-600'
    },
    {
      title: 'Certificates',
      value: progressData.overallStats.certificates,
      icon: Award,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Target className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
            <p className="text-gray-600">
              Track your learning journey and celebrate your achievements
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-50 rounded-full">
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Skills Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {progressData.skillProgress.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-medium">{skill.skill}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {skill.category}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Learning Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {progressData.learningGoals.map((goal, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{goal.title}</span>
                      <span className="text-sm text-gray-600">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{goal.progress}% complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {progressData.recentAchievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50"
                >
                  <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">{achievement.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProgress;