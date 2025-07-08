import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Briefcase, 
  Plus, 
  Eye, 
  FileText, 
  Users, 
  Search,
  MapPin,
  DollarSign,
  Clock
} from 'lucide-react';

interface CompanyJobManagementProps {
  company: any;
  userRole: string;
}

export const CompanyJobManagement: React.FC<CompanyJobManagementProps> = ({ 
  company, 
  userRole 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: companyJobs, isLoading } = useQuery({
    queryKey: ['company-jobs', company?.id],
    queryFn: async () => {
      if (!company) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          job_applications(id, status)
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!company
  });

  const filteredJobs = companyJobs?.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalJobs = companyJobs?.length || 0;
  const activeJobs = companyJobs?.filter(job => job.is_active).length || 0;
  const totalApplications = companyJobs?.reduce((sum, job) => sum + (job.job_applications?.length || 0), 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-foreground">Job Management</h3>
          <p className="text-sm text-muted-foreground">Manage your job postings and applications</p>
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="h-3 w-3 mr-1" />
          <span className="text-xs">Post New Job</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Jobs</CardTitle>
            <Briefcase className="h-3 w-3 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">{activeJobs} currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Applications</CardTitle>
            <FileText className="h-3 w-3 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-success">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">Total received</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Success Rate</CardTitle>
            <Users className="h-3 w-3 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-accent-foreground">
              {totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 10) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Application rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
        <Input
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 text-xs h-8"
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-32 bg-muted/20 rounded-lg"></div>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold text-foreground">{job.title}</CardTitle>
                    <CardDescription className="text-sm flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {job.salary_min ? `$${job.salary_min.toLocaleString()}` : 'Competitive'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.employment_type || 'Full-time'}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={`text-xs border ${job.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-muted/20 text-muted-foreground border-muted/30'}`}>
                    {job.is_active ? 'active' : 'inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{job.views_count || 0} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{job.job_applications?.length || 0} applications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No Jobs Found</h3>
            <p className="text-muted-foreground mb-4">Start by posting your first job</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Job
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};