import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatsCard } from '@/components/ui/stats-card';
import { ActionCard } from '@/components/ui/action-card';
import { Sparkles, Target, Bell, TrendingUp, Building, Star, Search, MapPin, Filter, Heart, Eye, Users, Clock, DollarSign, Zap, BarChart3 } from 'lucide-react';
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

  const statsData = [
    {
      title: "Active Jobs",
      value: stats?.totalJobs || 0,
      subtitle: "Available positions",
      icon: TrendingUp,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Remote Jobs",
      value: stats?.remoteJobs || 0,
      subtitle: "Work from anywhere",
      icon: MapPin,
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Featured",
      value: stats?.featuredJobsCount || 0,
      subtitle: "Premium listings",
      icon: Star,
      gradient: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Companies",
      value: categories.length,
      subtitle: "Hiring actively",
      icon: Building,
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  const quickActions = [
    {
      title: "AI Job Matching",
      description: "Get personalized recommendations",
      icon: Sparkles,
      path: "/jobs/recommendations",
      gradient: "from-blue-500 to-purple-500",
      featured: true
    },
    {
      title: "Job Alerts",
      description: "Never miss an opportunity",
      icon: Bell,
      path: "/jobs/alerts",
      gradient: "from-green-500 to-teal-500"
    },
    {
      title: "Analytics",
      description: "Track your job search",
      icon: BarChart3,
      path: "/jobs/analytics",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Companies",
      description: "Explore top employers",
      icon: Building,
      path: "/jobs/companies",
      gradient: "from-orange-500 to-red-500"
    }
  ];

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

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Find Your Dream Job</h1>
            <p className="text-blue-100 text-sm">
              Discover {stats?.totalJobs || 0} opportunities from top companies
            </p>
          </div>
          <Button asChild variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            <Link to="/jobs/post">
              <Building className="h-4 w-4 mr-2" />
              Post a Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Job Search Tools
          </CardTitle>
          <CardDescription className="text-xs">
            Powerful tools to accelerate your job search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <ActionCard
                key={index}
                {...action}
                onClick={() => navigate(action.path)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-lg">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Featured Opportunities
                </CardTitle>
                <CardDescription className="text-xs">
                  Hand-picked jobs from top companies
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/jobs?featured=true">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredJobs.map((job: any) => (
                <Card key={job.id} className="hover:shadow-md transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {job.companies?.logo_url && (
                        <img
                          src={job.companies.logo_url}
                          alt={job.companies.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold line-clamp-2 mb-1">{job.title}</h3>
                        <p className="text-xs text-gray-600">{job.companies?.name}</p>
                        <p className="text-xs text-gray-500">{job.location}</p>
                        
                        <div className="flex gap-2 mt-3">
                          <Button asChild size="sm" className="flex-1 text-xs">
                            <Link to={`/jobs/${job.id}/smart-apply`}>
                              <Sparkles className="h-3 w-3 mr-1" />
                              Smart Apply
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
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

      {/* Search and Filters */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Job title, company, or keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            <div className="relative flex-1 md:max-w-xs">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="pl-10 text-sm"
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
            
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Quick filters:</span>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={filters.remote ? "default" : "outline"}
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setFilters({ ...filters, remote: !filters.remote })}
              >
                Remote
              </Button>
              <Button 
                variant={filters.jobType === 'full_time' ? "default" : "outline"}
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setFilters({ ...filters, jobType: filters.jobType === 'full_time' ? '' : 'full_time' })}
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Job Listings</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-xl animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job: any) => (
                <div 
                  key={job.id}
                  className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer bg-white/60 backdrop-blur-sm"
                  onClick={() => handleJobClick(job.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold">{job.title}</h3>
                        {job.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">Featured</Badge>
                        )}
                        {job.is_remote && (
                          <Badge variant="outline" className="text-xs">Remote</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{job.companies?.name}</p>
                      <p className="text-xs text-gray-500 mb-2">{job.location}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {formatSalary(job) && (
                          <span className="text-green-600 font-medium">{formatSalary(job)}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {job.views_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job.applications_count || 0} applied
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Heart className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/${job.id}/smart-apply`);
                          }}
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          Apply
                        </Button>
                      </div>
                      <Badge variant="secondary" className="text-xs text-center">
                        {job.employment_type?.replace('_', '-')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Jobs;
