
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { JobStatsCards } from '@/components/admin/jobs/JobStatsCards';
import { JobFilters } from '@/components/admin/jobs/JobFilters';
import { JobsList } from '@/components/admin/jobs/JobsList';
import { JobScraperControl } from '@/components/admin/JobScraperControl';
import { BulkJobUpload } from '@/components/admin/jobs/BulkJobUpload';
import { SitemapGenerator } from '@/components/seo/SitemapGenerator';
import { useJobsManagement } from '@/hooks/useJobsManagement';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';

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
  
  const [isPostingJobs, setIsPostingJobs] = useState(false);

  const handlePostTalentXcelJobs = async () => {
    setIsPostingJobs(true);
    try {
      const talentxcelJobs = [
        {
          title: "IT Helpdesk Executive – Fresher",
          company_name: "TalentXcel",
          company_id: "54e7fc5a-792d-46a9-8413-171cc3fe507f",
          location: "Noida",
          description: `Join TalentXcel as an IT Helpdesk Executive. Provide first-line IT support, troubleshoot hardware/software issues, and gain enterprise exposure.`,
          employment_type: "full_time",
          experience_level: "fresher",
          salary_min: 220000,
          salary_max: 300000,
          salary_currency: "INR",
          skills_required: ["Windows", "Linux", "macOS", "ITSM", "Networking"],
          job_status: "open",
          is_active: true,
          is_remote: false,
          seo_slug: "it-helpdesk-executive-fresher-noida-talentxcel",
          posted_by: "5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_tags: ["IT Support", "Helpdesk", "Fresher"],
          benefits: ["Training", "Career Growth", "Mentorship"]
        }
      ];

      for (const job of talentxcelJobs) {
        const { error } = await supabase.from('jobs').insert([job]);
        if (error) throw error;
      }

      toast.success(`Successfully posted ${talentxcelJobs.length} TalentXcel IT jobs!`);
    } catch (error) {
      console.error('Error posting jobs:', error);
      toast.error('Failed to post jobs');
    } finally {
      setIsPostingJobs(false);
    }
  };

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
        
        <div className="flex justify-end">
          <Button 
            onClick={handlePostTalentXcelJobs}
            disabled={isPostingJobs}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isPostingJobs ? 'Posting...' : 'Post TalentXcel IT Jobs'}
          </Button>
        </div>
        
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
