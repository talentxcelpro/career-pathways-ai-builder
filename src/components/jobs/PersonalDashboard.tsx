import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, Target, TrendingUp, Award, Clock, Star,
  FileText, Send, Eye, Heart, MessageCircle,
  BookOpen, Zap, Brain, Trophy, Calendar,
  CheckCircle, AlertCircle, Plus, Settings
} from "lucide-react";

export const PersonalDashboard: React.FC = () => {
  const [profileCompleteness, setProfileCompleteness] = useState(78);
  
  const userStats = {
    applicationsSubmitted: 12,
    interviewsScheduled: 3,
    profileViews: 145,
    savedJobs: 8,
    skillAssessments: 5,
    networkConnections: 23
  };

  const recentActivity = [
    { type: 'application', title: 'Applied to Senior Developer at TechCorp', time: '2 hours ago', status: 'pending' },
    { type: 'view', title: 'Profile viewed by Google recruiter', time: '5 hours ago', status: 'new' },
    { type: 'skill', title: 'Completed React Assessment', time: '1 day ago', status: 'completed' },
    { type: 'interview', title: 'Interview scheduled with Microsoft', time: '2 days ago', status: 'scheduled' }
  ];

  const skillAssessments = [
    { skill: 'React', score: 92, level: 'Expert', badge: 'gold' },
    { skill: 'JavaScript', score: 88, level: 'Advanced', badge: 'silver' },
    { skill: 'Node.js', score: 85, level: 'Advanced', badge: 'silver' },
    { skill: 'TypeScript', score: 79, level: 'Intermediate', badge: 'bronze' }
  ];

  const careerGoals = [
    { goal: 'Land a Senior Developer role', progress: 65, deadline: '2024-03-01' },
    { goal: 'Increase salary by 30%', progress: 40, deadline: '2024-06-01' },
    { goal: 'Master cloud technologies', progress: 30, deadline: '2024-04-01' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application': return Send;
      case 'view': return Eye;
      case 'skill': return Award;
      case 'interview': return Calendar;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Personal Dashboard
          </h2>
          <p className="text-muted-foreground">Track your job search progress and career development</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Profile Completeness */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Profile Completeness</h3>
                <p className="text-sm text-blue-700">Complete your profile to attract more employers</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-900">{profileCompleteness}%</span>
              <p className="text-sm text-blue-600">Almost there!</p>
            </div>
          </div>
          <Progress value={profileCompleteness} className="h-3 mb-4" />
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Complete Profile
            </Button>
            <Badge className="bg-blue-100 text-blue-800">
              +22% more profile views when complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="text-center space-y-2">
            <Send className="h-6 w-6 text-green-600 mx-auto" />
            <div className="text-2xl font-bold">{userStats.applicationsSubmitted}</div>
            <div className="text-sm text-muted-foreground">Applications</div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="text-center space-y-2">
            <Calendar className="h-6 w-6 text-blue-600 mx-auto" />
            <div className="text-2xl font-bold">{userStats.interviewsScheduled}</div>
            <div className="text-sm text-muted-foreground">Interviews</div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="text-center space-y-2">
            <Eye className="h-6 w-6 text-purple-600 mx-auto" />
            <div className="text-2xl font-bold">{userStats.profileViews}</div>
            <div className="text-sm text-muted-foreground">Profile Views</div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="text-center space-y-2">
            <Heart className="h-6 w-6 text-red-600 mx-auto" />
            <div className="text-2xl font-bold">{userStats.savedJobs}</div>
            <div className="text-sm text-muted-foreground">Saved Jobs</div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="text-center space-y-2">
            <Award className="h-6 w-6 text-yellow-600 mx-auto" />
            <div className="text-2xl font-bold">{userStats.skillAssessments}</div>
            <div className="text-sm text-muted-foreground">Assessments</div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="text-center space-y-2">
            <MessageCircle className="h-6 w-6 text-indigo-600 mx-auto" />
            <div className="text-2xl font-bold">{userStats.networkConnections}</div>
            <div className="text-sm text-muted-foreground">Connections</div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
              );
            })}
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Career Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Career Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {careerGoals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{goal.goal}</p>
                  <span className="text-xs text-muted-foreground">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{goal.progress}% complete</span>
                  {goal.progress >= 80 ? (
                    <Badge className="bg-green-100 text-green-800">On track</Badge>
                  ) : goal.progress >= 50 ? (
                    <Badge className="bg-yellow-100 text-yellow-800">In progress</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Needs attention</Badge>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add New Goal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Skill Assessments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Skill Assessments & Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {skillAssessments.map((assessment, index) => (
              <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{assessment.skill}</h4>
                    <Badge className={getBadgeColor(assessment.badge)}>
                      <Trophy className="mr-1 h-3 w-3" />
                      {assessment.level}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Score</span>
                      <span className="font-bold">{assessment.score}/100</span>
                    </div>
                    <Progress value={assessment.score} className="h-2" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <BookOpen className="mr-2 h-3 w-3" />
                    View Certificate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
              <Zap className="mr-2 h-4 w-4" />
              Take New Assessment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-900">Action Items</h3>
              <p className="text-sm text-orange-700">Tasks to boost your job search success</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="border-orange-300 hover:bg-orange-100">
              <FileText className="mr-2 h-4 w-4" />
              Update Resume
            </Button>
            <Button variant="outline" className="border-orange-300 hover:bg-orange-100">
              <User className="mr-2 h-4 w-4" />
              Complete Profile
            </Button>
            <Button variant="outline" className="border-orange-300 hover:bg-orange-100">
              <MessageCircle className="mr-2 h-4 w-4" />
              Connect with Recruiters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};