import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  Calendar,
  BookOpen,
  Users,
  Star,
  Trophy,
  Brain
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LearningMetric {
  metric_type: string;
  metric_value: number;
  metric_date: string;
  metadata: any;
}

interface EnrollmentStats {
  total_enrolled: number;
  completed_courses: number;
  in_progress: number;
  total_hours: number;
  certificates_earned: number;
  average_score: number;
}

interface SkillProgress {
  skill_name: string;
  assessments_taken: number;
  best_score: number;
  last_attempt: string;
}

export const LearningAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<LearningMetric[]>([]);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats | null>(null);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch learning metrics
      const { data: metricsData } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('metric_date', { ascending: false });

      if (metricsData) setMetrics(metricsData);

      // Fetch enrollment statistics
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (
            duration_hours,
            category
          )
        `)
        .eq('user_id', user.id);

      if (enrollments) {
        const stats: EnrollmentStats = {
          total_enrolled: enrollments.length,
          completed_courses: enrollments.filter(e => e.status === 'completed').length,
          in_progress: enrollments.filter(e => e.status === 'active' && e.progress_percentage > 0).length,
          total_hours: enrollments.reduce((sum, e) => sum + (e.courses?.duration_hours || 0), 0),
          certificates_earned: 0, // Will be calculated from certificates table
          average_score: 0 // Will be calculated from assessment attempts
        };

        setEnrollmentStats(stats);
      }

      // Fetch skill assessment progress
      const { data: attempts } = await supabase
        .from('assessment_attempts')
        .select(`
          *,
          skill_assessments (
            skill_name
          )
        `)
        .eq('user_id', user.id);

      if (attempts) {
        const skillMap = new Map<string, SkillProgress>();
        
        attempts.forEach(attempt => {
          const skillName = attempt.skill_assessments?.skill_name;
          if (!skillName) return;

          if (!skillMap.has(skillName)) {
            skillMap.set(skillName, {
              skill_name: skillName,
              assessments_taken: 0,
              best_score: 0,
              last_attempt: attempt.completed_at
            });
          }

          const skill = skillMap.get(skillName)!;
          skill.assessments_taken++;
          skill.best_score = Math.max(skill.best_score, attempt.score);
          if (new Date(attempt.completed_at) > new Date(skill.last_attempt)) {
            skill.last_attempt = attempt.completed_at;
          }
        });

        setSkillProgress(Array.from(skillMap.values()));
      }

      // Fetch certificates count
      const { data: certificates } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', user.id);

      if (certificates && enrollmentStats) {
        setEnrollmentStats(prev => prev ? {
          ...prev,
          certificates_earned: certificates.length
        } : null);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!enrollmentStats) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Start Your Learning Journey</h3>
          <p className="text-muted-foreground text-center">
            Enroll in courses to see your learning analytics and track your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  const completionRate = enrollmentStats.total_enrolled > 0 
    ? Math.round((enrollmentStats.completed_courses / enrollmentStats.total_enrolled) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{enrollmentStats.total_enrolled}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{enrollmentStats.completed_courses}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hours Learned</p>
                <p className="text-2xl font-bold text-blue-600">{enrollmentStats.total_hours}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificates</p>
                <p className="text-2xl font-bold text-purple-600">{enrollmentStats.certificates_earned}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completion Rate</span>
                      <span>{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{enrollmentStats.in_progress}</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{enrollmentStats.completed_courses}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-muted-foreground">
                        {enrollmentStats.total_enrolled - enrollmentStats.in_progress - enrollmentStats.completed_courses}
                      </p>
                      <p className="text-xs text-muted-foreground">Not Started</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Activity tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Skill Assessments
              </CardTitle>
              <CardDescription>
                Track your progress across different skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillProgress.length > 0 ? (
                  skillProgress.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{skill.skill_name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{skill.assessments_taken} attempts</span>
                          <span>Last: {new Date(skill.last_attempt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{skill.best_score}%</div>
                        <div className="text-xs text-muted-foreground">Best Score</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Take skill assessments to track your progress</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Metrics</CardTitle>
              <CardDescription>
                Your learning progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Detailed progress charts coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};