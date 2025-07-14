import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Trophy, Target, Clock, CheckCircle, Play, ExternalLink, Award } from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  skills_taught?: string[];
  prerequisites?: string[];
  certification_available?: boolean;
  price?: number;
  provider?: string;
  provider_url?: string;
  rating?: number;
  enrollment_count?: number;
  enrolled_count?: number;
}

interface UserCourseProgress {
  id: string;
  course_id: string;
  enrollment_date: string;
  completion_date: string | null;
  progress_percentage: number;
  current_module: string;
  time_spent_hours: number;
  certificate_earned: boolean;
  certificate_url: string | null;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  courses: Course;
}

interface LearningPipelineProps {
  targetRole?: string;
  skillGaps?: string[];
}

export function LearningPipeline({ targetRole, skillGaps = [] }: LearningPipelineProps) {
  const [selectedTab, setSelectedTab] = useState("recommended");
  const queryClient = useQueryClient();

  // Fetch recommended courses based on skill gaps or target role
  const { data: recommendedCourses, isLoading: recommendedLoading } = useQuery({
    queryKey: ["recommended-courses", targetRole, skillGaps],
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select("*")
        .eq("is_active", true);

      if (skillGaps.length > 0) {
        query = query.overlaps('skills_taught', skillGaps);
      }

      const { data, error } = await query
        .order('rating', { ascending: false })
        .order('enrollment_count', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch user's enrolled courses
  const { data: userCourses, isLoading: userCoursesLoading } = useQuery({
    queryKey: ["user-courses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_course_progress")
        .select(`
          *,
          courses (*)
        `)
        .eq("user_id", user.id)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      return data as UserCourseProgress[];
    },
  });

  // Enroll in course
  const enrollCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_course_progress")
        .insert({
          user_id: user.id,
          course_id: courseId,
          status: 'enrolled',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-courses"] });
      toast.success("Successfully enrolled in course!");
    },
    onError: (error) => {
      toast.error("Failed to enroll: " + error.message);
    },
  });

  // Update course progress
  const updateProgress = useMutation({
    mutationFn: async ({ courseId, progress, module, timeSpent }: {
      courseId: string;
      progress: number;
      module?: string;
      timeSpent?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const updates: any = {
        progress_percentage: progress,
        status: progress >= 100 ? 'completed' : 'in_progress',
      };

      if (module) updates.current_module = module;
      if (timeSpent) updates.time_spent_hours = timeSpent;
      if (progress >= 100) updates.completion_date = new Date().toISOString();

      const { error } = await supabase
        .from("user_course_progress")
        .update(updates)
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      if (error) throw error;

      // If course is completed, check if we should update user skills
      if (progress >= 100) {
        const { data: course } = await supabase
          .from("courses")
          .select("skills_taught")
          .eq("id", courseId)
          .single();

        if (course?.skills_taught) {
          // Update user skills with course completion
          const skillUpdates = course.skills_taught.map((skillName: string) => ({
            skill_name: skillName,
            proficiency_increase: 10, // Increase proficiency by 10 points
            source: 'course_completion'
          }));

          // This would need a database function to update skills based on course completion
          // For now, we'll just show a success message
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-courses"] });
      toast.success("Progress updated!");
    },
    onError: (error) => {
      toast.error("Failed to update progress: " + error.message);
    },
  });

  const CourseCard = ({ course, userProgress }: { course: Course; userProgress?: UserCourseProgress }) => {
    const isEnrolled = !!userProgress;
    const progress = userProgress?.progress_percentage || 0;
    const isCompleted = userProgress?.status === 'completed';

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{course.provider}</p>
            </div>
            <div className="text-right">
              <Badge variant={
                course.difficulty_level === 'beginner' ? 'secondary' :
                course.difficulty_level === 'intermediate' ? 'default' :
                course.difficulty_level === 'advanced' ? 'destructive' : 'outline'
              }>
                {course.difficulty_level}
              </Badge>
              {course.certification_available && (
                <Badge variant="outline" className="ml-2">
                  <Award className="w-3 h-3 mr-1" />
                  Cert
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration_hours}h
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {course.skills_taught?.length || 0} skills
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {course.rating}/5
            </span>
          </div>
          
          {course.skills_taught && course.skills_taught.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Skills you'll learn:</p>
              <div className="flex flex-wrap gap-1">
                {course.skills_taught.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {course.skills_taught.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{course.skills_taught.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {isEnrolled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {userProgress?.current_module && (
                <p className="text-xs text-muted-foreground">
                  Current: {userProgress.current_module}
                </p>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            {!isEnrolled ? (
              <>
                <Button 
                  onClick={() => enrollCourse.mutate(course.id)}
                  disabled={enrollCourse.isPending}
                  className="flex-1"
                >
                  {course.price > 0 ? `Enroll - ₹${course.price}` : 'Enroll Free'}
                </Button>
                {course.provider_url && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={course.provider_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button className="flex-1" disabled={isCompleted}>
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </>
                  )}
                </Button>
                {!isCompleted && (
                  <Button 
                    variant="outline"
                    onClick={() => updateProgress.mutate({
                      courseId: course.id,
                      progress: Math.min(100, progress + 10),
                      timeSpent: (userProgress?.time_spent_hours || 0) + 1
                    })}
                  >
                    Mark Progress
                  </Button>
                )}
              </>
            )}
          </div>
          
          {isCompleted && userProgress?.certificate_earned && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Certificate Earned!
                </span>
              </div>
              {userProgress.certificate_url && (
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <a href={userProgress.certificate_url} target="_blank" rel="noopener noreferrer">
                    View Certificate
                  </a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Learning Pipeline</h2>
        <p className="text-muted-foreground">
          {targetRole ? `Courses to help you become a ${targetRole}` : "Personalized learning recommendations"}
        </p>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommended" className="space-y-4">
          {skillGaps.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Skill Gap Focus</span>
              </div>
              <p className="text-sm text-blue-700">
                These courses will help you develop: {skillGaps.join(", ")}
              </p>
            </div>
          )}
          
          {recommendedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedCourses?.map((course) => {
                const userProgress = userCourses?.find(uc => uc.course_id === course.id);
                return (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    userProgress={userProgress}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="enrolled" className="space-y-4">
          {userCoursesLoading ? (
            <div className="text-center">Loading your courses...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCourses
                ?.filter(uc => uc.status === 'enrolled' || uc.status === 'in_progress')
                .map((userProgress) => (
                  <CourseCard 
                    key={userProgress.id} 
                    course={userProgress.courses} 
                    userProgress={userProgress}
                  />
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {userCoursesLoading ? (
            <div className="text-center">Loading completed courses...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCourses
                ?.filter(uc => uc.status === 'completed')
                .map((userProgress) => (
                  <CourseCard 
                    key={userProgress.id} 
                    course={userProgress.courses} 
                    userProgress={userProgress}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}