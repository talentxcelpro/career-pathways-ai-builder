
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, BookOpen, Clock, Award } from 'lucide-react';

interface UserCourse {
  id: string;
  course_id: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string;
  courses: {
    title: string;
    duration_hours: number;
    skills_taught: string[];
  };
}

interface LearningProgressProps {
  userCourses: UserCourse[];
}

export const LearningProgress: React.FC<LearningProgressProps> = ({ userCourses }) => {
  const completedCourses = userCourses.filter(uc => uc.progress_percentage === 100);
  const inProgressCourses = userCourses.filter(uc => uc.progress_percentage > 0 && uc.progress_percentage < 100);
  const totalHoursLearned = completedCourses.reduce((total, uc) => total + (uc.courses.duration_hours || 0), 0);
  const skillsLearned = [...new Set(completedCourses.flatMap(uc => uc.courses.skills_taught || []))];

  if (userCourses.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Your Learning Progress</h3>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userCourses.length}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{completedCourses.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalHoursLearned}</div>
            <div className="text-sm text-gray-600">Hours Learned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{skillsLearned.length}</div>
            <div className="text-sm text-gray-600">Skills Gained</div>
          </CardContent>
        </Card>
      </div>

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inProgressCourses.slice(0, 3).map((userCourse) => (
                <div key={userCourse.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{userCourse.courses.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={userCourse.progress_percentage} className="w-32" />
                      <span className="text-sm text-gray-600">
                        {userCourse.progress_percentage}%
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline">{userCourse.courses.duration_hours}h</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
