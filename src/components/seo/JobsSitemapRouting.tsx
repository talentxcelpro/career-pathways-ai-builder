import React from 'react';
import { Route } from 'react-router-dom';
import { JobsByRoleCity } from '@/pages/seo/jobs/JobsByRoleCity';
import { JobsByRoleIndustryCity } from '@/pages/seo/jobs/JobsByRoleIndustryCity';
import { JobsByRoleSkillCityLevel } from '@/pages/seo/jobs/JobsByRoleSkillCityLevel';
import { JobsByRoleSalaryCity } from '@/pages/seo/jobs/JobsByRoleSalaryCity';
import { JobsByRemoteRoleCity } from '@/pages/seo/jobs/JobsByRemoteRoleCity';
import { JobsByCompanyRoleCity } from '@/pages/seo/jobs/JobsByCompanyRoleCity';
import { JobsLandingPage } from '@/pages/seo/jobs/JobsLandingPage';

/**
 * Comprehensive Jobs Sitemap Routing System
 * Handles millions of dynamic job-related URLs for maximum SEO impact
 * 
 * URL Patterns Supported:
 * - /jobs/[role]/[city] 
 * - /jobs/[role]/[industry]/[city]
 * - /jobs/[role]/[skill]/[city]/[experience-level]
 * - /jobs/[role]/[salary-range]/[city]
 * - /jobs/remote/[role]/[city]
 * - /jobs/top-companies/[company]/[role]/[city]
 * 
 * Potential Pages: 900 cities × 500 roles × 200 skills × 5 levels = 450M+ URLs
 */
export const JobsSitemapRoutes = () => {
  return (
    <>
      {/* Main Jobs Landing Page */}
      <Route path="/jobs" element={<JobsLandingPage />} />
      
      {/* Basic Role + City Pattern: /jobs/software-engineer/bangalore */}
      <Route 
        path="/jobs/:role/:city" 
        element={<JobsByRoleCity />} 
      />
      
      {/* Role + Industry + City: /jobs/marketing-manager/retail/delhi */}
      <Route 
        path="/jobs/:role/:industry/:city" 
        element={<JobsByRoleIndustryCity />} 
      />
      
      {/* Role + Skill + City + Experience: /jobs/data-scientist/python/mumbai/entry-level */}
      <Route 
        path="/jobs/:role/:skill/:city/:experienceLevel" 
        element={<JobsByRoleSkillCityLevel />} 
      />
      
      {/* Role + Salary Range + City: /jobs/software-developer/5-10lpa/bangalore */}
      <Route 
        path="/jobs/:role/:salaryRange/:city" 
        element={<JobsByRoleSalaryCity />} 
      />
      
      {/* Remote Jobs: /jobs/remote/project-manager/pune */}
      <Route 
        path="/jobs/remote/:role/:city" 
        element={<JobsByRemoteRoleCity />} 
      />
      
      {/* Top Companies: /jobs/top-companies/google/software-engineer/bangalore */}
      <Route 
        path="/jobs/top-companies/:company/:role/:city" 
        element={<JobsByCompanyRoleCity />} 
      />
    </>
  );
};

// Export individual route components for lazy loading
export { 
  JobsByRoleCity,
  JobsByRoleIndustryCity, 
  JobsByRoleSkillCityLevel,
  JobsByRoleSalaryCity,
  JobsByRemoteRoleCity,
  JobsByCompanyRoleCity,
  JobsLandingPage
};