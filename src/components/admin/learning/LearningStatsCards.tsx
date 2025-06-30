
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, GraduationCap, Users } from 'lucide-react';

interface LearningStatsCardsProps {
  learningStats: {
    totalCourses: number;
    activeCourses: number;
    totalPaths: number;
    totalEnrollments: number;
  } | undefined;
}

export const LearningStatsCards: React.FC<LearningStatsCardsProps> = ({ learningStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{learningStats?.totalCourses?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Learning Paths</p>
              <p className="text-2xl font-bold text-gray-900">{learningStats?.totalPaths?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{learningStats?.totalEnrollments?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{learningStats?.activeCourses?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
