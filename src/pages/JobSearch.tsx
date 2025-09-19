import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Briefcase, Building, Star, Heart, Bookmark, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useJobsOptimized } from '@/hooks/useJobsOptimized';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const JobSearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employment_type: [] as string[],
    experience_level: [] as string[],
    salary_min: 0,
    salary_max: 0,
    is_remote: false,
    skills: [] as string[],
  });
  
  const [sortBy, setSortBy] = useState('posted_at');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const { 
    jobs, 
    totalCount, 
    isLoading, 
    refetch 
  } = useJobsOptimized(filters, sortBy);

  // Load saved and applied jobs for authenticated users
  useEffect(() => {
    if (user) {
      loadUserJobData();
    }
  }, [user]);

  const loadUserJobData = async () => {
    if (!user) return;

    try {
      // Load saved jobs
      const { data: savedData } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', user.id);
      
      if (savedData) {
        setSavedJobs(savedData.map(item => item.job_id));
      }

      // Load applied jobs
      const { data: appliedData } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('user_id', user.id);
      
      if (appliedData) {
        setAppliedJobs(appliedData.map(item => item.job_id));
      }
    } catch (error) {
      console.error('Error loading user job data:', error);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    if (!user) {
      toast.error('Please login to save jobs');
      navigate('/auth');
      return;
    }

    try {
      if (savedJobs.includes(jobId)) {
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);
        
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        toast.success('Job removed from saved');
      } else {
        await supabase
          .from('saved_jobs')
          .insert({ user_id: user.id, job_id: jobId });
        
        setSavedJobs(prev => [...prev, jobId]);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error('Failed to update saved jobs');
    }
  };

  const handleApplyClick = (jobId: string) => {
    if (!user) {
      toast.error('Please login to apply for jobs');
      navigate('/auth');
      return;
    }
    navigate(`/jobs/${jobId}/apply`);
  };

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Not disclosed';
    if (min === max) return `₹${(min / 100000).toFixed(1)}L`;
    return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Search className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Job Search</h1>
            <Badge variant="secondary" className="ml-auto">
              {totalCount.toLocaleString()} Jobs Available
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, skills, companies..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <div className="relative min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Button onClick={() => refetch()} className="px-6">
              Search Jobs
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4" />
                  <h3 className="font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-xs"
                    onClick={() => setFilters({
                      search: '',
                      location: '',
                      employment_type: [],
                      experience_level: [],
                      salary_min: 0,
                      salary_max: 0,
                      is_remote: false,
                      skills: [],
                    })}
                  >
                    Clear All
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Employment Type */}
                  <div>
                    <h4 className="font-medium mb-3">Employment Type</h4>
                    <div className="space-y-2">
                      {['full-time', 'part-time', 'contract', 'freelance', 'internship'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={filters.employment_type.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters(prev => ({
                                  ...prev,
                                  employment_type: [...prev.employment_type, type]
                                }));
                              } else {
                                setFilters(prev => ({
                                  ...prev,
                                  employment_type: prev.employment_type.filter(t => t !== type)
                                }));
                              }
                            }}
                          />
                          <label htmlFor={type} className="text-sm capitalize cursor-pointer">
                            {type.replace('-', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <h4 className="font-medium mb-3">Experience Level</h4>
                    <Select
                      value={filters.experience_level[0] || ''}
                      onValueChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        experience_level: value ? [value] : [] 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Levels</SelectItem>
                        <SelectItem value="entry">Entry Level (0-1 years)</SelectItem>
                        <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-6 years)</SelectItem>
                        <SelectItem value="senior">Senior (6+ years)</SelectItem>
                        <SelectItem value="lead">Lead/Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <h4 className="font-medium mb-3">Salary Range (₹LPA)</h4>
                    <div className="space-y-3">
                      <Slider
                        value={[filters.salary_min / 100000, filters.salary_max / 100000 || 50]}
                        onValueChange={([min, max]) => setFilters(prev => ({
                          ...prev,
                          salary_min: min * 100000,
                          salary_max: max * 100000
                        }))}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>₹{Math.round(filters.salary_min / 100000)}L</span>
                        <span>₹{Math.round((filters.salary_max || 5000000) / 100000)}L</span>
                      </div>
                    </div>
                  </div>

                  {/* Remote Work */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remote"
                      checked={filters.is_remote}
                      onCheckedChange={(checked) => setFilters(prev => ({ 
                        ...prev, 
                        is_remote: checked as boolean 
                      }))}
                    />
                    <label htmlFor="remote" className="text-sm cursor-pointer">
                      Remote Work Only
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Results */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                Showing {jobs?.length || 0} of {totalCount} jobs
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="posted_at">Most Recent</SelectItem>
                  <SelectItem value="salary_max">Highest Salary</SelectItem>
                  <SelectItem value="views_count">Most Popular</SelectItem>
                  <SelectItem value="applications_count">Least Competition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading jobs...</p>
                </div>
              ) : jobs?.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria</p>
                </div>
              ) : (
                jobs?.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 
                              className="text-lg font-semibold text-primary hover:underline cursor-pointer"
                              onClick={() => navigate(`/jobs/${job.id}`)}
                            >
                              {job.title}
                            </h3>
                            {job.is_featured && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {job.company_name || job.companies?.name || 'Company'}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.employment_type}
                            </div>
                            {job.is_remote && (
                              <Badge variant="outline" className="text-xs">Remote</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {formatSalary(job.salary_min, job.salary_max)} • {job.experience_level}
                          </div>
                          
                          {/* Skills */}
                          {job.skills_required && job.skills_required.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {job.skills_required.slice(0, 6).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills_required.length > 6 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.skills_required.length - 6} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 ml-4">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(job.posted_at || job.created_at)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSaveJob(job.id)}
                              className="p-2"
                            >
                              {savedJobs.includes(job.id) ? (
                                <Bookmark className="h-4 w-4 fill-current" />
                              ) : (
                                <Heart className="h-4 w-4" />
                              )}
                            </Button>
                            {appliedJobs.includes(job.id) ? (
                              <Badge variant="secondary" className="text-xs">Applied</Badge>
                            ) : job.external_url ? (
                              <Button 
                                size="sm" 
                                onClick={() => window.open(job.external_url, '_blank')}
                                className="gap-1"
                              >
                                Apply
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleApplyClick(job.id)}
                              >
                                Apply Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Job Description Preview */}
                      {job.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description.substring(0, 200)}...
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;