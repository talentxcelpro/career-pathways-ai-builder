
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JobsHeader } from "@/components/jobs/JobsHeader";
import { EnhancedJobFilters } from "@/components/jobs/EnhancedJobFilters";
import { JobsList } from "@/components/jobs/JobsList";
import { EmptyJobsState } from "@/components/jobs/EmptyJobsState";
import { JobsCategories } from "@/components/jobs/JobsCategories";

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState('');
  const [salaryRange, setSalaryRange] = useState([0, 1000000]);
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [sortBy, setSortBy] = useState('posted_at');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  // Get company filter from URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const companyParam = urlParams.get('company');
    if (companyParam) {
      setSelectedCompany(companyParam);
    }
  }, []);

  const { data: jobs, isLoading } = useQuery({
    queryKey: [
      'jobs', 
      searchQuery, 
      selectedLocation, 
      selectedCategory, 
      selectedEmploymentType, 
      selectedExperienceLevel, 
      salaryRange, 
      isRemoteOnly,
      selectedCompany
    ],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies!inner(
            id,
            name,
            logo_url,
            industry,
            location
          )
        `)
        .eq('is_active', true);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedLocation) {
        query = query.ilike('location', `%${selectedLocation}%`);
      }

      if (selectedEmploymentType) {
        query = query.eq('employment_type', selectedEmploymentType);
      }

      if (selectedExperienceLevel) {
        query = query.eq('experience_level', selectedExperienceLevel);
      }

      if (isRemoteOnly) {
        query = query.eq('is_remote', true);
      }

      if (selectedCompany) {
        query = query.eq('company_id', selectedCompany);
      }

      // Salary range filter
      if (salaryRange[0] > 0) {
        query = query.gte('salary_min', salaryRange[0]);
      }
      if (salaryRange[1] < 1000000) {
        query = query.lte('salary_max', salaryRange[1]);
      }

      const { data, error } = await query.order('posted_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedCategory('');
    setSelectedEmploymentType('');
    setSelectedExperienceLevel('');
    setSalaryRange([0, 1000000]);
    setIsRemoteOnly(false);
    setSelectedCompany('');
    // Clear URL params
    window.history.replaceState({}, '', '/jobs');
  };

  const handleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Mock categories data
  const categories = [
    { id: '1', name: 'Technology', slug: 'technology' },
    { id: '2', name: 'Marketing', slug: 'marketing' },
    { id: '3', name: 'Design', slug: 'design' },
    { id: '4', name: 'Sales', slug: 'sales' },
    { id: '5', name: 'Finance', slug: 'finance' }
  ];

  // Separate featured and regular jobs
  const featuredJobs = jobs?.filter(job => job.is_featured) || [];
  const regularJobs = jobs?.filter(job => !job.is_featured) || [];
  const remoteJobsCount = jobs?.filter(job => job.is_remote).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <JobsHeader 
          jobsCount={jobs?.length || 0}
          remoteJobsCount={remoteJobsCount}
          featuredJobsCount={featuredJobs.length}
          categoriesCount={categories.length}
        />
        
        <div className="mb-8">
          <JobsCategories categories={categories} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <EnhancedJobFilters
              filters={{
                search: searchQuery,
                location: selectedLocation,
                employment_type: selectedEmploymentType ? [selectedEmploymentType] : [],
                experience_level: selectedExperienceLevel ? [selectedExperienceLevel] : [],
                salary_min: salaryRange[0],
                salary_max: salaryRange[1],
                is_remote: isRemoteOnly,
                skills: []
              }}
              onFiltersChange={(filters) => {
                setSearchQuery(filters.search);
                setSelectedLocation(filters.location);
                setSelectedEmploymentType(filters.employment_type[0] || '');
                setSelectedExperienceLevel(filters.experience_level[0] || '');
                setSalaryRange([filters.salary_min, filters.salary_max]);
                setIsRemoteOnly(filters.is_remote);
              }}
              onClearFilters={resetFilters}
            />
          </div>
          
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-48 bg-white rounded-lg shadow animate-pulse"></div>
                ))}
              </div>
            ) : jobs && jobs.length > 0 ? (
              <JobsList 
                jobs={jobs}
                featuredJobs={featuredJobs}
                regularJobs={regularJobs}
                savedJobs={savedJobs}
                sortBy={sortBy}
                setSortBy={setSortBy}
                isLoading={isLoading}
                onSaveJob={handleSaveJob}
                onClearFilters={resetFilters}
              />
            ) : (
              <EmptyJobsState 
                onResetFilters={resetFilters}
                onUpdateResume={() => window.open('/resume', '_blank')}
                onSetAlerts={() => console.log('Set alerts')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
