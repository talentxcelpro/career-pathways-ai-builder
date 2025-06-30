
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Briefcase, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Calendar,
  MapPin,
  Building2,
  DollarSign
} from 'lucide-react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { ExportButton } from '@/components/admin/ExportButton';

const JobsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['admin-jobs', searchTerm, statusFilter, locationFilter],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url
          ),
          profiles!jobs_posted_by_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          query = query.eq('is_active', true);
        } else if (statusFilter === 'inactive') {
          query = query.eq('is_active', false);
        }
      }

      if (locationFilter !== 'all') {
        if (locationFilter === 'remote') {
          query = query.eq('is_remote', true);
        } else if (locationFilter === 'onsite') {
          query = query.eq('is_remote', false);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: jobStats } = useQuery({
    queryKey: ['job-stats'],
    queryFn: async () => {
      const [
        { count: totalJobs },
        { count: activeJobs },
        { count: remoteJobs },
        { count: featuredJobs }
      ] = await Promise.all([
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_remote', true),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_featured', true)
      ]);

      return {
        totalJobs: totalJobs || 0,
        activeJobs: activeJobs || 0,
        remoteJobs: remoteJobs || 0,
        featuredJobs: featuredJobs || 0
      };
    }
  });

  const toggleJobStatus = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: isActive })
        .eq('id', jobId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Job status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update job status');
    }
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ jobId, isFeatured }: { jobId: string; isFeatured: boolean }) => {
      const { error } = await supabase
        .from('jobs')
        .update({ is_featured: isFeatured })
        .eq('id', jobId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Job featured status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update featured status');
    }
  });

  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Job deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete job');
    }
  });

  const getStatusColor = (job: any) => {
    if (!job.is_active) return 'bg-red-100 text-red-800';
    if (job.expires_at && new Date(job.expires_at) < new Date()) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (job: any) => {
    if (!job.is_active) return 'Inactive';
    if (job.expires_at && new Date(job.expires_at) < new Date()) return 'Expired';
    return 'Active';
  };

  return (
    <UnifiedAdminLayout 
      title="Jobs Management" 
      description="Manage job postings and monitor platform activity"
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{jobStats?.totalJobs?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{jobStats?.activeJobs?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Remote Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{jobStats?.remoteJobs?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Featured Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{jobStats?.featuredJobs?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
              </select>
              <ExportButton 
                data={jobs || []} 
                filename="jobs-export" 
                format="csv"
              />
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs ({jobs?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs?.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <Badge className={getStatusColor(job)}>
                            {getStatusText(job)}
                          </Badge>
                          {job.is_featured && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              Featured
                            </Badge>
                          )}
                          {job.is_remote && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Remote
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.companies?.name || 'No Company'}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location || 'Not specified'}
                          </div>
                          {job.salary_min && job.salary_max && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Applications: {job.applications_count || 0}</span>
                          <span>Views: {job.views_count || 0}</span>
                          <span>Posted by: {job.profiles?.full_name || 'Unknown'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleFeatured.mutate({ 
                            jobId: job.id, 
                            isFeatured: !job.is_featured 
                          })}
                        >
                          {job.is_featured ? 'Unfeature' : 'Feature'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleJobStatus.mutate({ 
                            jobId: job.id, 
                            isActive: !job.is_active 
                          })}
                        >
                          {job.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteJob.mutate(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UnifiedAdminLayout>
  );
};

export default JobsManagement;
