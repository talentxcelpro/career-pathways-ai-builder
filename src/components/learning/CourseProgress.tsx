
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  duration_hours: number;
  skills_taught: string[];
  difficulty_level: string;
}

interface UserCourse {
  id: string;
  course_id: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string;
  courses: Course;
}

interface CourseProgressProps {
  userCourse: UserCourse;
}

export const CourseProgress: React.FC<CourseProgressProps> = ({ userCourse }) => {
  const { courses: course, progress_percentage, completed_at } = userCourse;
  const isCompleted = progress_percentage === 100 || completed_at;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="relative">
        {course.thumbnail_url && (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
            <CheckCircle className="h-3 w-3" />
            Completed
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{progress_percentage}%</span>
            </div>
            <Progress value={progress_percentage} className="h-2" />
          </div>

          {/* Course Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {course.duration_hours}h
            </div>
            <Badge variant="outline" className="text-xs">
              {course.difficulty_level}
            </Badge>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1">
            {course.skills_taught?.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {course.skills_taught?.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{course.skills_taught.length - 3} more
              </Badge>
            )}
          </div>

          {/* Action Button */}
          <Link to={`/learning/${course.id}`}>
            <Button className="w-full" variant={isCompleted ? "outline" : "default"}>
              {isCompleted ? (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Review Course
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </>
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
