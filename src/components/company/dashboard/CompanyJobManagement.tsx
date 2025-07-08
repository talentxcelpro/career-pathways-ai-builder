import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Eye, 
  Calendar, 
  MapPin,
  DollarSign,
  Edit3,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompanyJobManagementProps {
  company: any;
  userRole: string;
}

export const CompanyJobManagement: React.FC<CompanyJobManagementProps> = ({ company, userRole }) => {
  const [jobsTab, setJobsTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get company jobs
  const { data: companyJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['company-jobs', company?.id, jobsTab, searchTerm, statusFilter],
    queryFn: async () => {
      if (!company) return [];

      let query = supabase
        .from('jobs')
        .select(`
          *,
          job_applications!left(id)
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (jobsTab === 'active') {
        query = query.eq('is_active', true);
      } else if (jobsTab === 'closed') {
        query = query.eq('is_active', false);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(job => ({
        ...job,
        applications_count: job.job_applications?.length || 0
      })) || [];
    },
    enabled: !!company
  });

  // Get job analytics summary
  const { data: jobAnalytics } = useQuery({
    queryKey: ['company-job-analytics', company?.id],
    queryFn: async () => {
      if (!company) return null;

      const { data: jobStats, error } = await supabase
        .from('analytics_job_stats')
        .select(`
          *,
          jobs!inner(company_id)
        `)
        .eq('jobs.company_id', company.id)
        .gte('stat_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const totalViews = jobStats?.reduce((sum, stat) => sum + stat.views_count, 0) || 0;
      const totalApplications = jobStats?.reduce((sum, stat) => sum + stat.applications_count, 0) || 0;
      const totalHires = jobStats?.reduce((sum, stat) => sum + stat.hires_count, 0) || 0;

      return {
        totalViews,
        totalApplications,
        totalHires,
        conversionRate: totalApplications > 0 ? ((totalHires / totalApplications) * 100).toFixed(1) : 0
      };
    },
    enabled: !!company
  });

  const getJobStatusColor = (isActive: boolean, expiresAt?: string) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    if (expiresAt && new Date(expiresAt) < new Date()) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getJobStatusText = (isActive: boolean, expiresAt?: string) => {
    if (!isActive) return 'Closed';
    if (expiresAt && new Date(expiresAt) < new Date()) return 'Expired';
    return 'Active';
  };

  const filteredJobs = companyJobs?.filter(job => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return job.is_active;
    if (statusFilter === 'closed') return !job.is_active;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Job Management Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Job Management</h3>
          <p className="text-gray-600">Manage your job postings and track applications</p>
        </div>
        <Link to="/jobs/post">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Job Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{companyJobs?.length || 0}</div>
            <p className="text-xs text-blue-600">All time posted</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Job Views</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{jobAnalytics?.totalViews || 0}</div>
            <p className="text-xs text-green-600">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Applications</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{jobAnalytics?.totalApplications || 0}</div>
            <p className="text-xs text-purple-600">Total received</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{jobAnalytics?.conversionRate || 0}%</div>
            <p className="text-xs text-orange-600">Application to hire</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="active">Active Jobs</SelectItem>
            <SelectItem value="closed">Closed Jobs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Tabs */}
      <Tabs value={jobsTab} onValueChange={setJobsTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="closed">Closed Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Job Analytics</TabsTrigger>
        </TabsList>

        {/* Active Jobs Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Job Postings</CardTitle>
              <CardDescription>Manage your currently active job postings</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : filteredJobs && filteredJobs.length > 0 ? (
                <div className="space-y-4">
                  {filteredJobs
                    .filter(job => jobsTab === 'active' ? job.is_active : !job.is_active)
                    .map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{job.title}</h4>
                          <Badge className={getJobStatusColor(job.is_active, job.expires_at)}>
                            {getJobStatusText(job.is_active, job.expires_at)}
                          </Badge>
                          {job.employment_type && (
                            <Badge variant="outline">{job.employment_type}</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </div>
                          )}
                          {job.salary_min && job.salary_max && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ₹{job.salary_min} - ₹{job.salary_max}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job.applications_count} applications
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {job.views_count || 0} views
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(job.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link to={`/jobs/${job.id}/applicants`}>
                          <Button size="sm" variant="outline">
                            <Users className="h-4 w-4 mr-1" />
                            View Applicants
                          </Button>
                        </Link>
                        <Link to={`/jobs/edit/${job.id}`}>
                          <Button size="sm" variant="outline">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {jobsTab === 'active' ? 'No Active Jobs' : 'No Closed Jobs'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {jobsTab === 'active' 
                      ? 'Start by posting your first job to attract candidates'
                      : 'Closed jobs will appear here when you deactivate them'
                    }
                  </p>
                  {jobsTab === 'active' && (
                    <Link to="/jobs/post">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Closed Jobs Tab */}
        <TabsContent value="closed">
          <Card>
            <CardHeader>
              <CardTitle>Closed Job Postings</CardTitle>
              <CardDescription>View your previously closed job postings</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : filteredJobs?.filter(job => !job.is_active).length > 0 ? (
                <div className="space-y-4">
                  {filteredJobs
                    .filter(job => !job.is_active)
                    .map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-700">{job.title}</h4>
                          <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job.applications_count} applications
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Closed {new Date(job.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                        <Button size="sm" variant="outline">
                          Repost
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Closed Jobs</h3>
                  <p className="text-gray-600">Closed jobs will appear here when you deactivate them</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Job Performance Analytics</CardTitle>
              <CardDescription>Detailed insights into your job posting performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Advanced Job Analytics Coming Soon</h3>
                <p className="text-gray-600">
                  Track application rates, source attribution, candidate quality, and hiring funnel performance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};