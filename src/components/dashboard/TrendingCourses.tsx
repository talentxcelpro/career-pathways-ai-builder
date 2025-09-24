
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users, ArrowRight, BookOpen, Play, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { memo } from "react";

interface Course {
  id: string;
  title: string;
  description?: string;
  instructor_name?: string;
  rating?: number;
  enrolled_count?: number;
  students?: number;
  duration_hours?: number;
  difficulty_level?: string;
  price?: string | number;
  is_free?: boolean;
}

interface TrendingCoursesProps {
  courses: Course[];
}

export const TrendingCourses = memo(({ courses }: TrendingCoursesProps) => {
  const navigate = useNavigate();

  const formatPrice = (course: Course) => {
    if (course.is_free || course.price === 0) return "Free";
    return `₹${course.price?.toLocaleString('en-IN')}`;
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return "Duration TBD";
    return `${hours}h`;
  };

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-50 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleEnroll = (courseId: string) => {
    // Navigate to course detail page or learning section
    navigate(`/learning/courses/${courseId}`);
  };

  const handlePreview = (courseId: string) => {
    // Open preview modal or navigate to preview page
    navigate(`/learning/courses/${courseId}?preview=true`);
  };

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Trending Courses</CardTitle>
              <CardDescription className="text-xs text-slate-600 font-medium">
                Popular courses to boost your skills
              </CardDescription>
            </div>
          </div>
          <Link to="/learning">
            <Button variant="outline" size="sm" className="text-xs font-semibold hover:bg-slate-50 border-slate-200">
              Browse All
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {courses.length === 0 ? (
            <div className="text-center py-8 bg-slate-50/50 rounded-lg">
              <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">No trending courses available at the moment.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => navigate('/learning')}
              >
                Explore Courses
              </Button>
            </div>
          ) : (
            courses.slice(0, 3).map((course) => (
              <div key={course.id} className="group border border-slate-100 rounded-lg p-4 hover:shadow-md hover:border-slate-200 transition-all duration-200 bg-white/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <Link to={`/learning/courses/${course.id}`}>
                      <h3 className="font-semibold text-sm text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors cursor-pointer">
                        {course.title}
                      </h3>
                    </Link>
                    {course.instructor_name && (
                      <p className="text-xs text-slate-600 font-medium">by {course.instructor_name}</p>
                    )}
                  </div>
                  <Badge 
                    variant={course.is_free || course.price === 0 ? "secondary" : "outline"}
                    className="text-xs font-semibold ml-2 flex-shrink-0"
                  >
                    {formatPrice(course)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
                  {course.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{course.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {course.enrolled_count && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">{course.enrolled_count.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">{formatDuration(course.duration_hours)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {course.difficulty_level && (
                    <Badge 
                      variant="outline" 
                      className={`text-2xs font-semibold ${getDifficultyColor(course.difficulty_level)}`}
                    >
                      {course.difficulty_level}
                    </Badge>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs font-semibold h-8 px-3 hover:bg-slate-50"
                      onClick={() => handlePreview(course.id)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="text-xs font-semibold h-8 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {courses.length > 3 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/learning">
              <Button variant="ghost" className="w-full text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50">
                View {courses.length - 3} more courses
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TrendingCourses.displayName = 'TrendingCourses';
