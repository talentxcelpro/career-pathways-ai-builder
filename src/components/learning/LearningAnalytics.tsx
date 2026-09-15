
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  Calendar,
  BookOpen
} from 'lucide-react';

interface LearningAnalyticsProps {
  userCourses: any[];
}

export const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({ userCourses }) => {
  const totalCourses = userCourses.length;
  const completedCourses = userCourses.filter(uc => uc.progress_percentage === 100);
  const inProgressCourses = userCourses.filter(uc => uc.progress_percentage > 0 && uc.progress_percentage < 100);
  
  const totalHours = userCourses.reduce((sum, uc) => sum + (uc.courses?.duration_hours || 0), 0);
  const completedHours = completedCourses.reduce((sum, uc) => sum + (uc.courses?.duration_hours || 0), 0);
  
  const averageProgress = totalCourses > 0 
    ? Math.round(userCourses.reduce((sum, uc) => sum + uc.progress_percentage, 0) / totalCourses)
    : 0;

  const skillsLearned = [...new Set(completedCourses.flatMap(uc => uc.courses?.skills_taught || []))];
  
  const weeklyGoal = 5; // hours per week
  const currentWeekProgress = 3; // mock data - hours completed this week

  const getLearningStreak = () => {
    // Mock calculation - in real app, calculate based on daily activity
    return 7; // days
  };

  if (totalCourses === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Learning Journey</h3>
          <p className="text-gray-600 text-center">
            Enroll in courses to see your learning analytics and track your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCourses.length}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hours Learned</p>
                <p className="text-2xl font-bold text-purple-600">{completedHours}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Learning Streak</p>
                <p className="text-2xl font-bold text-orange-600">{getLearningStreak()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Average Course Progress</span>
                  <span>{averageProgress}%</span>
                </div>
                <Progress value={averageProgress} />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{inProgressCourses.length}</p>
                  <p className="text-xs text-gray-600">In Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{completedCourses.length}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{totalCourses - inProgressCourses.length - completedCourses.length}</p>
                  <p className="text-xs text-gray-600">Not Started</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>This Week's Progress</span>
                  <span>{currentWeekProgress} / {weeklyGoal} hours</span>
                </div>
                <Progress value={(currentWeekProgress / weeklyGoal) * 100} />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {weeklyGoal - currentWeekProgress > 0 
                    ? `${weeklyGoal - currentWeekProgress} hours left to reach your weekly goal`
                    : "🎉 Weekly goal achieved!"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Mastered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skillsLearned.length > 0 ? (
              skillsLearned.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  <Award className="h-3 w-3 mr-1" />
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-gray-600">Complete courses to unlock skill badges!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
