
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { JobStatsCards } from '@/components/admin/jobs/JobStatsCards';
import { JobFilters } from '@/components/admin/jobs/JobFilters';
import { JobsList } from '@/components/admin/jobs/JobsList';
import { JobScraperControl } from '@/components/admin/JobScraperControl';
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
    jobStats,
    filteredJobs
  } = useJobsManagement();

  return (
    <UnifiedAdminLayout 
      title="Jobs Management" 
      description="Manage job postings and categories"
    >
      <div className="space-y-8">
        <JobScraperControl />
        
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
        />
      </div>
    </UnifiedAdminLayout>
  );
};

export default JobsManagement;
