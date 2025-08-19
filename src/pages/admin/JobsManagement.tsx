
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { JobStatsCards } from '@/components/admin/jobs/JobStatsCards';
import { JobFilters } from '@/components/admin/jobs/JobFilters';
import { JobsList } from '@/components/admin/jobs/JobsList';
import { JobScraperControl } from '@/components/admin/JobScraperControl';
import { BulkJobUpload } from '@/components/admin/jobs/BulkJobUpload';
import { SitemapGenerator } from '@/components/seo/SitemapGenerator';
import { useJobsManagement } from '@/hooks/useJobsManagement';

const JobsManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    isLoading,
    error,
    jobStats,
    filteredJobs
  } = useJobsManagement();

  if (error) {
    console.error('Jobs management error:', error);
  }

  return (
    <UnifiedAdminLayout 
      title="Jobs Management" 
      description="Manage job postings and categories"
    >
      <div className="space-y-8">
        <JobScraperControl />
        
        <BulkJobUpload />
        
        <SitemapGenerator />
        
        <JobStatsCards jobStats={jobStats} />
        
        <JobFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          filteredJobs={filteredJobs}
        />

        <JobsList
          jobs={filteredJobs}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </UnifiedAdminLayout>
  );
};

export default JobsManagement;
