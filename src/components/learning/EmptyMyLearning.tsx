
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface EmptyMyLearningProps {
  onBrowseCourses: () => void;
}

export const EmptyMyLearning: React.FC<EmptyMyLearningProps> = ({ onBrowseCourses }) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
        <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course</p>
        <Button onClick={onBrowseCourses}>
          Browse Courses
        </Button>
      </CardContent>
    </Card>
  );
};
