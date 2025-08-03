import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  Target,
  Calendar,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Plus,
  Bot
} from 'lucide-react';
import { CareerPassportCard } from '@/components/profile/CareerPassportCard';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { useCopilotContext } from '@/components/ai/CopilotProvider';

export function StudentDashboard() {
  const { careerPassport, getNextMilestone } = useCareerPassport();
  const { openCopilot } = useCopilotContext();
  const nextMilestone = getNextMilestone();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to your Student Dashboard</h1>
            <p className="text-muted-foreground">
              Track your career progress, discover opportunities, and build your professional profile.
            </p>
          </div>
          <Button
            onClick={() => openCopilot('dashboard')}
            className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
            variant="outline"
          >
            <Bot className="h-4 w-4 mr-2" />
            AI Copilot
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{careerPassport?.resumes_count || 0}</div>
                <div className="text-xs text-muted-foreground">Resumes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Briefcase className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{careerPassport?.jobs_applied_count || 0}</div>
                <div className="text-xs text-muted-foreground">Applications</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <GraduationCap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{careerPassport?.certifications_count || 0}</div>
                <div className="text-xs text-muted-foreground">Certificates</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{careerPassport?.tests_completed_count || 0}</div>
                <div className="text-xs text-muted-foreground">Tests</div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          {nextMilestone && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommended Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-accent/20 p-4 rounded-lg border border-accent/40">
                  <h3 className="font-medium mb-2">{nextMilestone.message}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete this to earn +{nextMilestone.points} completion points
                  </p>
                  <Button size="sm">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Create Resume</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Briefcase className="h-6 w-6" />
                  <span className="text-sm">Find Jobs</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <GraduationCap className="h-6 w-6" />
                  <span className="text-sm">Take Assessment</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm">Learn Skills</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Network</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">More</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Resume updated</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Applied to Software Developer role</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed JavaScript Assessment</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CareerPassportCard />
          
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                This Week's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Profile Views</span>
                  <span>12</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Applications Sent</span>
                  <span>3</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Skills Practiced</span>
                  <span>5</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">New</Badge>
                  <span className="text-sm font-medium">Job Match</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  3 new jobs match your profile
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">Update</Badge>
                  <span className="text-sm font-medium">Application Status</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your application was viewed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}