
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLearningData } from '@/hooks/useLearningData';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { updateMetaTags } from '@/utils/metaTags';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  PlayCircle,
  BookOpen,
  CheckCircle,
  Award,
  Globe,
  Calendar
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, isLoading } = useLearningData();
  const { addCourse, isAdding, progress } = useLearningProgress();
  
  const course = courses.find(c => c.id === id);
  
  // Check if user is already enrolled
  const isEnrolled = progress.some(p => p.course_id === id);

  React.useEffect(() => {
    if (course) {
      updateMetaTags({
        title: `${course.title} | TalentXcel Learning`,
        description: course.description || `Learn ${course.title} with expert instruction and hands-on projects.`
      });
    }
  }, [course]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CourseraStyleHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <CourseraStyleHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Course Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/learning/courses">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Courses
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getDifficultyConfig = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return { className: 'bg-green-100 text-green-800', icon: '🌱', label: 'Beginner' };
      case 'intermediate':
        return { className: 'bg-yellow-100 text-yellow-800', icon: '⚡', label: 'Intermediate' };
      case 'advanced':
        return { className: 'bg-red-100 text-red-800', icon: '🚀', label: 'Advanced' };
      default:
        return { className: 'bg-gray-100 text-gray-800', icon: '📚', label: level || 'All Levels' };
    }
  };

  const difficultyConfig = getDifficultyConfig(course.level || course.difficulty_level);

  const handleEnrollment = async () => {
    if (!course || isEnrolled) return;
    
    try {
      await addCourse({
        course_id: course.id,
        course_title: course.title,
        course_provider: course.instructor_name || 'TalentXcel',
        total_lessons: course.duration_hours || 10,
        skill_tags: course.skills_taught || []
      });
      
      // Navigate to course player after successful enrollment
      setTimeout(() => {
        window.location.href = `/learning/courses/${course.id}/player`;
      }, 1500);
    } catch (error) {
      console.error('Enrollment failed:', error);
      toast.error('Failed to enroll in course. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/learning" className="hover:text-primary transition-colors">Learning</Link>
            <span>›</span>
            <Link to="/learning/courses" className="hover:text-primary transition-colors">All Courses</Link>
            <span>›</span>
            <span className="text-foreground">{course.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {course.category && (
                  <Badge variant="secondary">{course.category}</Badge>
                )}
                <Badge className={difficultyConfig.className}>
                  <span className="mr-1">{difficultyConfig.icon}</span>
                  {difficultyConfig.label}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
              
              <div className="flex items-center space-x-6 text-muted-foreground">
                {course.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span>{course.rating}</span>
                  </div>
                )}
                {(course.students || course.enrolled_count) && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{(course.students || course.enrolled_count)?.toLocaleString()} students</span>
                  </div>
                )}
                {course.duration_hours && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration_hours} hours</span>
                  </div>
                )}
              </div>

              {course.instructor_name && (
                <p className="text-muted-foreground">
                  Created by <span className="font-medium text-foreground">{course.instructor_name}</span>
                </p>
              )}
            </div>

            {/* Course Image */}
            <div className="relative">
              {course.thumbnail || course.thumbnail_url ? (
                <img 
                  src={course.thumbnail || course.thumbnail_url} 
                  alt={course.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                  <PlayCircle className="h-24 w-24 text-primary/50" />
                </div>
              )}
            </div>

            {/* Course Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">About this course</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description || 'This comprehensive course covers advanced concepts with hands-on projects and real-world applications. You\'ll learn industry best practices and gain practical skills that can be immediately applied in your work.'}
                </p>
              </CardContent>
            </Card>

            {/* Skills You'll Learn */}
            {course.skills_taught && course.skills_taught.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Skills you'll gain</h2>
                  <div className="flex flex-wrap gap-2">
                    {course.skills_taught.map((skill, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  {course.price && parseFloat(String(course.price)) > 0 && !course.is_free ? (
                    <div className="text-3xl font-bold text-primary">
                      ₹{typeof course.price === 'string' ? parseFloat(course.price) || 0 : course.price}
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-green-600">Free</div>
                  )}
                </div>
                
                {isEnrolled ? (
                  <Button className="w-full" size="lg" variant="outline" asChild>
                    <Link to={`/learning/courses/${course.id}/player`}>
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Continue Learning
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleEnrollment}
                    disabled={isAdding}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    {isAdding ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                )}
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Full lifetime access • Certificate of completion
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-foreground">Course details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <span className="text-sm font-medium">{course.duration_hours || 8} hours</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Enrolled</span>
                    </div>
                    <span className="text-sm font-medium">
                      {(course.students || course.enrolled_count)?.toLocaleString() || '1,000+'} students
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Language</span>
                    </div>
                    <span className="text-sm font-medium">English</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Certificate</span>
                    </div>
                    <span className="text-sm font-medium">Yes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
