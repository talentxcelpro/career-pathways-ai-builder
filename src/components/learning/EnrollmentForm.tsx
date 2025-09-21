import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Users, Star, Award, BookOpen, Target, Zap } from 'lucide-react';
import { useEnrollInCourse, Course } from '@/hooks/useCourses';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';

interface EnrollmentFormProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onEnrollSuccess?: () => void;
}

export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  course,
  isOpen,
  onClose,
  onEnrollSuccess
}) => {
  const [step, setStep] = useState<'details' | 'confirming' | 'success'>('details');
  const { displayName } = useCurrentUserProfile();
  const enrollMutation = useEnrollInCourse();

  const handleEnroll = async () => {
    if (!displayName) {
      return;
    }

    setStep('confirming');
    try {
      await enrollMutation.mutateAsync({
        courseId: course.id,
        userId: 'temp-user-id'
      });
      setStep('success');
      onEnrollSuccess?.();
    } catch (error) {
      setStep('details');
    }
  };

  const handleClose = () => {
    setStep('details');
    onClose();
  };

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree || price === 0) return "Free";
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (step === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Enrollment Successful!
            </h3>
            <p className="text-muted-foreground mb-6">
              You've been successfully enrolled in <strong>{course.title}</strong>
            </p>
            <div className="space-y-3">
              <Button onClick={handleClose} className="w-full">
                Start Learning
              </Button>
              <Button variant="outline" onClick={handleClose} className="w-full">
                View My Courses
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Course Enrollment</DialogTitle>
          <DialogDescription>
            Review course details and confirm your enrollment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Header */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {course.thumbnail_url && (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full lg:w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{course.category}</Badge>
                    <Badge className={getDifficultyColor(course.difficulty_level)}>
                      {course.difficulty_level}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                  <CardDescription className="text-base">
                    by {course.instructor_name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Course Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="font-semibold">{course.rating}</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="font-semibold">{course.enrolled_count}</div>
              <div className="text-xs text-muted-foreground">Students</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-6 w-6 text-brand-green mx-auto mb-2" />
              <div className="font-semibold">{course.duration_hours}h</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Award className="h-6 w-6 text-accent mx-auto mb-2" />
              <div className="font-semibold">Certificate</div>
              <div className="text-xs text-muted-foreground">Included</div>
            </div>
          </div>

          {/* Course Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </CardContent>
          </Card>

          {/* Skills */}
          {course.skills_taught && course.skills_taught.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Skills You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.skills_taught.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Path Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Learning Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Foundation Concepts</div>
                    <div className="text-sm text-muted-foreground">Master the basics</div>
                  </div>
                  <div className="ml-auto">
                    <Progress value={0} className="w-16" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Practical Applications</div>
                    <div className="text-sm text-muted-foreground">Hands-on projects</div>
                  </div>
                  <div className="ml-auto">
                    <Progress value={0} className="w-16" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Advanced Techniques</div>
                    <div className="text-sm text-muted-foreground">Professional skills</div>
                  </div>
                  <div className="ml-auto">
                    <Progress value={0} className="w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Pricing and Enrollment */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 p-6 bg-muted/30 rounded-lg">
            <div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(course.price, course.is_free)}
              </div>
              {!course.is_free && course.price > 0 && (
                <div className="text-sm text-muted-foreground">
                  One-time payment • Lifetime access
                </div>
              )}
            </div>
            <Button 
              onClick={handleEnroll} 
              disabled={enrollMutation.isPending || step === 'confirming'}
              size="lg"
              className="min-w-[200px]"
            >
              {step === 'confirming' ? (
                'Enrolling...'
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Enroll Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};