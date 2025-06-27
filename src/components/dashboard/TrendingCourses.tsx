
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description?: string;
  instructor_name?: string;
  rating?: number;
  enrolled_count?: number;
  duration_hours?: number;
  difficulty_level?: string;
  price?: number;
  is_free?: boolean;
}

interface TrendingCoursesProps {
  courses: Course[];
}

export const TrendingCourses = ({ courses }: TrendingCoursesProps) => {
  const formatPrice = (course: Course) => {
    if (course.is_free || course.price === 0) return "Free";
    return `₹${course.price?.toLocaleString('en-IN')}`;
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return "Duration not specified";
    return `${hours} hours`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trending Courses</CardTitle>
            <CardDescription>
              Popular courses to boost your skills
            </CardDescription>
          </div>
          <Link to="/learning">
            <Button variant="outline" size="sm">Browse All</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No trending courses available at the moment.</p>
          ) : (
            courses.slice(0, 3).map((course) => (
              <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    {course.instructor_name && (
                      <p className="text-sm text-gray-600">by {course.instructor_name}</p>
                    )}
                  </div>
                  <Badge variant={course.is_free || course.price === 0 ? "secondary" : "outline"}>
                    {formatPrice(course)}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  {course.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {course.enrolled_count && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrolled_count.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(course.duration_hours)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {course.difficulty_level && (
                    <Badge variant="outline" className="text-xs">
                      {course.difficulty_level}
                    </Badge>
                  )}
                  <div className="space-x-2">
                    <Button size="sm" variant="outline">Preview</Button>
                    <Button size="sm" asChild>
                      <Link to={`/learning/courses/${course.id}`}>Enroll</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
