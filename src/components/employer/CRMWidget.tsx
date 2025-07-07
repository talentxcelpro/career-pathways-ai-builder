import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageSquare, Calendar, FileText, Star, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CRMWidget = () => {
  const navigate = useNavigate();
  
  // Fetch pipeline stats
  const { data: pipelineStats } = useQuery({
    queryKey: ['pipeline-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      try {
        // Get stats for jobs posted by this user
        const { data: stats } = await supabase
          .from('job_applications')
          .select(`
            status,
            jobs!inner (
              posted_by
            )
          `)
          .eq('jobs.posted_by', user.id);

        if (!stats) return { newApplications: 0, inReview: 0, shortlisted: 0 };

        const newApplications = stats.filter(app => 
          ['applied', 'pending'].includes(app.status)
        ).length;
        
        const inReview = stats.filter(app => 
          ['reviewing', 'under_review'].includes(app.status)
        ).length;
        
        const shortlisted = stats.filter(app => 
          ['shortlisted', 'interviewed'].includes(app.status)
        ).length;

        return { newApplications, inReview, shortlisted };
      } catch (error) {
        console.error('Error fetching pipeline stats:', error);
        return { newApplications: 0, inReview: 0, shortlisted: 0 };
      }
    }
  });
  
  // Fetch recent applications for CRM
  const { data: recentApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['recent-applications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      try {
        // First try to get applications for jobs posted by this user directly
        const { data: directApplications } = await supabase
          .from('job_applications')
          .select(`
            id,
            status,
            applied_at,
            user_id,
            job_id,
            jobs (
              title,
              posted_by
            ),
            profiles (
              full_name,
              email,
              profile_picture_url
            )
          `)
          .eq('jobs.posted_by', user.id)
          .order('applied_at', { ascending: false })
          .limit(5);

        if (directApplications && directApplications.length > 0) {
          return directApplications;
        }

        // If no direct applications, try to get applications for company jobs
        const { data: userTeamMember } = await supabase
          .from('company_team_members')
          .select('company_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (!userTeamMember) return [];

        const { data: companyApplications } = await supabase
          .from('job_applications')
          .select(`
            id,
            status,
            applied_at,
            user_id,
            job_id,
            jobs (
              title,
              company_id
            ),
            profiles (
              full_name,
              email,
              profile_picture_url
            )
          `)
          .eq('jobs.company_id', userTeamMember.company_id)
          .order('applied_at', { ascending: false })
          .limit(5);

        return companyApplications || [];
      } catch (error) {
        console.error('Error fetching recent applications:', error);
        return [];
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Applications */}
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Recent Applications</CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Latest candidate applications
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs font-semibold"
              onClick={() => navigate('/employer/crm/candidates')}
            >
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {applicationsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg animate-pulse">
                  <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentApplications && recentApplications.length > 0 ? (
            recentApplications.map((application: any) => (
              <div 
                key={application.id}
                className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/jobs/manage/${application.job_id}/applicants/${application.user_id}`)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={application.profiles?.profile_picture_url} />
                  <AvatarFallback className="text-xs">
                    {application.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">
                      {application.profiles?.full_name || 'Unknown Candidate'}
                    </h4>
                    <Badge className={`text-xs ${getStatusColor(application.status)}`}>
                      {application.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600 truncate">
                      Applied for {application.jobs?.title}
                    </p>
                    <span className="text-xs text-slate-500">
                      {new Date(application.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">No recent applications</p>
            </div>
          )}
          
          <div className="pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <div 
                className="flex items-center justify-center gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                onClick={() => navigate('/employer/crm/candidates')}
              >
                <span className="text-sm font-semibold text-blue-700">All Candidates</span>
                <Users className="h-3 w-3 text-blue-700" />
              </div>
              <div 
                className="flex items-center justify-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => navigate('/employer/crm/notes')}
              >
                <span className="text-sm font-semibold text-slate-700">Notes</span>
                <FileText className="h-3 w-3 text-slate-700" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Pipeline */}
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Hiring Pipeline</CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Track your recruitment process
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Pipeline Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-700">
                {pipelineStats?.newApplications || 0}
              </div>
              <div className="text-xs text-blue-600">New Applications</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-700">
                {pipelineStats?.inReview || 0}
              </div>
              <div className="text-xs text-yellow-600">In Review</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-700">
                {pipelineStats?.shortlisted || 0}
              </div>
              <div className="text-xs text-green-600">Shortlisted</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => navigate('/employer/crm/reminders')}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Set Reminder
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => navigate('/employer/crm/email-template')}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Send Email
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">Recent Activity</h4>
            <div className="space-y-2">
              {[
                { action: 'Reviewed application', candidate: 'John Doe', time: '2h ago' },
                { action: 'Shortlisted candidate', candidate: 'Jane Smith', time: '4h ago' },
                { action: 'Scheduled interview', candidate: 'Mike Wilson', time: '1d ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-slate-50 rounded text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-slate-700">
                      {activity.action} for <span className="font-medium">{activity.candidate}</span>
                    </p>
                    <p className="text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};