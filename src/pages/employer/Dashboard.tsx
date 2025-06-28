import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Users, TrendingUp, Calendar, Plus, BarChart3, Building2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CandidatePipelineWidget } from "@/components/employer/dashboard/CandidatePipelineWidget";
import { SmartNotificationsPanel } from "@/components/employer/dashboard/SmartNotificationsPanel";
import { JobStatusBreakdown } from "@/components/employer/dashboard/JobStatusBreakdown";
import { TodaysActivitySummary } from "@/components/employer/dashboard/TodaysActivitySummary";
import { TopPerformingJobsWidget } from "@/components/employer/dashboard/TopPerformingJobsWidget";
import { ConversionRateWidget } from "@/components/employer/dashboard/ConversionRateWidget";
import { JobExpiryWidget } from "@/components/employer/dashboard/JobExpiryWidget";
import { SourceAttributionWidget } from "@/components/employer/dashboard/SourceAttributionWidget";
import { CandidateInboxWidget } from "@/components/employer/dashboard/CandidateInboxWidget";
import { TeamManagementWidget } from "@/components/employer/dashboard/TeamManagementWidget";
import { SharedNotesWidget } from "@/components/employer/dashboard/SharedNotesWidget";
import { InterviewSchedulingWidget } from "@/components/employer/dashboard/InterviewSchedulingWidget";
import { AIScreeningWidget } from "@/components/employer/dashboard/AIScreeningWidget";
import { SmartJobOptimizationWidget } from "@/components/employer/dashboard/SmartJobOptimizationWidget";
import { AutomatedWorkflowWidget } from "@/components/employer/dashboard/AutomatedWorkflowWidget";
import { PredictiveAnalyticsWidget } from "@/components/employer/dashboard/PredictiveAnalyticsWidget";
import { CandidatePipelineAnalyticsWidget } from "@/components/employer/dashboard/CandidatePipelineAnalyticsWidget";
import { SmartRecruitmentMetricsWidget } from "@/components/employer/dashboard/SmartRecruitmentMetricsWidget";
import { IntegrationHubWidget } from "@/components/employer/dashboard/IntegrationHubWidget";
import { AdvancedAutomationRulesWidget } from "@/components/employer/dashboard/AdvancedAutomationRulesWidget";

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  interviewsThisWeek: number;
  jobsPostedThisMonth: number;
}

const EmployerDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['employer-dashboard-stats'],
    queryFn: async () => {
      try {
        // Enhanced mock data for comprehensive dashboard
        return {
          activeJobs: 8,
          totalApplications: 156,
          interviewsThisWeek: 12,
          jobsPostedThisMonth: 5
        } as DashboardStats;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          activeJobs: 0,
          totalApplications: 0,
          interviewsThisWeek: 0,
          jobsPostedThisMonth: 0
        } as DashboardStats;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const statsCards = [
    {
      title: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      description: "Currently open positions",
      action: () => navigate('/jobs/manage'),
      color: "text-blue-600",
      change: "+2 this week"
    },
    {
      title: "Total Applications",
      value: stats?.totalApplications || 0,
      icon: Users,
      description: "Applications received",
      action: () => navigate('/employer/crm/candidates'),
      color: "text-green-600",
      change: "+34 this week"
    },
    {
      title: "Interviews This Week",
      value: stats?.interviewsThisWeek || 0,
      icon: Calendar,
      description: "Scheduled interviews",
      action: () => navigate('/employer/crm/candidates'),
      color: "text-purple-600",
      change: "+5 scheduled"
    },
    {
      title: "Jobs Posted This Month",
      value: stats?.jobsPostedThisMonth || 0,
      icon: TrendingUp,
      description: "New postings",
      action: () => navigate('/jobs/post'),
      color: "text-orange-600",
      change: "+2 this month"
    }
  ];

  const quickActions = [
    {
      title: "Post New Job",
      description: "Create a new job posting",
      icon: Plus,
      action: () => navigate('/jobs/post'),
      primary: true,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Manage Jobs",
      description: "View and edit your job postings",
      icon: Briefcase,
      action: () => navigate('/jobs/manage'),
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "View Analytics",
      description: "Track job performance",
      icon: BarChart3,
      action: () => navigate('/employer/analytics'),
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Company Profile",
      description: "Manage company information",
      icon: Building2,
      action: () => navigate('/employer/profile'),
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Employer Dashboard</h1>
              <p className="text-sm text-slate-600 font-medium">Manage your hiring pipeline and track performance</p>
            </div>
            <Button onClick={() => navigate('/jobs/post')} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm" onClick={stat.action}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color.includes('blue') ? 'from-blue-500 to-cyan-500' : stat.color.includes('green') ? 'from-green-500 to-emerald-500' : stat.color.includes('purple') ? 'from-purple-500 to-violet-500' : 'from-orange-500 to-red-500'}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <p className="text-xs text-slate-500 font-medium mb-2">{stat.description}</p>
                    <p className="text-xs text-green-600 font-semibold">{stat.change}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Phase 1 Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-2">
              <CandidatePipelineWidget />
            </div>
            <div>
              <SmartNotificationsPanel />
            </div>
            <div>
              <TodaysActivitySummary />
            </div>
          </div>

          {/* Phase 2: Advanced Analytics & Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div>
              <TopPerformingJobsWidget />
            </div>
            <div>
              <ConversionRateWidget />
            </div>
            <div>
              <JobExpiryWidget />
            </div>
          </div>

          {/* Phase 3: Collaboration & Communication */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <div>
              <CandidateInboxWidget />
            </div>
            <div>
              <TeamManagementWidget />
            </div>
            <div>
              <SharedNotesWidget />
            </div>
            <div>
              <InterviewSchedulingWidget />
            </div>
          </div>

          {/* Phase 4: AI-Powered Features & Automation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <div>
              <AIScreeningWidget />
            </div>
            <div>
              <SmartJobOptimizationWidget />
            </div>
            <div>
              <AutomatedWorkflowWidget />
            </div>
            <div>
              <PredictiveAnalyticsWidget />
            </div>
          </div>

          {/* Phase 5: Advanced Integration & Workflow Automation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <div>
              <CandidatePipelineAnalyticsWidget />
            </div>
            <div>
              <SmartRecruitmentMetricsWidget />
            </div>
            <div>
              <IntegrationHubWidget />
            </div>
            <div>
              <AdvancedAutomationRulesWidget />
            </div>
          </div>

          {/* Source Attribution & Job Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SourceAttributionWidget />
            </div>
            <JobStatusBreakdown />
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Quick Actions</CardTitle>
              <CardDescription className="text-sm text-slate-600">Streamline your hiring process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <div 
                      key={index} 
                      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 p-4 rounded-lg bg-slate-50/50 hover:bg-slate-100/50" 
                      onClick={action.action}
                    >
                      <div className={`mx-auto p-3 rounded-lg ${action.color || 'bg-gray-600'} w-fit mb-3`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-semibold text-slate-800 mb-1">{action.title}</h3>
                        <p className="text-xs text-slate-600">{action.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Recent Activity */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Recent Hiring Activity</CardTitle>
              <CardDescription className="text-sm text-slate-600">Latest updates across all your job postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Senior Frontend Developer</p>
                    <p className="text-sm text-slate-600">8 new applications received today</p>
                    <p className="text-xs text-slate-500 font-medium">2 hours ago</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate('/jobs/manage')}>
                    Review
                  </Button>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-green-50/50 rounded-lg border border-green-100">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Product Manager Interview</p>
                    <p className="text-sm text-slate-600">Sarah Johnson confirmed for 2:00 PM today</p>
                    <p className="text-xs text-slate-500 font-medium">1 hour ago</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate('/employer/crm/candidates')}>
                    Prepare
                  </Button>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">UX Designer Position</p>
                    <p className="text-sm text-slate-600">Trending: 145% above average views this week</p>
                    <p className="text-xs text-slate-500 font-medium">5 hours ago</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate('/employer/analytics')}>
                    Analyze
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
