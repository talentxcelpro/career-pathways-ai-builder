
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Play, Award } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  enrolled_count: number;
  rating: number;
  instructor_name: string;
  skills_taught: string[];
  is_free: boolean;
  price: number;
}

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isEnrolled, onEnroll }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary">{course.category}</Badge>
          <Badge variant={course.difficulty_level === 'beginner' ? 'default' : 
                 course.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
            {course.difficulty_level}
          </Badge>
        </div>
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {course.duration_hours}h
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {course.enrolled_count}
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              {course.rating}
            </div>
          </div>
          
          {course.instructor_name && (
            <p className="text-sm text-gray-600">
              by {course.instructor_name}
            </p>
          )}

          {course.skills_taught && course.skills_taught.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.skills_taught.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {course.skills_taught.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{course.skills_taught.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-green-600">
              {course.is_free ? 'Free' : `$${course.price}`}
            </span>
            <Button
              onClick={() => onEnroll(course.id)}
              disabled={isEnrolled}
              size="sm"
            >
              {isEnrolled ? (
                <>
                  <Award className="h-4 w-4 mr-1" />
                  Enrolled
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Enroll
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
