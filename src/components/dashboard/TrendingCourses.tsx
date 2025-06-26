
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

export const TrendingCourses = () => {
  const courses = [
    {
      id: "1",
      title: "Advanced React & TypeScript",
      instructor: "Sarah Johnson",
      rating: 4.8,
      students: 1234,
      duration: "8 hours",
      level: "Intermediate",
      price: "Free"
    },
    {
      id: "2",
      title: "Product Management Fundamentals",
      instructor: "Mike Chen",
      rating: 4.9,
      students: 856,
      duration: "12 hours",
      level: "Beginner",
      price: "$49"
    },
    {
      id: "3",
      title: "UX Design Principles",
      instructor: "Lisa Rodriguez",
      rating: 4.7,
      students: 2341,
      duration: "6 hours",
      level: "Intermediate",
      price: "$29"
    }
  ];

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
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-gray-600">by {course.instructor}</p>
                </div>
                <Badge variant={course.price === "Free" ? "secondary" : "outline"}>
                  {course.price}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {course.level}
                </Badge>
                <div className="space-x-2">
                  <Button size="sm" variant="outline">Preview</Button>
                  <Button size="sm" asChild>
                    <Link to={`/learning/courses/${course.id}`}>Enroll</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
