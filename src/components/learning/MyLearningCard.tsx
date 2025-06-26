
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Award, Clock, CheckCircle } from "lucide-react";

interface UserCourse {
  id: string;
  enrolled_at: string;
  progress_percentage: number;
  completed_at: string | null;
  courses: {
    title: string;
  };
}

interface MyLearningCardProps {
  userCourse: UserCourse;
}

export const MyLearningCard: React.FC<MyLearningCardProps> = ({ userCourse }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
      {userCourse.completed_at && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-green-100 text-green-700 text-xs">
            <Award className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
      
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
              {userCourse.courses.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Enrolled {formatDate(userCourse.enrolled_at)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 pt-0">
        <div className="space-y-4">
          {/* Progress Section */}
          <div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{userCourse.progress_percentage}%</span>
            </div>
            <div className="relative">
              <Progress 
                value={userCourse.progress_percentage} 
                className="h-2 bg-gray-100"
              />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor(userCourse.progress_percentage)}`}
                style={{ width: `${userCourse.progress_percentage}%` }}
              />
            </div>
          </div>

          {/* Status and Action */}
          {userCourse.completed_at ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Course Completed</span>
              </div>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Certificate Available
              </Badge>
            </div>
          ) : (
            <Button className="w-full text-sm h-9 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
              <Play className="h-3 w-3 mr-2" />
              Continue Learning
            </Button>
          )}

          {/* Additional Info */}
          {userCourse.progress_percentage > 0 && userCourse.progress_percentage < 100 && (
            <div className="text-xs text-gray-500 text-center">
              {100 - userCourse.progress_percentage}% remaining to complete
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
