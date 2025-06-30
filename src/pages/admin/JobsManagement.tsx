
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Briefcase, 
  Search, 
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Building2,
  Users,
  DollarSign
} from 'lucide-react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { ExportButton } from '@/components/admin/ExportButton';

const JobsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['admin-jobs', searchTerm, statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies(name, logo_url),
          profiles!jobs_posted_by_fkey(full_name)
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
        { count: featuredJobs },
        { count: expiredJobs }
      ] = await Promise.all([
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).lt('expires_at', new Date().toISOString())
      ]);

      return {
        totalJobs: totalJobs || 0,
        activeJobs: activeJobs || 0,
        featuredJobs: featuredJobs || 0,
        expiredJobs: expiredJobs || 0
      };
    }
  });

  const filteredJobs = jobs || [];

  const getJobStatusColor = (job: any) => {
    if (!job.is_active) return 'bg-red-100 text-red-800';
    if (job.expires_at && new Date(job.expires_at) < new Date()) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getJobStatusText = (job: any) => {
    if (!job.is_active) return 'Inactive';
    if (job.expires_at && new Date(job.expires_at) < new Date()) return 'Expired';
    return 'Active';
  };

  return (
    <UnifiedAdminLayout 
      title="Jobs Management" 
      description="Manage job postings and categories"
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
                <Briefcase className="h-8 w-8 text-green-600" />
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
                <Briefcase className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Featured Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{jobStats?.featuredJobs?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Expired Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{jobStats?.expiredJobs?.toLocaleString() || '0'}</p>
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
              <ExportButton 
                data={filteredJobs} 
                filename="jobs-export" 
                format="csv"
              />
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs ({filteredJobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                          {job.companies?.logo_url ? (
                            <img src={job.companies.logo_url} alt="Company" className="w-8 h-8 rounded" />
                          ) : (
                            <Building2 className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <Badge className={getJobStatusColor(job)}>
                              {getJobStatusText(job)}
                            </Badge>
                            {job.is_featured && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.companies?.name || 'Unknown Company'}
                            </div>
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Posted {new Date(job.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {job.applications_count || 0} applications
                            </div>
                            {job.salary_min && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {job.salary_currency} {job.salary_min?.toLocaleString()}
                                {job.salary_max && ` - ${job.salary_max.toLocaleString()}`}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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
