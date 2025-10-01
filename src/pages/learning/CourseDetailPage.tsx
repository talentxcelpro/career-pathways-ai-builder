import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Clock, Users, Award, Star, PlayCircle, FileText, 
  CheckCircle, Target, TrendingUp, ArrowLeft, Lock 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { toast } from 'sonner';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons(*)
        `)
        .eq('course_id', courseId)
        .order('module_order');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId,
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      return data;
    },
    enabled: !!user && !!courseId,
  });

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please sign in to enroll');
      return;
    }

    setIsEnrolling(true);
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          user_id: user.id,
          enrollment_status: 'active',
        });

      if (error) throw error;
      
      toast.success('Successfully enrolled in course!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <Link to="/learning/courses">
            <Button variant="link">← Back to catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = modules.reduce((acc: number, mod: any) => acc + (mod.course_lessons?.length || 0), 0);
  const isEnrolled = !!enrollment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/learning/courses" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-white/20">{course.difficulty_level || course.level}</Badge>
                  {course.trending && (
                    <Badge className="bg-orange-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  {course.certified && (
                    <Badge className="bg-green-500">
                      <Award className="h-3 w-3 mr-1" />
                      Certificate
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-primary-foreground/90">{course.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                {course.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{course.rating}</span>
                    <span className="text-primary-foreground/80">
                      ({course.reviews_count || 0} reviews)
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.students_count || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.duration || '40 hours'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="shadow-2xl">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {course.is_free ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <>₹{course.price || '999'}</>
                      )}
                    </div>
                    {!course.is_free && course.original_price && (
                      <div className="text-muted-foreground line-through">
                        ₹{course.original_price}
                      </div>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Button asChild className="w-full" size="lg">
                      <Link to={`/learning/player/${courseId}`}>
                        Continue Learning →
                      </Link>
                    </Button>
                  ) : user ? (
                    <Button 
                      onClick={handleEnroll} 
                      className="w-full" 
                      size="lg"
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  ) : (
                    <AuthDialog>
                      <Button className="w-full" size="lg">
                        Sign In to Enroll
                      </Button>
                    </AuthDialog>
                  )}

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Modules</span>
                      <span className="font-semibold">{modules.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Lessons</span>
                      <span className="font-semibold">{totalLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-semibold">{course.difficulty_level || course.level}</span>
                    </div>
                    {course.certified && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Certificate</span>
                        <Award className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {course.what_you_learn && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    What You'll Learn
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(typeof course.what_you_learn === 'string' 
                      ? JSON.parse(course.what_you_learn) 
                      : course.what_you_learn
                    ).map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {course.requirements && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Requirements</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {(typeof course.requirements === 'string'
                      ? JSON.parse(course.requirements)
                      : course.requirements
                    ).map((req: string, i: number) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="curriculum">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Course Curriculum</h3>
                  <p className="text-muted-foreground">
                    {modules.length} modules • {totalLessons} lessons
                  </p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {modules.map((module: any, index: number) => (
                    <AccordionItem key={module.id} value={`module-${index}`}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3 text-left">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{module.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {module.course_lessons?.length || 0} lessons • {module.duration_minutes || 0} min
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-11 space-y-2">
                          {module.course_lessons?.map((lesson: any) => (
                            <div key={lesson.id} className="flex items-center justify-between py-2 hover:bg-muted/50 px-3 rounded">
                              <div className="flex items-center gap-3">
                                {lesson.lesson_type === 'video' ? (
                                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                  {lesson.duration_minutes} min
                                </span>
                                {lesson.is_free ? (
                                  <Badge variant="outline" className="text-xs">Preview</Badge>
                                ) : !isEnrolled && (
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-3xl font-bold">
                    {course.instructor_name?.[0] || 'T'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{course.instructor_name || 'TalentXcel Instructor'}</h3>
                    <p className="text-muted-foreground">
                      Expert instructor with years of industry experience. Passionate about teaching and helping students succeed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}