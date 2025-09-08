import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Star, Play, Award, CheckCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  rating: number;
  enrolled_count: number;
  price: number;
  is_free: boolean;
  skills_taught: string[];
  thumbnail_url?: string;
  published: boolean;
}

interface CourseEnrollment {
  id: string;
  progress_percentage: number;
  enrolled_at: string;
  status: string;
}

interface CourseEnrollmentCardProps {
  course: Course;
  enrollment?: CourseEnrollment;
  onEnroll: (courseId: string) => void;
  onContinue: (courseId: string) => void;
}

export const CourseEnrollmentCard: React.FC<CourseEnrollmentCardProps> = ({
  course,
  enrollment,
  onEnroll,
  onContinue
}) => {
  const [isEnrolling, setIsEnrolling] = useState(false);

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree || price === 0) return "Free";
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEnroll = async () => {
    if (enrollment) {
      onContinue(course.id);
      return;
    }

    setIsEnrolling(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to enroll in courses");
        return;
      }

      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,
          status: 'active'
        });

      if (error) {
        console.error('Enrollment error:', error);
        toast.error("Failed to enroll in course");
        return;
      }

      toast.success("Successfully enrolled in course!");
      onEnroll(course.id);
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error("An error occurred during enrollment");
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full">
      {course.thumbnail_url && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary">{course.category}</Badge>
          <Badge className={getDifficultyColor(course.difficulty_level)}>
            {course.difficulty_level}
          </Badge>
        </div>
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
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
          <p className="text-sm text-muted-foreground">
            by {course.instructor_name}
          </p>
        )}

        {enrollment && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{enrollment.progress_percentage}%</span>
            </div>
            <Progress value={enrollment.progress_percentage} className="h-2" />
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
            </div>
          </div>
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

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(course.price, course.is_free)}
          </span>
          <Button
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="min-w-[100px]"
          >
            {isEnrolling ? (
              "Enrolling..."
            ) : enrollment ? (
              enrollment.progress_percentage === 100 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Continue
                </>
              )
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Enroll
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};