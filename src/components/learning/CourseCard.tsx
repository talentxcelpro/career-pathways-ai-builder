
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Play, Award, ExternalLink } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty_level?: string;
  level?: string;
  duration_hours?: number;
  duration?: string;
  enrolled_count?: number;
  students?: number;
  rating?: number;
  instructor_name?: string;
  skills_taught?: string[];
  is_free?: boolean;
  price?: number | string;
}

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isEnrolled, onEnroll }) => {
  const formatPrice = (price: number | string | undefined, isFree?: boolean) => {
    if (isFree || price === 0 || price === '0') return "Free";
    if (!price) return "Contact for price";
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₹${numPrice.toLocaleString('en-IN')}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary">{course.category || 'General'}</Badge>
          <Badge variant={(course.difficulty_level || course.level) === 'beginner' ? 'default' : 
                 (course.difficulty_level || course.level) === 'intermediate' ? 'secondary' : 'destructive'}>
            {course.difficulty_level || course.level || 'Beginner'}
          </Badge>
        </div>
        <CardTitle className="text-lg">
          <Link 
            to={`/learning/courses/${course.id}`}
            className="hover:text-primary transition-colors"
          >
            {course.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description || 'Learn essential skills for your career growth'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {course.duration || `${course.duration_hours || 2}h`}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {course.students || course.enrolled_count || 0}
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              {course.rating || 4.5}
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
              {formatPrice(course.price, course.is_free)}
            </span>
            <div className="flex gap-2">
              <Link to={`/learning/courses/${course.id}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </Link>
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
        </div>
      </CardContent>
    </Card>
  );
};
