
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus, Search, Filter, MoreHorizontal, Users, Eye, Calendar } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  is_active: boolean;
  applications_count: number;
  views_count: number;
  created_at: string;
  companies: {
    name: string;
    logo_url?: string;
  };
}

const JobsManage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['employer-jobs', searchTerm, statusFilter],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // First try to get jobs posted directly by the user
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies(name, logo_url)
        `)
        .eq('posted_by', user.user.id);

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active');
      }

      const { data: userJobs, error: userJobsError } = await query.order('created_at', { ascending: false });
      
      if (userJobsError) throw userJobsError;

      // Also try to get jobs from company if user is part of a team
      let companyJobs = [];
      try {
        const { data: teamMember } = await supabase
          .from('company_team_members')
          .select('company_id')
          .eq('user_id', user.user.id)
          .eq('is_active', true)
          .single();

        if (teamMember) {
          let companyQuery = supabase
            .from('jobs')
            .select(`
              *,
              companies!inner(name, logo_url)
            `)
            .eq('company_id', teamMember.company_id);

          if (searchTerm) {
            companyQuery = companyQuery.ilike('title', `%${searchTerm}%`);
          }

          if (statusFilter !== 'all') {
            companyQuery = companyQuery.eq('is_active', statusFilter === 'active');
          }

          const { data: companyJobsData } = await companyQuery.order('created_at', { ascending: false });
          companyJobs = companyJobsData || [];
        }
      } catch (error) {
        console.log('No company team membership found');
      }

      // Combine and deduplicate jobs
      const allJobs = [...(userJobs || []), ...companyJobs];
      const uniqueJobs = allJobs.filter((job, index, self) => 
        index === self.findIndex(j => j.id === job.id)
      );

      return uniqueJobs as Job[];
    }
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">Closed</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="text-gray-600 mt-1">View and manage all your job postings</p>
        </div>
        <Button onClick={() => navigate('/jobs/post')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
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
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {jobs && jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      {getStatusBadge(job.is_active)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.companies?.name}
                      </span>
                      <span>{job.location}</span>
                      <span className="capitalize">{job.employment_type?.replace('_', ' ')}</span>
                      <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1 text-blue-600">
                        <Users className="h-4 w-4" />
                        <span>{job.applications_count || 0} applications</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <Eye className="h-4 w-4" />
                        <span>{job.views_count || 0} views</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {job.applications_count > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View Applications ({job.applications_count})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/manage/${job.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No jobs match your current filters. Try adjusting your search criteria.'
                  : 'You haven\'t posted any jobs yet. Create your first job posting to get started!'
                }
              </p>
              <Button onClick={() => navigate('/jobs/post')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Job
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobsManage;
