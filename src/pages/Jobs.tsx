
import React, { useState, useEffect } from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import { JobSearch } from '@/components/jobs/JobSearch';
import { JobFilters } from '@/components/jobs/JobFilters';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, TrendingUp, MapPin, DollarSign, Users, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Jobs() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('posted_at');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employment_type: [] as string[],
    experience_level: [] as string[],
    salary_min: 0,
    salary_max: 500000,
    is_remote: false,
    skills: [] as string[],
    category_id: ''
  });

  // Fetch job categories
  const { data: categories = [] } = useQuery({
    queryKey: ['job-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch jobs with filters
  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['jobs', filters, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry,
            location
          ),
          job_categories (
            name,
            slug
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.employment_type.length > 0) {
        query = query.in('employment_type', filters.employment_type);
      }
      
      if (filters.experience_level.length > 0) {
        query = query.in('experience_level', filters.experience_level);
      }
      
      if (filters.salary_min > 0) {
        query = query.gte('salary_min', filters.salary_min);
      }
      
      if (filters.salary_max < 500000) {
        query = query.lte('salary_max', filters.salary_max);
      }
      
      if (filters.is_remote) {
        query = query.eq('is_remote', true);
      }
      
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.skills.length > 0) {
        query = query.overlaps('skills_required', filters.skills);
      }

      // Apply sorting
      switch (sortBy) {
        case 'posted_at':
          query = query.order('posted_at', { ascending: false });
          break;
        case 'salary_max':
          query = query.order('salary_max', { ascending: false });
          break;
        case 'views_count':
          query = query.order('views_count', { ascending: false });
          break;
        case 'applications_count':
          query = query.order('applications_count', { ascending: true });
          break;
        default:
          query = query.order('posted_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch saved jobs
  useEffect(() => {
    const fetchSavedJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', user.id);

      if (data) {
        setSavedJobs(data.map(item => item.job_id));
      }
    };

    fetchSavedJobs();
  }, []);

  // Save/unsave job mutation
  const saveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const isSaved = savedJobs.includes(jobId);
      
      if (isSaved) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);
        if (error) throw error;
        return { action: 'removed', jobId };
      } else {
        const { error } = await supabase
          .from('saved_jobs')
          .insert({
            user_id: user.id,
            job_id: jobId
          });
        if (error) throw error;
        return { action: 'saved', jobId };
      }
    },
    onSuccess: ({ action, jobId }) => {
      if (action === 'saved') {
        setSavedJobs(prev => [...prev, jobId]);
        toast.success('Job saved successfully');
      } else {
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        toast.success('Job removed from saved');
      }
    },
    onError: (error) => {
      toast.error('Failed to save job');
      console.error('Save job error:', error);
    }
  });

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      location: location
    }));
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      employment_type: [],
      experience_level: [],
      salary_min: 0,
      salary_max: 500000,
      is_remote: false,
      skills: [],
      category_id: ''
    });
    setSearchTerm('');
    setLocation('');
  };

  const handleSaveJob = (jobId: string) => {
    saveJobMutation.mutate(jobId);
  };

  const featuredJobs = jobs.filter(job => job.is_featured);
  const regularJobs = jobs.filter(job => !job.is_featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Find Your Dream Job</h1>
              <p className="text-gray-600 mt-2">
                Discover {jobs.length} opportunities from top companies
              </p>
            </div>
            <Button
              onClick={() => navigate('/jobs/post')}
              className="hidden md:flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post a Job
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{jobs.length}</div>
                <div className="text-sm text-gray-500">Active Jobs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{jobs.filter(j => j.is_remote).length}</div>
                <div className="text-sm text-gray-500">Remote Jobs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold">{featuredJobs.length}</div>
                <div className="text-sm text-gray-500">Featured</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-sm text-gray-500">Categories</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search */}
        <JobSearch
          searchTerm={searchTerm}
          location={location}
          onSearchChange={setSearchTerm}
          onLocationChange={setLocation}
          onSearch={handleSearch}
          onToggleFilters={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />

        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold">Browse by Category</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 10).map((category) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <JobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
              categories={categories}
            />
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {/* Sort and Results */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {isLoading ? 'Loading...' : `${jobs.length} jobs found`}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="posted_at">Newest First</SelectItem>
                  <SelectItem value="salary_max">Highest Salary</SelectItem>
                  <SelectItem value="views_count">Most Viewed</SelectItem>
                  <SelectItem value="applications_count">Least Competition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Featured Jobs */}
            {featuredJobs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-yellow-500" />
                  Featured Jobs
                </h2>
                <div className="space-y-4">
                  {featuredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSave={handleSaveJob}
                      isSaved={savedJobs.includes(job.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Jobs */}
            {regularJobs.length > 0 && (
              <div>
                {featuredJobs.length > 0 && (
                  <h2 className="text-xl font-semibold mb-4">All Jobs</h2>
                )}
                <div className="space-y-4">
                  {regularJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSave={handleSaveJob}
                      isSaved={savedJobs.includes(job.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && jobs.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or removing some filters.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
