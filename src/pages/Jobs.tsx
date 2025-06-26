
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { JobsHeader } from '@/components/jobs/JobsHeader';
import { JobsCategories } from '@/components/jobs/JobsCategories';
import { JobSearch } from '@/components/jobs/JobSearch';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobsList } from '@/components/jobs/JobsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, Bell, TrendingUp, Building, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobFilters {
  location: string;
  jobType: string;
  experience: string;
  salary: string;
  remote: boolean;
  category: string;
}

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<JobFilters>({
    location: '',
    jobType: '',
    experience: '',
    salary: '',
    remote: false,
    category: ''
  });
  const [sortBy, setSortBy] = useState('latest');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', searchTerm, filters, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url,
            location
          )
        `)
        .eq('is_active', true);

      // Apply search
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply filters
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.jobType) {
        query = query.eq('employment_type', filters.jobType);
      }
      
      if (filters.experience) {
        query = query.eq('experience_level', filters.experience);
      }
      
      if (filters.remote) {
        query = query.eq('is_remote', true);
      }

      // Apply sorting
      switch (sortBy) {
        case 'latest':
          query = query.order('posted_at', { ascending: false });
          break;
        case 'salary':
          query = query.order('salary_max', { ascending: false, nullsLast: true });
          break;
        case 'views':
          query = query.order('views_count', { ascending: false, nullsLast: true });
          break;
        case 'applications':
          query = query.order('applications_count', { ascending: false, nullsLast: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: featuredJobs } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (name, logo_url)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['job-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const [
        { count: totalJobs },
        { count: savedJobs },
        { count: appliedJobs },
        { count: recommendations }
      ] = await Promise.all([
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
        user ? supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id) : { count: 0 },
        user ? supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id) : { count: 0 },
        user ? supabase.from('job_recommendations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_viewed', false) : { count: 0 }
      ]);

      return { totalJobs, savedJobs, appliedJobs, recommendations };
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <JobsHeader />
      
      {/* Quick Access Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
              <Sparkles className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.recommendations || 0}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Jobs matched for you
              </p>
              <Button asChild size="sm" className="w-full">
                <Link to="/jobs/recommendations">
                  <Sparkles className="h-3 w-3 mr-1" />
                  View Matches
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Alerts</CardTitle>
              <Bell className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground mb-3">
                Get notified instantly
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/jobs/alerts">
                  <Bell className="h-3 w-3 mr-1" />
                  Manage Alerts
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats?.appliedJobs || 0}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Applications sent
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/jobs/analytics">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  View Insights
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">Explore</div>
              <p className="text-xs text-muted-foreground mb-3">
                Top hiring companies
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/jobs/companies">
                  <Building className="h-3 w-3 mr-1" />
                  Browse All
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Featured Jobs */}
        {featuredJobs && featuredJobs.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Featured Jobs
                  </CardTitle>
                  <CardDescription>
                    Hand-picked opportunities from top companies
                  </CardDescription>
                </div>
                <Button asChild variant="outline">
                  <Link to="/jobs?featured=true">View All Featured</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredJobs.map((job: any) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {job.companies?.logo_url && (
                          <img
                            src={job.companies.logo_url}
                            alt={job.companies.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold line-clamp-2">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.companies?.name}</p>
                          <p className="text-sm text-gray-500">{job.location}</p>
                          
                          <div className="flex gap-2 mt-3">
                            <Button asChild size="sm" className="flex-1">
                              <Link to={`/jobs/${job.id}/smart-apply`}>
                                <Sparkles className="h-3 w-3 mr-1" />
                                Smart Apply
                              </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="flex-1">
                              <Link to={`/jobs/${job.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <JobsCategories />

        {/* Search and Filters */}
        <div className="mb-8">
          <JobSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          
          <JobFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {jobs?.length || 0} jobs found
            </span>
            {searchTerm && (
              <Badge variant="secondary">
                Searching: "{searchTerm}"
              </Badge>
            )}
            {Object.values(filters).some(v => v) && (
              <Badge variant="outline">
                Filters applied
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/jobs/saved">
                Saved ({stats?.savedJobs || 0})
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/jobs/applied">
                Applied ({stats?.appliedJobs || 0})
              </Link>
            </Button>
          </div>
        </div>

        {/* Jobs List */}
        <JobsList jobs={jobs || []} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Jobs;
