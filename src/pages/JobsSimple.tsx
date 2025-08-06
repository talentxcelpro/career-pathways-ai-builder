import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobsList } from '@/components/jobs/JobsList';
import { SEOHead } from '@/components/seo/SEOHead';
import { JobCategories } from '@/components/jobs/JobCategories';

interface JobsSimpleProps {
  roleFilter?: string;
  locationFilter?: string;
  skillFilter?: string;
}

const JobsSimple: React.FC<JobsSimpleProps> = ({ roleFilter, locationFilter, skillFilter }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from props or URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: locationFilter || searchParams.get('location') || '',
    category: roleFilter || searchParams.get('category') || '',
    skill: skillFilter || searchParams.get('skill') || '',
    employmentType: searchParams.get('employmentType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    salaryRange: searchParams.get('salaryRange') || '',
    workMode: searchParams.get('workMode') || '',
    isRemote: searchParams.get('isRemote') === 'true'
  });

  const [sortBy, setSortBy] = useState('posted_at');
  const [currentPage, setCurrentPage] = useState(1);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      search: '',
      location: locationFilter || '',
      category: roleFilter || '',
      skill: skillFilter || '',
      employmentType: '',
      experienceLevel: '',
      salaryRange: '',
      workMode: '',
      isRemote: false
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    setSearchParams({});
  }, [setSearchParams, roleFilter, locationFilter, skillFilter]);

  return (
    <>
      {!roleFilter && !locationFilter && !skillFilter && (
        <SEOHead
          title="Find Your Dream Job | TalentXcel - Latest Job Opportunities in India"
          description="Discover thousands of job opportunities across India. From tech to government, find your perfect career match on TalentXcel. Apply now!"
          keywords={['jobs', 'careers', 'employment', 'hiring', 'job search', 'India jobs', 'TalentXcel']}
          canonical="https://talentxcel.in/jobs"
        />
      )}
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {!roleFilter && !locationFilter && !skillFilter && <JobCategories />}
        
        <div className="space-y-6">
          <JobFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={clearFilters}
          />
          
          <JobsList
            jobs={[]}
            isLoading={false}
          />
        </div>
      </div>
    </>
  );
};

export default JobsSimple;