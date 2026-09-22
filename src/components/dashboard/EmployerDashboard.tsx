import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Search, 
  Plus, 
  BarChart3, 
  Target, 
  Clock,
  ChevronRight,
  Sparkles,
  MapPin,
  Video
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduledInterview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  date: string;
  time: string;
  mode: string;
  notes?: string;
  status: 'confirmed' | 'completed' | 'cancelled';
}

export function EmployerDashboard() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['employer-dashboard-real-data', user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          activeJobsCount: 0,
          totalApplicationsCount: 0,
          interviewsCount: 0,
          offersCount: 0,
          recentJobs: [],
          pipeline: { newApps: 0, underReview: 0, interviews: 0, offers: 0 },
          monthStats: { jobs: 0, applications: 0, interviews: 0, hires: 0 }
        };
      }

      // 1. Fetch real jobs posted by this user
      const { data: jobs, error: jErr } = await supabase
        .from('jobs')
        .select('id, title, location, employment_type, is_active, applications_count, views_count, created_at, company_name')
        .eq('posted_by', user.id)
        .order('created_at', { ascending: false });

      let userJobs = jobs || [];

      // Check if user is associated with a company
      const { data: teamData } = await supabase
        .from('company_team_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      const companyId = teamData && teamData.length > 0 ? teamData[0].company_id : null;

      if (userJobs.length === 0 && companyId) {
        const { data: companyJobs } = await supabase
          .from('jobs')
          .select('id, title, location, employment_type, is_active, applications_count, views_count, created_at, company_name')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });
        if (companyJobs) userJobs = companyJobs;
      }

      const activeJobs = userJobs.filter(j => j.is_active);
      const activeJobsCount = activeJobs.length;
      const jobIds = userJobs.map(j => j.id);

      // 2. Fetch real job applications if any jobs exist
      let realApps: any[] = [];
      if (jobIds.length > 0) {
        const { data: apps } = await supabase
          .from('job_applications')
          .select('id, job_id, status, applied_at')
          .in('job_id', jobIds);
        realApps = apps || [];
      }

      // Check localStorage for scheduled interviews
      let scheduledInterviewsCount = 0;
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('txc_scheduled_interviews');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            scheduledInterviewsCount = Array.isArray(parsed) ? parsed.length : 0;
          } catch (e) {}
        }
      }

      // Real pipeline counts
      const newApps = realApps.filter(a => !a.status || a.status === 'pending' || a.status === 'applied').length;
      const underReview = realApps.filter(a => a.status === 'reviewed' || a.status === 'screening').length;
      const interviews = realApps.filter(a => a.status === 'interviewed' || a.status === 'interview').length + scheduledInterviewsCount;
      const offers = realApps.filter(a => a.status === 'offer' || a.status === 'hired').length;
      const hires = realApps.filter(a => a.status === 'hired').length;

      // Real total applications
      const totalApplicationsCount = realApps.length > 0
        ? realApps.length
        : userJobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);

      // Month stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

      const jobsThisMonth = userJobs.filter(j => j.created_at && j.created_at >= thirtyDaysAgoIso).length;
      const appsThisMonth = realApps.filter(a => a.applied_at && a.applied_at >= thirtyDaysAgoIso).length;

      return {
        activeJobsCount,
        totalApplicationsCount,
        interviewsCount: interviews,
        offersCount: offers,
        recentJobs: userJobs.slice(0, 3),
        pipeline: {
          newApps,
          underReview,
          interviews,
          offers
        },
        monthStats: {
          jobs: jobsThisMonth,
          applications: appsThisMonth,
          interviews,
          hires
        }
      };
    }
  });

  // Read scheduled interviews for Upcoming list
  const scheduledInterviews: ScheduledInterview[] = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('txc_scheduled_interviews');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed.slice(0, 3);
        } catch (e) {}
      }
    }
    return [];
  }, [dashboardData]);

  const activeJobs = dashboardData?.activeJobsCount ?? 0;
  const totalApps = dashboardData?.totalApplicationsCount ?? 0;
  const interviewsCount = dashboardData?.interviewsCount ?? 0;
  const offersCount = dashboardData?.offersCount ?? 0;
  const recentJobs = dashboardData?.recentJobs ?? [];
  const pipeline = dashboardData?.pipeline ?? { newApps: 0, underReview: 0, interviews: 0, offers: 0 };
  const monthStats = dashboardData?.monthStats ?? { jobs: 0, applications: 0, interviews: 0, hires: 0 };

  const pipelineBase = Math.max(1, totalApps);
  const newAppsPercent = Math.min(100, Math.round((pipeline.newApps / pipelineBase) * 100));
  const reviewPercent = Math.min(100, Math.round((pipeline.underReview / pipelineBase) * 100));
  const interviewPercent = Math.min(100, Math.round((pipeline.interviews / pipelineBase) * 100));
  const offersPercent = Math.min(100, Math.round((pipeline.offers / pipelineBase) * 100));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Employer Dashboard</h1>
          <p className="text-sm text-slate-600">
            Manage your hiring pipeline, review candidates, and grow your team.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm">
            <Link to="/jobs/post">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold">
            <Link to="/jobs/post/ai">
              <Sparkles className="h-4 w-4 mr-2 text-emerald-600" />
              AI Job Composer
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/jobs/manage" className="block group">
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all border-slate-200">
                <CardContent className="p-4 text-center">
                  <Briefcase className="h-8 w-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-slate-900">
                    {isLoading ? '—' : activeJobs}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 flex items-center justify-center gap-0.5 mt-0.5">
                    Active Jobs <ChevronRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/employer/applications" className="block group">
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all border-slate-200">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-slate-900">
                    {isLoading ? '—' : totalApps}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 group-hover:text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">
                    Applications <ChevronRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/employer/interview/schedule" className="block group">
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all border-slate-200">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-slate-900">
                    {isLoading ? '—' : interviewsCount}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 group-hover:text-purple-600 flex items-center justify-center gap-0.5 mt-0.5">
                    Interviews <ChevronRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/employer/applications" className="block group">
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all border-slate-200">
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-slate-900">
                    {isLoading ? '—' : offersCount}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 group-hover:text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                    Offers <ChevronRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Actions */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button asChild className="h-20 flex-col gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
                  <Link to="/jobs/post">
                    <Plus className="h-5 w-5" />
                    <span className="text-xs font-bold">Post Job</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 hover:bg-slate-50 hover:border-blue-300 rounded-xl">
                  <Link to="/employer/crm/candidates">
                    <Search className="h-5 w-5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Search Candidates</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 hover:bg-slate-50 hover:border-emerald-300 rounded-xl">
                  <Link to="/employer/applications">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">Review Applications</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 hover:bg-slate-50 hover:border-purple-300 rounded-xl">
                  <Link to="/employer/interview/schedule">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="text-xs font-bold text-slate-700">Schedule Interviews</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 hover:bg-slate-50 hover:border-amber-300 rounded-xl">
                  <Link to="/employer/analytics">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                    <span className="text-xs font-bold text-slate-700">View Analytics</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 hover:bg-slate-50 hover:border-slate-400 rounded-xl">
                  <Link to="/employer/profile">
                    <Building2 className="h-5 w-5 text-slate-700" />
                    <span className="text-xs font-bold text-slate-700">Company Profile</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Job Posts */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Recent Job Posts
                </span>
                <Button asChild variant="outline" size="sm" className="rounded-lg text-xs font-semibold">
                  <Link to="/jobs/manage">View All →</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No jobs posted yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                    Create your first job posting to start attracting top talent and tracking real applications.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                      <Link to="/jobs/post">Post Job</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold">
                      <Link to="/jobs/post/ai">AI Composer</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <Link key={job.id} to="/jobs/manage" className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          {job.location && <><MapPin className="h-3 w-3 shrink-0" /> {job.location} • </>}
                          {job.employment_type || 'Full-time'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {job.applications_count || 0} Applications
                          </Badge>
                          <Badge variant="outline" className={job.is_active 
                            ? "text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "text-xs bg-slate-100 text-slate-600"
                          }>
                            {job.is_active ? 'Active' : 'Closed'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400">
                          {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recent'}
                        </p>
                        <span className="inline-flex items-center justify-center mt-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                          Manage →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Hiring Pipeline */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Hiring Pipeline
                </span>
                <Link to="/employer/applications" className="text-xs font-bold text-blue-600 hover:underline">
                  View All →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/employer/applications" className="block group">
                <div className="flex justify-between text-sm mb-1 font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  <span>New Applications</span>
                  <span>{pipeline.newApps}</span>
                </div>
                <Progress value={newAppsPercent} className="h-2" />
              </Link>
              <Link to="/employer/applications" className="block group">
                <div className="flex justify-between text-sm mb-1 font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  <span>Under Review</span>
                  <span>{pipeline.underReview}</span>
                </div>
                <Progress value={reviewPercent} className="h-2" />
              </Link>
              <Link to="/employer/interview/schedule" className="block group">
                <div className="flex justify-between text-sm mb-1 font-semibold text-slate-700 group-hover:text-purple-600 transition-colors">
                  <span>Interviews Scheduled</span>
                  <span>{pipeline.interviews}</span>
                </div>
                <Progress value={interviewPercent} className="h-2" />
              </Link>
              <Link to="/employer/applications" className="block group">
                <div className="flex justify-between text-sm mb-1 font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">
                  <span>Offers Extended</span>
                  <span>{pipeline.offers}</span>
                </div>
                <Progress value={offersPercent} className="h-2" />
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Upcoming Interviews
                </span>
                <Link to="/employer/interview/schedule" className="text-xs font-bold text-blue-600 hover:underline">
                  Schedule →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduledInterviews.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No upcoming interviews</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                    Schedule interviews with candidate applicants
                  </p>
                  <Button asChild size="sm" variant="outline" className="text-xs font-bold rounded-lg border-purple-200 text-purple-700 hover:bg-purple-50">
                    <Link to="/employer/interview/schedule">Schedule Interview</Link>
                  </Button>
                </div>
              ) : (
                scheduledInterviews.map((interview) => (
                  <Link key={interview.id} to="/employer/interview/schedule" className="block p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors truncate pr-2">
                        {interview.candidateName}
                      </h4>
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 shrink-0">
                        {interview.time}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Video className="h-3 w-3 text-purple-500 shrink-0" />
                      <span className="truncate">{interview.jobTitle} • {interview.mode}</span>
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/jobs/manage" className="flex justify-between items-center hover:text-blue-600 transition-colors py-1 border-b border-slate-100">
                <span className="text-sm text-slate-600">Jobs Posted</span>
                <span className="font-bold text-slate-900">{monthStats.jobs}</span>
              </Link>
              <Link to="/employer/applications" className="flex justify-between items-center hover:text-emerald-600 transition-colors py-1 border-b border-slate-100">
                <span className="text-sm text-slate-600">Applications</span>
                <span className="font-bold text-slate-900">{monthStats.applications}</span>
              </Link>
              <Link to="/employer/interview/schedule" className="flex justify-between items-center hover:text-purple-600 transition-colors py-1 border-b border-slate-100">
                <span className="text-sm text-slate-600">Interviews</span>
                <span className="font-bold text-slate-900">{monthStats.interviews}</span>
              </Link>
              <Link to="/employer/applications" className="flex justify-between items-center hover:text-amber-600 transition-colors py-1">
                <span className="text-sm text-slate-600">Hires</span>
                <span className="font-bold text-slate-900">{monthStats.hires}</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}