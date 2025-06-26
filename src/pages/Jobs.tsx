import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Target, Bell, TrendingUp, Building, Star, Search, MapPin, Filter, Heart, Eye, Users, Clock, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface JobFilters {
  location: string;
  jobType: string;
  experience: string;
  salary: string;
  remote: boolean;
  category: string;
}

const Jobs = () => {
  const navigate = useNavigate();
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

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', searchTerm, filters, sortBy],
    queryFn: async () => {
      console.log('Fetching jobs with filters:', { searchTerm, filters, sortBy });
      
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
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply filters
      if (filters.location.trim()) {
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
          query = query.order('salary_max', { ascending: false, nullsFirst: false });
          break;
        case 'views':
          query = query.order('views_count', { ascending: false, nullsFirst: false });
          break;
        case 'applications':
          query = query.order('applications_count', { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);
      
      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      
      console.log('Fetched jobs:', data?.length || 0);
      return data || [];
    }
  });

  const { data: featuredJobs = [] } = useQuery({
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
      
      if (error) {
        console.error('Error fetching featured jobs:', error);
        return [];
      }
      return data || [];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['job-stats'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const [
          { count: totalJobs },
          { count: remoteJobs },
          { count: featuredJobsCount },
          { count: savedJobs },
          { count: appliedJobs },
          { count: recommendations }
        ] = await Promise.all([
          supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('is_remote', true),
          supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_featured', true).eq('is_active', true),
          user ? supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id) : { count: 0 },
          user ? supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id) : { count: 0 },
          user ? supabase.from('job_recommendations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_viewed', false) : { count: 0 }
        ]);

        return { 
          totalJobs: totalJobs || 0, 
          remoteJobs: remoteJobs || 0, 
          featuredJobsCount: featuredJobsCount || 0, 
          savedJobs: savedJobs || 0, 
          appliedJobs: appliedJobs || 0, 
          recommendations: recommendations || 0 
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return { totalJobs: 0, remoteJobs: 0, featuredJobsCount: 0, savedJobs: 0, appliedJobs: 0, recommendations: 0 };
      }
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['job-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .eq('is_active', true)
        .limit(10);
      
      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
      return data || [];
    }
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      location: '',
      jobType: '',
      experience: '',
      salary: '',
      remote: false,
      category: ''
    });
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const formatSalary = (job: any) => {
    if (job.salary_min && job.salary_max) {
      return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`;
    }
    if (job.salary_min) {
      return `$${job.salary_min.toLocaleString()}+`;
    }
    return null;
  };

  const formatEmploymentType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'full_time': 'Full-time',
      'part_time': 'Part-time', 
      'contract': 'Contract',
      'freelance': 'Freelance',
      'internship': 'Internship'
    };
    return typeMap[type] || type;
  };

  const formatExperienceLevel = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'entry_level': 'Entry Level',
      'mid_level': 'Mid Level',
      'senior_level': 'Senior Level',
      'executive': 'Executive'
    };
    return levelMap[level] || level;
  };

  console.log('Jobs page render:', { jobsCount: jobs.length, isLoading, featuredCount: featuredJobs.length });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Find Your Dream Job</h1>
              <p className="text-gray-600 mt-2">
                Discover {stats?.totalJobs || 0} opportunities from top companies
              </p>
            </div>
            <Button asChild>
              <Link to="/jobs/post">
                <Building className="h-4 w-4 mr-2" />
                Post a Job
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
                <div className="text-sm text-gray-500">Active Jobs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{stats?.remoteJobs || 0}</div>
                <div className="text-sm text-gray-500">Remote Jobs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold">{stats?.featuredJobsCount || 0}</div>
                <div className="text-sm text-gray-500">Featured</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Building className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-sm text-gray-500">Categories</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Access Cards */}
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
        {featuredJobs.length > 0 && (
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

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold">Browse by Category</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 10).map((category: any) => (
                <Badge
                  key={category.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => navigate(`/jobs/categories?category=${category.slug}`)}
                >
                  {category.name}
                </Badge>
              ))}
              {categories.length > 10 && (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate('/jobs/categories')}
                >
                  +{categories.length - 10} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Job title, company, or keywords"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="relative flex-1 md:max-w-xs">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.jobType || 'all'} onValueChange={(value) => setFilters({ ...filters, jobType: value === 'all' ? '' : value })}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={clearFilters} variant="outline">
                Clear
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Quick filters:</span>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => setFilters({ ...filters, remote: !filters.remote })}
                >
                  Remote
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => setFilters({ ...filters, jobType: 'full_time' })}
                >
                  Full-time
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => setFilters({ ...filters, experience: 'entry_level' })}
                >
                  Entry Level
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Tech
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sort and Results */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {jobs.length} jobs found
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
          
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Newest First</SelectItem>
                <SelectItem value="salary">Highest Salary</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="applications">Least Competition</SelectItem>
              </SelectContent>
            </Select>
            
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
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg border p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            jobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleJobClick(job.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {job.companies?.logo_url && (
                        <img
                          src={job.companies.logo_url}
                          alt={job.companies.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold line-clamp-2">{job.title}</h3>
                            <p className="text-gray-600">{job.companies?.name}</p>
                          </div>
                          {job.is_featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span>{formatEmploymentType(job.employment_type)}</span>
                          {formatSalary(job) && (
                            <span className="text-green-600 font-medium">
                              {formatSalary(job)}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 line-clamp-2 mb-4">{job.description}</p>

                        {job.skills_required && Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills_required.slice(0, 5).map((skill: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills_required.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{job.skills_required.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {job.views_count || 0} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {job.applications_count || 0} applications
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Posted {job.posted_at ? formatDistanceToNow(new Date(job.posted_at)) + ' ago' : 'recently'}
                            </span>
                          </div>
                          
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/jobs/${job.id}`}>View Details</Link>
                            </Button>
                            <Button asChild size="sm">
                              <Link to={`/jobs/${job.id}/smart-apply`}>
                                <Sparkles className="h-3 w-3 mr-1" />
                                Smart Apply
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or removing some filters.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
