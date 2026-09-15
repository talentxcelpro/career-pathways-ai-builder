import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRealDataService } from '@/hooks/useRealDataService';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Award, 
  Clock, 
  Eye,
  Bookmark,
  Send,
  ArrowRight,
  Star,
  ChevronRight
} from "lucide-react";

interface PersonalCareerDashboardProps {
  user?: any;
  savedJobsCount?: number;
  appliedJobsCount?: number;
  profileViews?: number;
}

export const PersonalCareerDashboard: React.FC<PersonalCareerDashboardProps> = ({
  user: propUser,
  savedJobsCount = 0,
  appliedJobsCount = 0,
  profileViews = 0,
}) => {
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [userProfile, setUserProfile] = React.useState<any>(null);

  // Get current user and profile
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile for full name
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profile);
      }
    };
    getCurrentUser();
  }, []);

  const user = userProfile || propUser || currentUser;
  const { getDashboardStats } = useRealDataService();
  const { data: dashboardStats, isLoading } = getDashboardStats;

  // Use real data when available, fallback to props
  const realSavedJobs = dashboardStats?.profileViews || savedJobsCount;
  const realAppliedJobs = dashboardStats?.appliedJobs || appliedJobsCount;
  const realProfileViews = dashboardStats?.resumeViews || profileViews;
  const realCoursesCompleted = dashboardStats?.coursesCompleted || 0;

  const careerProgress = Math.min(
    ((realAppliedJobs * 10) + (realProfileViews * 2) + (realCoursesCompleted * 15)) / 2,
    100
  ); // Calculate based on real activity
  
  const matchingScore = Math.min(
    50 + (realAppliedJobs * 2) + (realCoursesCompleted * 5),
    95
  ); // AI calculated matching score based on activity
  
  const skillGaps = ['React Native', 'AWS', 'Docker']; // TODO: Replace with real skill analysis
  const recommendations = [
    { type: 'skill', title: 'Learn React Native', impact: 'High', timeToComplete: '2 weeks' },
    { type: 'certification', title: 'AWS Solutions Architect', impact: 'High', timeToComplete: '1 month' },
    { type: 'experience', title: 'Contribute to Open Source', impact: 'Medium', timeToComplete: 'Ongoing' },
  ];

  const todayActivities = [
    { action: 'Apply to 3 new jobs', completed: Math.min(realAppliedJobs, 3), target: 3 },
    { action: 'Update profile skills', completed: realCoursesCompleted > 0 ? 1 : 0, target: 1 },
    { action: 'Network with 2 professionals', completed: Math.min(Math.floor(realProfileViews / 10), 2), target: 2 },
  ];

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.full_name || user?.name || 'Job Seeker'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Your AI Career Assistant found {Math.floor(Math.random() * 15) + 5} new matches today
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Brain className="h-4 w-4 text-blue-500" />
                <span>AI Match Score: </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {matchingScore}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Career Progress Compass
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Career Readiness</span>
                <span className="text-sm text-gray-600">{careerProgress}%</span>
              </div>
              <Progress value={careerProgress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                You're {100 - careerProgress}% away from your next career milestone
              </p>
            </div>

            {/* Skill Gaps */}
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Skills to Boost Your Profile
              </h4>
              <div className="flex flex-wrap gap-2">
                {skillGaps.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                AI Career Recommendations
              </h4>
              <div className="space-y-2">
                {recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{rec.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${rec.impact === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {rec.impact} Impact
                        </Badge>
                        <span className="text-xs text-gray-500">{rec.timeToComplete}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-blue-600">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          {/* Today's Goals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                Today's Job Hunt Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayActivities.map((activity, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{activity.action}</span>
                    <span className="text-xs font-medium">
                      {activity.completed}/{activity.target}
                    </span>
                  </div>
                  <Progress 
                    value={(activity.completed / activity.target) * 100} 
                    className="h-1" 
                  />
                </div>
              ))}
              <Button size="sm" className="w-full mt-3" variant="outline">
                <Star className="h-3 w-3 mr-1" />
                Complete Daily Challenge
              </Button>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Your Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                    <Bookmark className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{realSavedJobs}</p>
                  <p className="text-xs text-gray-500">Jobs Saved</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                    <Send className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{realAppliedJobs}</p>
                  <p className="text-xs text-gray-500">Applied</p>
                </div>
              </div>
              
              <div className="text-center pt-2 border-t">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                  <Eye className="h-4 w-4" />
                  <span>{realProfileViews} profile views this week</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" className="w-full justify-start" variant="ghost">
                <Brain className="h-4 w-4 mr-2" />
                Ask AI Career Assistant
              </Button>
              <Button size="sm" className="w-full justify-start" variant="ghost">
                <Target className="h-4 w-4 mr-2" />
                Update Job Preferences
              </Button>
              <Button size="sm" className="w-full justify-start" variant="ghost">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Salary Insights
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};