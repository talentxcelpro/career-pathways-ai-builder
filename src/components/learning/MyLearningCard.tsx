
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Award } from "lucide-react";

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
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{userCourse.courses.title}</CardTitle>
        <CardDescription>
          Enrolled on {new Date(userCourse.enrolled_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{userCourse.progress_percentage}%</span>
            </div>
            <Progress value={userCourse.progress_percentage} className="h-2" />
          </div>

          {userCourse.completed_at ? (
            <div className="flex items-center text-green-600">
              <Award className="h-4 w-4 mr-1" />
              <span className="text-sm">Completed</span>
            </div>
          ) : (
            <Button className="w-full">
              <Play className="h-4 w-4 mr-1" />
              Continue Learning
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
