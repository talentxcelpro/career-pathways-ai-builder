
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Star, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  instructor_name: string;
  rating: number;
  enrolled_count?: number;
}

interface TrendingCoursesProps {
  courses: Course[];
}

export const TrendingCourses = ({ courses }: TrendingCoursesProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <GraduationCap className="h-5 w-5 mr-2" />
          Trending Courses
        </CardTitle>
        <CardDescription>Popular learning paths in your field</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No courses available at the moment</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
              <p className="text-gray-600 mb-2">by {course.instructor_name}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {course.enrolled_count?.toLocaleString()} students
                </span>
              </div>
            </div>
          ))
        )}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/learning')}
        >
          Explore Learning
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
